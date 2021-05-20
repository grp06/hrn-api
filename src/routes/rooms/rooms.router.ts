/**
 * Rooms router v2
 */
import * as Sentry from '@sentry/node'
import { CronJob } from 'cron'
import express from 'express'
import moment from 'moment'

import { createToken } from '../../extensions/jwtHelper'
import {
  insertRoom,
  insertRoomMode,
  insertRoomUser,
  insertUser,
  updateRoom,
  insertRoomChatMessage,
} from '../../gql/mutations'
import updateRoomMode from '../../gql/mutations/updateRoomMode'
import updateRoomModeBreak from '../../gql/mutations/updateRoomModeBreak'
import jobs from '../../services/jobs'
import orm from '../../services/orm'
import { initSpeedRounds } from '../../services/room-modes/speed-rounds'

const roomsRouter = express.Router()

roomsRouter.post('/send-group-chat', async (req, res) => {
  const { senderId, roomId, content } = req.body.input.input
  let messageId
  try {
    const insertRoomChatMessageRes = await orm.request(insertRoomChatMessage, {
      senderId,
      roomId,
      content,
    })

    if (insertRoomChatMessageRes.errors) {
      throw new Error(insertRoomChatMessageRes.errors[0].message)
    }
    return res.json({
      ...insertRoomChatMessageRes.data.insert_room_chat_messages.returning[0],
    })
  } catch (error) {
    console.log('error = ', error)
    return res.status(400).json({
      message: 'couldnt send message',
    })
  }
})

/**
 * Create a room
 */
roomsRouter.post('/create-room', async (req, res) => {
  // TODO: add transactions
  try {
    const { firstName, roomName } = req.body || {}

    // Create a room mode
    const roomModeRes = await orm.request(insertRoomMode, {
      objects: {
        round_number: null,
        round_length: null,
        total_rounds: null,
      },
    })

    console.log('🚀 ~ roomsRouter.post ~ roomModeRes', roomModeRes)

    if (roomModeRes.errors) {
      throw new Error(roomModeRes.errors[0].message)
    }

    // Create a guest user
    const insertUserRes = await orm.request(insertUser, {
      objects: {
        first_name: firstName,
      },
    })

    console.log('🚀 ~ roomsRouter.post ~ insertUserRes', insertUserRes)

    if (insertUserRes.errors) {
      throw new Error(insertUserRes.errors[0].message)
    }

    // Create room
    const insertRoomRes = await orm.request(insertRoom, {
      objects: {
        name: roomName,
        room_modes_id: roomModeRes.data.insert_room_modes.returning[0].id,
        owner_id: insertUserRes.data.insert_users.returning[0].id,
      },
    })

    console.log('🚀 ~ roomsRouter.post ~ insertRoomRes', insertRoomRes)

    if (insertRoomRes.errors) {
      if (insertRoomRes.errors[0].message.indexOf('rooms_name_key') > -1) {
        return res.json({ success: false, error: 'room name unavailable' })
      }
      if (insertUserRes.errors) {
        throw new Error(insertUserRes.errors[0].message)
      }
    }

    // Add the owner as a room user
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
    console.error('Error: ', error)

    return res.json({ success: false })
  }

  return res.json({
    success: true,
  })
})

/**
 * Create a guest user in a room
 * TODO: move part of this to the user router/service
 */
roomsRouter.post('/create-guest-user', async (req, res) => {
  // get request input
  console.log('----CREATE GUEST USER -----')

  const { firstName, roomId } = req.body.input
  try {
    const insertUserRes = await orm.request(insertUser, {
      objects: {
        first_name: firstName,
      },
    })
    const newUser = insertUserRes.data.insert_users.returning[0]
    console.log('🚀 ~ roomsRouter.post ~ insertUserRes', insertUserRes)
    if (insertUserRes.errors) {
      throw new Error(insertUserRes.errors[0].message)
    }

    const insertRoomUserRes = await orm.request(insertRoomUser, {
      objects: {
        room_id: roomId,
        user_id: newUser.id,
      },
    })

    if (insertRoomUserRes.errors) {
      throw new Error(insertRoomUserRes.errors[0].message)
    }

    // success
    return res.json({
      ...insertUserRes.data.insert_users.returning[0],
      token: await createToken(newUser, process.env.SECRET),
    })
  } catch (error) {
    console.log('🚀 error', typeof error.toString())
    return res.status(400).json({
      message: error.toString(),
    })
  }
})

/**
 * Change room mode
 */
roomsRouter.post('/change-room-mode', async (req, res) => {
  try {
    // get request input
    const { roomId, modeName, totalRounds = null, roundLength = null } = req.body
    const roundNumber = 1

    // TODO: check params, should we add defaults for totalRounds & roundLength

    // insert a new row into the room_mode table
    const roomModeRes = await orm.request(insertRoomMode, {
      objects: {
        round_number: 1,
        round_length: roundLength,
        total_rounds: totalRounds,
        mode_name: modeName,
      },
    })

    console.log('🚀 ~ roomsRouter.post ~ roomModeRes', roomModeRes)

    if (roomModeRes.errors) {
      throw new Error(roomModeRes.errors[0].message)
    }

    // grab the id from the row we just inserted
    const roomModesId = roomModeRes.data.insert_room_modes.returning[0].id
    console.log('🚀 ~ roomsRouter.post ~ roomModesId', roomModesId)

    // make sure to use that id to update the room_modes_id on the room table
    const updateRoomRes = await orm.request(updateRoom, {
      roomId,
      roomModesId,
    })
    console.log('🚀 ~ roomsRouter.post ~ updateRoomRes', updateRoomRes)

    // make sure to use that id to update the room_modes_id on the room table

    // Update the room mode status

    /**
     * Start the round in 30 seconds
     */

    // Start the break
    const updatedRoomModeRes = await orm.request(updateRoomMode, {
      roomModeId: roomModesId,
      break: true,
      roundNumber,
    })

    console.log('(updatedRoomModeRes) We started the break:', updatedRoomModeRes)

    const countdownSeconds = 5
    const countdown = moment().add(countdownSeconds, 'seconds')

    jobs.countdown[roomId] = new CronJob(countdown, async () => {
      console.log('(updatedRoomModeRes->cronJob) We started the break:', roomId)

      await initSpeedRounds({
        roomId,
        roomModeId: roomModesId,
        roundNumber,
        roundLength,
        totalRounds,
      })

      jobs.countdown[roomId].stop()
    })

    jobs.countdown[roomId].start()
  } catch (error) {
    console.log(error)
    return res.status(400).json({
      message: error.toString(),
    })
  }

  // success
  return res.json({
    success: true,
  })
})

export default roomsRouter
