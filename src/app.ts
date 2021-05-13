import * as Sentry from '@sentry/node'
import './services/cron-service'
import 'isomorphic-fetch'
import bodyParser from 'body-parser'
import cors from 'cors'
import dotenv from 'dotenv'
import es6Promise from 'es6-promise'
import express, { ErrorRequestHandler } from 'express'

import { insertRoomMode, insertUser, insertRoom, insertRoomUser } from './gql/mutations'

import morgan from 'morgan'

import { NODE_ENV, PORT } from './config'
import * as discord from './discord-bots/new-host'
import { getCronJobs } from './gql/queries'
import logger from './logger'
import router from './routes/router'
import { startApolloServer } from './server-graphql'
import orm from './services/orm'
import initNextRound from './services/rooms/initNextRound'

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

app.post('/create-room', async (req, res) => {
  const { firstName, roomName } = req.body.input

  try {
    const roomModeRes = await orm.request(insertRoomMode, {
      objects: {
        round_number: null,
        round_length: null,
        total_rounds: null,
      },
    })
    console.log('🚀 ~ app.post ~ roomModeRes', roomModeRes)

    if (roomModeRes.errors) {
      throw new Error(roomModeRes.errors[0].message)
    }

    const insertUserRes = await orm.request(insertUser, {
      objects: {
        first_name: firstName,
      },
    })
    console.log('🚀 ~ app.post ~ insertUserRes', insertUserRes)
    if (insertUserRes.errors) {
      throw new Error(insertUserRes.errors[0].message)
    }

    const insertRoomRes = await orm.request(insertRoom, {
      objects: {
        name: roomName,
        room_modes_id: roomModeRes.data.insert_room_modes.returning[0].id,
        owner_id: insertUserRes.data.insert_users.returning[0].id,
      },
    })
    console.log('🚀 ~ app.post ~ insertRoomRes', insertRoomRes)

    if (insertRoomRes.errors) {
      if (insertRoomRes.errors[0].message.indexOf('rooms_name_key') > -1) {
        return res.json({ success: false, message: 'room name unavailable' })
      }
      if (insertUserRes.errors) {
        throw new Error(insertUserRes.errors[0].message)
      }
    }

    const insertRoomUserRes = await orm.request(insertRoomUser, {
      objects: {
        room_id: insertRoomRes.data.insert_rooms.returning[0].id,
        user_id: insertUserRes.data.insert_users.returning[0].id,
      },
    })

    if (insertRoomUserRes.errors) {
      throw new Error(insertRoomUserRes.errors[0].message)
    }
  } catch (error) {
    console.log('error = ', error)

    return res.json({ success: false })
  }

  return res.json({
    success: true,
  })
})

// Request Handler
app.post('/create-guest-user', async (req, res) => {
  // get request input
  const { firstName, roomId } = req.body.input
  try {
    const insertUserRes = await orm.request(insertUser, {
      objects: {
        first_name: firstName,
      },
    })
    console.log('🚀 ~ app.post ~ insertUserRes', insertUserRes)
    if (insertUserRes.errors) {
      throw new Error(insertUserRes.errors[0].message)
    }

    const insertRoomUserRes = await orm.request(insertRoomUser, {
      objects: {
        room_id: roomId,
        user_id: insertUserRes.data.insert_users.returning[0].id,
      },
    })

    if (insertRoomUserRes.errors) {
      throw new Error(insertRoomUserRes.errors[0].message)
    }
  } catch (error) {
    return res.status(400).json({
      success: false,
    })
  }

  // success
  return res.json({
    success: true,
  })
})

// // TODO: move definition
// const checkForInterruptedEvents = async () => {
//   // query the cronJobs table. If there's anything in there at all, it means there's an event in progress
//   // when an event ends we remove it from this table
//   const cronJobs = await orm.request(getCronJobs)

//   console.log('checking for interrupted events')
//   console.log('cronJobs.data.cron_jobs = ', cronJobs.data.cron_jobs)

//   if (cronJobs.data.cron_jobs.length) {
//     // eslint-disable-next-line @typescript-eslint/ban-ts-comment
//     // @ts-ignore
//     cronJobs.data.cron_jobs.forEach((event) => {
//       console.log('🚀 ~ app.post ~ error', error)
//       console.log('🚀 ~ app.post ~ error', error)
//       console.log('🚀 ~ app.post ~ error', error)
//       const { next_round_start: nextRoundStart } = event
//       const {
//         num_rounds: numRounds,
//         id: eventId,
//         round_length,
//         current_round: currentRound,
//       } = event.event
//       const roundLength = round_length * 60000
//       initNextRound({ numRounds, eventId, roundLength, currentRound, nextRoundStart })
//     })
//   }
// }

// checkForInterruptedEvents().then()

module.exports = app
