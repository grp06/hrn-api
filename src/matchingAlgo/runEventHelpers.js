import * as Sentry from '@sentry/node'

import { insertRoomMode, updateRoom } from '../gql/mutations'
import deleteRoomModeCronjob from '../gql/mutations/deleteRoomModeCronjob'
import updateRoomMode from '../gql/mutations/updateRoomMode'
import jobs from '../services/jobs'
import orm from '../services/orm'
import setRoomsAsCompleted from '../services/twilio/setRoomsAsCompleted'

const killAllJobsByRoomId = (roomId) => {
  // console.log('jobs = ', jobs)
  if (jobs.countdown[roomId]) {
    jobs.countdown[roomId].stop()
    jobs.countdown[roomId] = null
    console.log('clearing countdown job')
  }

  if (jobs.nextRound[roomId]) {
    jobs.nextRound[roomId].stop()
    jobs.nextRound[roomId] = null
    console.log('clearing next round job')
  }

  if (jobs.betweenRounds[roomId]) {
    jobs.betweenRounds[roomId].stop()
    jobs.betweenRounds[roomId] = null
    console.log('clearing between rounds')
  }
}

// ensures that rooms are closed before next round
export const omniFinishRounds = async (roundNumber, roomId, roomModeId) => {
  if (jobs.nextRound[roomId]) {
    jobs.nextRound[roomId].stop()
    jobs.nextRound[roomId] = null
  }

  try {
    const updatedRoomModeRes = await orm.request(updateRoomMode, {
      roomModeId,
      pause: true,
      roundNumber,
    })
    console.log('===== UPDATING ROOM TO PAUSED =====', updatedRoomModeRes)

    if (updatedRoomModeRes.errors) {
      throw new Error(updatedRoomModeRes.errors[0].message)
    }

    const deleteRoomModeCronjobRes = await orm.request(deleteRoomModeCronjob, {
      roomId,
    })

    if (deleteRoomModeCronjobRes.errors) {
      Sentry.captureException(deleteRoomModeCronjobRes.errors[0].message)
      throw new Error(deleteRoomModeCronjobRes.errors[0].message)
    }
  } catch (error) {
    console.log('omniFinishRounds -> error', error)
    Sentry.captureException(error)
  }
}

export const endEvent = async (roomId) => {
  killAllJobsByRoomId(roomId)
  // console.log('jobs = ', jobs)
  try {
    await Promise.all(await setRoomsAsCompleted(roomId))
    console.info('Event ended')
    const roomModeRes = await orm.request(insertRoomMode, {
      objects: {
        mode_name: 'campfire',
        round_number: null,
        round_length: null,
        total_rounds: null,
      },
    })

    if (roomModeRes.errors) {
      throw new Error(roomModeRes.errors[0].message)
    }

    // grab the id from the row we just inserted
    const roomModesId = roomModeRes.data.insert_room_modes.returning[0].id

    // make sure to use that id to update the room_modes_id on the room table
    await orm.request(updateRoom, {
      roomId,
      roomModesId,
    })
    console.log('inserted new campfire')
    return
  } catch (error) {
    console.log('endEvent -> error', error)
    Sentry.captureException(error)
  }
}
