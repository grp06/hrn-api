import * as Sentry from '@sentry/node'
import './services/cron-service'
import 'isomorphic-fetch'
import bodyParser from 'body-parser'
import cors from 'cors'
import dotenv from 'dotenv'
import es6Promise from 'es6-promise'
import express, { ErrorRequestHandler } from 'express'
import morgan from 'morgan'

import { NODE_ENV, PORT } from './config'
import * as discord from './discord-bots/new-host'
import { takeUserOffStage, deleteRoomChats, deleteRoomById, insertRoomUser } from './gql/mutations'
import { getRoomById } from './gql/queries'
import getRoomModeCronjobs, { GetRoomModeCronjobs } from './gql/queries/getRoomModeCronjobs'
import logger from './logger'
import router from './routes/router'
import { startApolloServer } from './server-graphql'
import orm from './services/orm'
import { initNextRound } from './services/room-modes/speed-rounds'

/**
 * Initialise & configure libraries
 */
dotenv.config()
es6Promise.polyfill()

const app = express().set('view engine', 'ejs')
discord.newHost()

Sentry.init({ dsn: 'https://c9f54122fb8e4de4b52f55948a091e2b@o408346.ingest.sentry.io/5279031' })

// TODO: this must be defined in another way, using a class maybe
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
global.__logger = logger
// eslint-disable-next-line no-underscore-dangle,@typescript-eslint/ban-ts-comment
// @ts-ignore
// eslint-disable-next-line no-underscore-dangle
global.__Sentry = Sentry

/**
 * Set middlewares
 */
// The request handler must be the first middleware on the app
app.use(Sentry.Handlers.requestHandler())

app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
app.use(morgan(NODE_ENV === 'production' ? 'tiny' : 'common'))
app.use(cors())

/**
 * Import routes
 */
app.use(router)

/**
 * Error handlers
 */
// The error handler must be before any other error middleware
app.use(Sentry.Handlers.errorHandler())
console.log('app loading...')
app.use(((error, req, res, next) => {
  let response
  if (NODE_ENV === 'production') {
    response = { error: { message: 'server error' } }
  } else {
    console.error(error)
    response = { message: error.message, error }
  }
  res.status(500).json(response)
}) as ErrorRequestHandler)

// Start the sever
startApolloServer(app, PORT).then()

// TODO: move definition
const checkForInterruptedEvents = async () => {
  // query the cronJobs table. If there's anything in there at all, it means there's an event in progress
  // when an event ends we remove it from this table
  try {
    const cronJobs: GetRoomModeCronjobs = await orm.request(getRoomModeCronjobs)

    if (cronJobs.data.room_mode_cronjobs.length) {
      cronJobs.data.room_mode_cronjobs.forEach((cronJob) => {
        initNextRound({
          totalRounds: cronJob.room_mode.total_rounds,
          roomId: cronJob.room_id,
          roomModeId: cronJob.room_modes_id,
          roundLength: cronJob.room_mode.round_length,
          roundNumber: cronJob.round_number,
          nextRoundStart: cronJob.timestamp,
        })
      })
    }

    console.log('(checkForInterruptedEvents) Cronjobs data:', cronJobs.data.room_mode_cronjobs)
  } catch (error) {
    console.log('🚀 ~ checkForInterruptedEvents ~ error', error)
  }
}

app.post('/status-callbacks', async (req, res) => {
  const { StatusCallbackEvent, ParticipantIdentity, RoomName, RoomStatus } = req.body
  console.log(
    `userId ${ParticipantIdentity} fired event ${StatusCallbackEvent} for roomId ${RoomName} ... room status is ${RoomStatus}`
  )
  // when STatusCallbackEvent is "room-ended" delete all chats for that roomId

  switch (StatusCallbackEvent) {
    case 'participant-disconnected':
      // take the user off the stage and set their last_seen to null
      try {
        await orm.request(takeUserOffStage, {
          userId: ParticipantIdentity,
          roomId: RoomName,
        })
      } catch (error) {
        console.log('🚀 ~ error taking user off stage', error)
      }
      break
    case 'room-ended':
      try {
        orm.request(deleteRoomChats, {
          roomId: RoomName,
        })

        const getRoomByIdRes = await orm.request(getRoomById, {
          roomId: RoomName,
        })
        // if this user hasn't yet set up a password, then when their room ends, it gets deleted
        const roomIsClaimed = getRoomByIdRes.data.rooms[0]?.owner.password
        if (!roomIsClaimed) {
          console.log('DELETING ROOM')

          orm.request(deleteRoomById, {
            roomId: RoomName,
          })
        }
      } catch (error) {
        console.log('🚀 ~ error deleting room by Id', error)
      }
      break
    case 'participant-connected':
      // on participant-connected, add user to room_users
      console.log('🚀 ~ app.post ~ ParticipantIdentity', ParticipantIdentity)
      console.log('🚀 ~ app.post ~ RoomName', RoomName)

      try {
        const insertRoomUserRes = await orm.request(insertRoomUser, {
          objects: {
            room_id: RoomName,
            user_id: ParticipantIdentity,
          },
        })

        if (insertRoomUserRes.errors) {
          throw new Error(insertRoomUserRes.errors[0].message)
        }
        console.log('🚀 ~ app.post ~ insertRoomUserRes', insertRoomUserRes)
      } catch (error) {
        console.log('error = ', error)
      }
      break
    default:
      console.log(`default`)
  }
})

checkForInterruptedEvents().then()

module.exports = app
