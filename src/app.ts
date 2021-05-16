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
import { createToken } from './extensions/jwtHelper'
import {
  insertRoomMode,
  insertUser,
  insertRoom,
  insertRoomUser,
  updateRoom,
  insertRoomChatMessage,
  updateRoomName,
} from './gql/mutations'
import logger from './logger'
import router from './routes/router'
import { startApolloServer } from './server-graphql'
import orm from './services/orm'

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
    const insertRoomModeReq = await orm.request(insertRoomMode, {
      objects: {
        round_number: null,
        round_length: null,
        total_rounds: null,
      },
    })
    console.log('🚀 ~ app.post ~ insertRoomModeReq', insertRoomModeReq)
    const roomModesResponse = insertRoomModeReq.data.insert_room_modes.returning[0]
    console.log('🚀 ~ app.post ~ roomModesResponse', roomModesResponse)

    if (insertRoomModeReq.errors) {
      throw new Error(insertRoomModeReq.errors[0].message)
    }

    const insertUserReq = await orm.request(insertUser, {
      objects: {
        first_name: firstName,
      },
    })
    const insertUserResponse = insertUserReq.data.insert_users.returning[0]
    console.log('🚀 ~ app.post ~ insertUserResponse', insertUserResponse)
    const { created_at, email, first_name, last_name, id: ownerId, role } = insertUserResponse
    if (insertUserReq.errors) {
      throw new Error(insertUserReq.errors[0].message)
    }
    const insertRoomReq = await orm.request(insertRoom, {
      objects: {
        name: roomName,
        room_modes_id: roomModesResponse.id,
        owner_id: ownerId,
      },
    })

    console.log('🚀 ~ app.post ~ insertRoomReq', insertRoomReq)
    const insertRoomResponse = insertRoomReq.data.insert_rooms.returning[0]
    console.log('🚀 ~ app.post ~ insertRoomResponse', insertRoomResponse)

    if (insertRoomReq.errors) {
      console.log('🚀 ~ app.post ~ insertRoomReq.errors', insertRoomReq.errors)
      if (insertRoomReq.errors[0].message.indexOf('rooms_name_key') > -1) {
        return res.json({ success: false, error: 'room name unavailable' })
      }
      if (insertUserReq.errors) {
        throw new Error(insertUserReq.errors[0].message)
      }
    }
    const roomId = insertRoomReq.data.insert_rooms.returning[0].id

    const insertRoomUserReq = await orm.request(insertRoomUser, {
      objects: {
        room_id: insertRoomResponse.id,
        user_id: insertUserResponse.id,
      },
    })
    console.log('🚀 ~ app.post ~ insertRoomUserReq', insertRoomUserReq)
    const insertRoomUserResponse = insertRoomUserReq.data.insert_room_users.returning[0]
    console.log('🚀 ~ app.post ~ insertRoomUserResponse', insertRoomUserResponse)

    const { last_seen, updated_at } = insertRoomUserResponse

    if (insertRoomUserReq.errors) {
      throw new Error(insertRoomUserReq.errors[0].message)
    }
    console.log('roomModesResponse ', roomModesResponse)
    const {
      id: room_modes_id,
      break_time,
      mode_name,
      round_length,
      round_number,
      total_rounds,
    } = roomModesResponse
    console.log('🚀 ~ app.post ~ roomModesResponse', roomModesResponse)

    return res.json({
      break_time,
      created_at,
      email,
      error: null,
      first_name,
      last_name,
      last_seen,
      mode_name,
      owner_id: ownerId,
      role,
      roomId,
      roomName,
      room_modes_id,
      round_length,
      round_number,
      token: await createToken(insertUserResponse, process.env.SECRET),
      total_rounds,
      updated_at,
    })
  } catch (error) {
    console.log('error = ', error)

    return res.json({ success: false })
  }
})

// Request Handler
app.post('/change-room-mode', async (req, res) => {
  // get request input
  const {
    roomId,
    modeName,
    totalRounds = null,
    roundNumber = null,
    roundLength = null,
  } = req.body.input.input

  try {
    // insert a new row into the room_mode table
    const insertRoomModeReq = await orm.request(insertRoomMode, {
      objects: {
        mode_name: modeName,
        round_number: roundNumber,
        round_length: roundLength,
        total_rounds: totalRounds,
      },
    })
    console.log('🚀 ~ app.post ~ insertRoomModeReq', insertRoomModeReq)

    if (insertRoomModeReq.errors) {
      throw new Error(insertRoomModeReq.errors[0].message)
    }

    // grab the id from the row we just inserted
    const insertRoomModeResponse = insertRoomModeReq.data.insert_room_modes.returning[0]
    const { room_modes_id } = insertRoomModeResponse
    console.log('🚀 ~ app.post ~ roomModesId', insertRoomModeResponse)

    // make sure to use that id to update the room_modes_id on the room table
    const updateRoomReq = await orm.request(updateRoom, {
      roomId,
      roomModesId: insertRoomModeResponse.id,
    })
    const updateRoomRes = updateRoomReq.data.update_room.returning[0]
    console.log('🚀 ~ app.post ~ updateRoomRes', updateRoomRes)

    // set timeout for 30 seconds

    // do everything needed for speed_chats
    // get online users
    // make assignments
    // insert into partners table
    //

    // set `break` to false after 30 seconds elapses
    // round number to 1

    // and start all your complicated cron job logic stuff

    // setTimeout for round_length

    // wait 5 mins

    /// set break to true
    // wait 20 seconds

    // set break to false

    // wait 5 mins
    // success
    const { mode_name, round_length, round_number, total_rounds } = insertRoomModeResponse

    return res.json({
      mode_name,
      room_modes_id,
      round_length,
      round_number,
      total_rounds,
    })
  } catch (error) {
    return res.status(400).json({
      error,
    })
  }
})

// Request Handler
app.post('/send-chat-to-room', async (req, res) => {
  // get request input
  const { senderId, roomId, content } = req.body.input.input
  let messageId
  try {
    const insertRoomChatMessageRes = await orm.request(insertRoomChatMessage, {
      senderId,
      roomId,
      content,
    })
    console.log('🚀 ~ app.post ~ insertRoomChatMessageRes', insertRoomChatMessageRes)
    messageId = insertRoomChatMessageRes.data.insert_room_chat_messages.returning[0].id
    console.log('🚀 ~ app.post ~ messageId', messageId)

    if (insertRoomChatMessageRes.errors) {
      throw new Error(insertRoomChatMessageRes.errors[0].message)
    }
  } catch (error) {
    console.log('error = ', error)
    return res.status(400).json({
      error,
    })
  }
  return res.json({
    messageId,
  })
})

// Request Handler
app.post('/update-room-name', async (req, res) => {
  // get request input
  const { name, roomId } = req.body.input

  try {
    const updateRoomNameRes = await orm.request(updateRoomName, {
      name,
      roomId,
    })
    console.log('🚀 ~ app.post ~ insertRoomChatMessageRes', updateRoomNameRes)

    if (updateRoomNameRes.errors) {
      throw new Error(updateRoomNameRes.errors[0].message)
    }
  } catch (error) {
    console.log('error = ', error)
    return res.status(400).json({
      error,
    })
  }
  return res.json({
    success: true,
    error: null,
  })
})

module.exports = app
