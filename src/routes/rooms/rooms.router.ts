/**
 * Rooms router v2
 */
import * as Sentry from '@sentry/node'
import { CronJob } from 'cron'
import express from 'express'
import moment from 'moment'
import slug from 'slug'

import { createToken } from '../../extensions/jwtHelper'
import {
  insertRoom,
  insertRoomMode,
  insertRoomUser,
  insertUser,
  updateRoom,
} from '../../gql/mutations'
import deleteRoomModeCron from '../../gql/mutations/deleteRoomModeCron'
import updateRoomMode from '../../gql/mutations/updateRoomMode'
import updateRoomModeBreak from '../../gql/mutations/updateRoomModeBreak'
import { findUserById } from '../../gql/queries'
import jobs from '../../services/jobs'
import orm from '../../services/orm'
import { initSpeedRounds } from '../../services/room-modes/speed-rounds'

const roomsRouter = express.Router()

/**
 * Create a room
 */
roomsRouter.post('/create-room', async (req, res) => {
  const { firstName, roomName } = req.body.input
  console.log('🚀 ~ roomsRouter.post ~ roomName', roomName)
  console.log('🚀 ~ roomsRouter.post ~ firstName', firstName)

  const roomSlug = slug(roomName)
  console.log('🚀 ~ roomsRouter.post ~ roomSlug', roomSlug)

  try {
    const insertRoomModeReq = await orm.request(insertRoomMode, {
      objects: {
        round_number: null,
        round_length: null,
        total_rounds: null,
      },
    })
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
    const { id: ownerId } = insertUserResponse
    if (insertUserReq.errors) {
      throw new Error(insertUserReq.errors[0].message)
    }
    const insertRoomReq = await orm.request(insertRoom, {
      objects: {
        name: roomName,
        slug: roomSlug,
        room_modes_id: roomModesResponse.id,
        owner_id: ownerId,
      },
    })

    console.log('🚀 ~ app.post ~ insertRoomReq', insertRoomReq)

    if (insertRoomReq.errors) {
      if (insertRoomReq.errors[0].message.indexOf('rooms_name_key') > -1) {
        return res.status(400).json({ message: 'room name unavailable' })
      }
    }

    const insertRoomResponse = insertRoomReq.data.insert_rooms.returning[0]
    console.log('🚀 ~ app.post ~ insertRoomResponse', insertRoomResponse)

    const roomId = insertRoomReq.data.insert_rooms.returning[0].id

    const insertRoomUserReq = await orm.request(insertRoomUser, {
      objects: {
        room_id: insertRoomResponse.id,
        user_id: insertUserResponse.id,
      },
    })
    const insertRoomUserResponse = insertRoomUserReq.data.insert_room_users.returning[0]
    console.log('🚀 ~ app.post ~ insertRoomUserResponse', insertRoomUserResponse)

    const { id: roomUserId } = insertRoomUserResponse

    if (insertRoomUserReq.errors) {
      throw new Error(insertRoomUserReq.errors[0].message)
    }
    console.log('roomModesResponse ', roomModesResponse)
    const { id: roomModeId } = roomModesResponse
    console.log('🚀 ~ app.post ~ roomModesResponse', roomModesResponse)

    return res.json({
      roomId,
      roomModeId,
      roomUserId,
      token: await createToken(insertUserResponse, process.env.SECRET),
    })
  } catch (error) {
    console.log('error = ', error)

    return res.status(400).json({ message: 'couldnt create room' })
  }
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
    console.log('🚀 ~ roomsRouter.post ~ insertRoomUserRes', insertRoomUserRes)

    if (insertRoomUserRes.errors) {
      throw new Error(insertRoomUserRes.errors[0].message)
    }

    // success
    return res.json({
      userId: newUser.id,
      token: await createToken(newUser, process.env.SECRET),
    })
  } catch (error) {
    console.log('🚀 ~ roomsRouter.post ~ error', error)
    return res.status(400).json({
      message: 'couldnt create user',
    })
  }
})

/**
 * Change room mode
 */
roomsRouter.post('/change-room-mode', async (req, res) => {
  try {
    // get request input
    const { roomId, modeName, totalRounds = null, roundLength = null } = req.body.input.input

    console.log('🚀 ~ roomsRouter.post ~ req.body.input', req.body.input)
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
    console.log('🚀 ~ roomsRouter.post ~ roomId', roomId)

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
      pause: true,
      roundNumber,
    })

    console.log('(updatedRoomModeRes) We started the break:', updatedRoomModeRes)

    const countdownSeconds = 20
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
    // success
    return res.json({
      roomId,
      roomModeId: roomModesId,
    })
  } catch (error) {
    console.log(error)
    return res.status(400).json({
      message: error,
    })
  }
})

roomsRouter.post('/reset-speed-chat', async (req, res) => {
  // get request input
  const { roomModeId } = req.body.input

  try {
    const updateRoomModeRes = await orm.request(updateRoomMode, {
      roomModeId,
      pause: false,
      roundNumber: 0,
    })
    console.log('🚀 ~ roomsRouter.post ~ updateRoomModeRes', updateRoomModeRes)

    const deletedCron = await orm.request(deleteRoomModeCron, {
      roomModeId,
    })
    console.log('🚀 ~ roomsRouter.post ~ deletedCron', deletedCron)

    const roomId = updateRoomModeRes.data.update_room_modes.returning[0].rooms[0].id
    console.log('🚀 ~ roomsRouter.post ~ roomId', roomId)

    if (jobs.nextRound[roomId]) {
      jobs.nextRound[roomId].stop()
      console.log('clearing next round job')
    }

    if (jobs.betweenRounds[roomId]) {
      jobs.betweenRounds[roomId].stop()
      console.log('clearing between round job')
    }

    return res.json({
      roomModeId,
    })
  } catch (error) {
    console.log(error)
    return res.status(400).json({
      message: error,
    })
  }
})

export default roomsRouter
