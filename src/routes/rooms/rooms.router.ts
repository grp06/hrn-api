/**
 * Rooms router v2
 */
import * as Sentry from '@sentry/node'
import { CronJob } from 'cron'
import express from 'express'
import moment from 'moment'

import {
  insertRoom,
  insertRoomMode,
  insertRoomUser,
  insertUser,
  updateEventObject,
  updateRoom,
} from '../../gql/mutations'
import updateRoomMode from '../../gql/mutations/updateRoomMode'
import updateRoomModeBreak from '../../gql/mutations/updateRoomModeBreak'
import { getAvailableLobbyUsers } from '../../gql/queries'
import nextRound from '../../matchingAlgo/nextRound'
import { endEvent } from '../../matchingAlgo/runEventHelpers'
import jobs from '../../services/jobs'
import orm from '../../services/orm'
import { initSpeedRounds } from '../../services/room-modes/speed-rounds'
import createPreEventRooms from '../../services/twilio/createPreEventRooms'

const roomsRouter = express.Router()
const jsonBodyParser = express.json()

roomsRouter.post('/end-event/:id', jsonBodyParser, async (req, res) => {
  try {
    await endEvent(req.params.id, true)
  } catch (error) {
    console.log('error', error)
    Sentry.captureException(error)
  }
})

roomsRouter.post('/start-pre-event/:id', jsonBodyParser, async (req, res) => {
  const eventId = req.params.id

  let onlineUsersResponse
  try {
    onlineUsersResponse = await orm.request(getAvailableLobbyUsers, {
      eventId,
    })
    console.log('onlineUsersResponse', onlineUsersResponse)

    const maxNumUsersPerRoom = 40
    const numOnlineUsers = onlineUsersResponse.data.online_event_users.length
    console.log('numOnlineUsers', numOnlineUsers)
    const numRooms = Math.ceil(numOnlineUsers / maxNumUsersPerRoom)
    console.log('numRooms', numRooms)
    await createPreEventRooms(numRooms, eventId)

    await orm.request(updateEventObject, {
      id: eventId,
      newStatus: 'pre-event',
    })
  } catch (error) {
    Sentry.captureException(error)
    console.log('error = ', error)
    return res.status(500).json({ message: 'start pre-event failed' })
  }

  return res.status(200).json({ message: 'pre-event started' })
})

// api/rooms/start-event/:eventId
roomsRouter.post('/start-event/:eventId', jsonBodyParser, async (req, res) => {
  // TODO: remove the use of the global variable
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  __logger.info(`Event with id ${req.params.eventId} started.`)

  return nextRound({ req, res })
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
  const { firstName, roomId } = req.body.input
  try {
    const insertUserRes = await orm.request(insertUser, {
      objects: {
        first_name: firstName,
      },
    })
    console.log('🚀 ~ roomsRouter.post ~ insertUserRes', insertUserRes)
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
      success: false,
    })
  }

  // success
  return res.json({
    success: true,
  })
})

export default roomsRouter
