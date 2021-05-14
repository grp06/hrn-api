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
        return res.json({ success: false, error: 'room name unavailable' })
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
    const roomModeRes = await orm.request(insertRoomMode, {
      objects: {
        round_number: roundNumber,
        round_length: roundLength,
        total_rounds: totalRounds,
        mode_name: modeName,
      },
    })
    console.log('🚀 ~ app.post ~ roomModeRes', roomModeRes)

    if (roomModeRes.errors) {
      throw new Error(roomModeRes.errors[0].message)
    }

    // grab the id from the row we just inserted
    const roomModesId = roomModeRes.data.insert_room_modes.returning[0].id
    console.log('🚀 ~ app.post ~ roomModesId', roomModesId)

    // make sure to use that id to update the room_modes_id on the room table
    const updateRoomRes = await orm.request(updateRoom, {
      roomId,
      roomModesId,
    })
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
