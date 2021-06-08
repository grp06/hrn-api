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
import jobs from '../../services/jobs'
import orm from '../../services/orm'
import { initSpeedRounds } from '../../services/room-modes/speed-rounds'

const roomsRouter = express.Router()
const countdownSeconds = 5
/**
 * Create a room
 */
roomsRouter.post('/create-room', async (req, res) => {
  const { firstName, roomName } = req.body.input

  const roomSlug = slug(roomName)

  try {
    const insertRoomModeReq = await orm.request(insertRoomMode, {
      objects: {
        round_number: null,
        round_length: null,
        total_rounds: null,
      },
    })
    const roomModesResponse = insertRoomModeReq.data.insert_room_modes.returning[0]

    if (insertRoomModeReq.errors) {
      throw new Error(insertRoomModeReq.errors[0].message)
    }

    const insertUserReq = await orm.request(insertUser, {
      objects: {
        first_name: firstName,
      },
    })
    const insertUserResponse = insertUserReq.data.insert_users.returning[0]
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

    if (insertRoomReq.errors) {
      if (insertRoomReq.errors[0].message.indexOf('rooms_name_key') > -1) {
        return res.status(400).json({ message: 'room name unavailable' })
      }
    }

    const insertRoomResponse = insertRoomReq.data.insert_rooms.returning[0]

    const roomId = insertRoomReq.data.insert_rooms.returning[0].id

    const insertRoomUserReq = await orm.request(insertRoomUser, {
      objects: {
        room_id: insertRoomResponse.id,
        user_id: insertUserResponse.id,
      },
    })
    const insertRoomUserResponse = insertRoomUserReq.data.insert_room_users.returning[0]

    const { id: roomUserId } = insertRoomUserResponse

    if (insertRoomUserReq.errors) {
      throw new Error(insertRoomUserReq.errors[0].message)
    }
    const { id: roomModeId } = roomModesResponse

    return res.json({
      roomId,
      roomModeId,
      roomUserId,
      token: await createToken(insertUserResponse, process.env.SECRET),
    })
  } catch (error) {
    console.log('error = ', error)
    if (error.message.indexOf('Uniqueness violation') > -1) {
      return res
        .status(400)
        .json({ message: 'Room name already claimed, please choose another name' })
    }
    return res.status(400).json({ message: 'Error creating room room' })
  }
})

/**
 * Create a guest user in a room
 * TODO: move part of this to the user router/service
 */
roomsRouter.post('/create-guest-user', async (req, res) => {
  // get request input
  const { firstName, roomId } = req.body.input
  try {
    const insertUserRes = await orm.request(insertUser, {
      objects: {
        first_name: firstName,
      },
    })
    const newUser = insertUserRes.data.insert_users.returning[0]
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

    // TODO: check params, should we add defaults for totalRounds & roundLength

    // insert a new row into the room_mode table
    const roomModeRes = await orm.request(insertRoomMode, {
      objects: {
        round_number: 0,
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

    // make sure to use that id to update the room_modes_id on the room table
    const updateRoomRes = await orm.request(updateRoom, {
      roomId,
      roomModesId,
    })

    if (updateRoomRes.errors) {
      throw new Error(updateRoomRes.errors[0].message)
    }

    // only run this logic if we're starting speed chats
    // there may be other cases where we want to change the room mode that isn't related to speed-chats
    if (modeName === 'speed-chats') {
      // Start the break
      const updatedRoomModeRes = await orm.request(updateRoomMode, {
        roomModeId: roomModesId,
        pause: true,
        roundNumber: 0,
      })
      if (updatedRoomModeRes.errors) {
        throw new Error(updatedRoomModeRes.errors[0].message)
      }

      console.log('(updatedRoomModeRes) We started the countdown:', updatedRoomModeRes)

      const countdown = moment().add(countdownSeconds, 'seconds')

      jobs.countdown[roomId] = new CronJob(countdown, async () => {
        console.log('(updatedRoomModeRes->cronJob) We started the countdown:', roomId)

        await initSpeedRounds({
          roomId,
          roomModeId: roomModesId,
          roundNumber: 1,
          roundLength,
          totalRounds,
        })

        jobs.countdown[roomId]?.stop()
      })

      jobs.countdown[roomId]?.start()
      // success
    }

    return res.json({
      roomId,
      roomModeId: roomModesId,
    })
  } catch (error) {
    console.log(error)
    return res.status(400).json({
      message: error.toString(),
    })
  }
})

roomsRouter.post('/reset-speed-chat', async (req, res) => {
  // get request input
  const { roomModeId } = req.body.input

  try {
    // cancel out the active room mode
    const updateRoomModeRes = await orm.request(updateRoomMode, {
      roomModeId,
      pause: false,
      roundNumber: null,
    })
    console.log('🚀 ~ roomsRouter.post ~ updateRoomModeRes', updateRoomModeRes)

    await orm.request(deleteRoomModeCron, {
      roomModeId,
    })

    const roomId = updateRoomModeRes.data.update_room_modes.returning[0].rooms[0].id

    const insertRoomModeReq = await orm.request(insertRoomMode, {
      objects: {
        round_number: null,
        round_length: null,
        total_rounds: null,
      },
    })
    const roomModesResponse = insertRoomModeReq.data.insert_room_modes.returning[0]

    const roomModesId = roomModesResponse.id
    await orm.request(updateRoom, {
      roomId,
      roomModesId,
    })
    if (jobs.nextRound[roomId]) {
      jobs.nextRound[roomId]?.stop()
      jobs.nextRound[roomId] = null
      console.log('CLEARING NEXT ROUND JOB')
    }

    if (jobs.betweenRounds[roomId]) {
      jobs.betweenRounds[roomId]?.stop()
      jobs.betweenRounds[roomId] = null
      console.log('CLEARING BETWEEN ROUND JOB')
    }

    if (jobs.countdown[roomId]) {
      jobs.countdown[roomId]?.stop()
      jobs.countdown[roomId] = null
      console.log('CLEARING COUNTDOWN JOB')
    }
    // TODO update roomModesId to roomModeId to be consistent

    console.log('jobs = ', jobs)
    return res.json({
      roomModeId: roomModesId,
    })
  } catch (error) {
    console.log(error)
    return res.status(400).json({
      message: error.toString(),
    })
  }
})

export default roomsRouter
