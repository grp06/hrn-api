import * as Sentry from '@sentry/node'

import {
  updateEventObject,
  resetEventStatus,
  deletePartnersByEventId,
  deleteCronTimestamp,
} from '../gql/mutations'
import deleteRoomModeCronjob from '../gql/mutations/deleteRoomModeCronjob'
import updateRoomMode from '../gql/mutations/updateRoomMode'
import { getEventInfoByEventId, getAvailableLobbyUsers } from '../gql/queries'
import jobs from '../services/jobs'
import orm from '../services/orm'
import createTwilioVideoRoom from '../services/twilio/createTwilioVideoRoom'
import setRoomsAsCompleted from '../services/twilio/setRoomsAsCompleted'

const killAllJobsByEventId = (eventId) => {
  // console.log('jobs = ', jobs)
  if (jobs.lobbyAssignments[eventId]) {
    jobs.lobbyAssignments[eventId].stop()
    jobs.lobbyAssignments[eventId] = null
    console.log('clearing lobby assignments job')
  }

  if (jobs.nextRound[eventId]) {
    jobs.nextRound[eventId].stop()
    jobs.nextRound[eventId] = null
    console.log('clearing next round job')
  }

  if (jobs.betweenRounds[eventId]) {
    jobs.betweenRounds[eventId].stop()
    jobs.betweenRounds[eventId] = null
    console.log('clearing between rounds')
  }
}

// ensures that rooms are closed before next round
export const omniFinishRounds = async (roundNumber, roomId, roomModeId) => {
  console.log('🚀 ~ omniFinishRounds ~ roundNumber', roundNumber)

  if (jobs.lobbyAssignments[roomId]) {
    jobs.lobbyAssignments[roomId].stop()
    jobs.lobbyAssignments[roomId] = null
  }

  if (jobs.nextRound[roomId]) {
    jobs.nextRound[roomId].stop()
    jobs.nextRound[roomId] = null
    console.log('clearing next round job')
  }

  try {
    const updatedRoomModeRes = await orm.request(updateRoomMode, {
      roomModeId,
      break: true,
      roundNumber,
    })

    if (updatedRoomModeRes.errors) {
      throw new Error(updatedRoomModeRes.errors[0].message)
    }

    const deleteRoomModeCronjobRes = await orm.request(deleteRoomModeCronjob, {
      roomId,
    })

    console.log('omniFinishRounds -> deleteRoomModeCronjobRes', deleteRoomModeCronjobRes)

    if (deleteRoomModeCronjobRes.errors) {
      Sentry.captureException(deleteRoomModeCronjobRes.errors[0].message)
      throw new Error(deleteRoomModeCronjobRes.errors[0].message)
    }
  } catch (error) {
    console.log('omniFinishRounds -> error', error)
    Sentry.captureException(error)
  }
}

export const endEvent = async (eventId, isCompletingEvent) => {
  killAllJobsByEventId(eventId)
  // console.log('jobs = ', jobs)
  try {
    const completedRoomsPromises = await setRoomsAsCompleted(eventId)
    await Promise.all(completedRoomsPromises)

    const eventInfoRes = await orm.request(getEventInfoByEventId, { eventId })
    console.log('🚀 ~ endEvent ~ eventInfoRes', eventInfoRes)

    const { host_id, group_video_chat } = eventInfoRes.data.events[0]
    console.log('endEvent -> host_id', host_id)

    const onlineUsersResponse = await orm.request(getAvailableLobbyUsers, {
      eventId,
    })

    if (onlineUsersResponse.errors) {
      Sentry.captureException(onlineUsersResponse.errors[0].message)
      throw new Error(onlineUsersResponse.errors[0].message)
    }

    const onlineUsers = onlineUsersResponse.data.online_event_users

    const userIds = onlineUsers.map((user) => user.user_id)
    const hostIsOnline = userIds.includes(host_id)
    console.log('endEvent -> hostIsOnline', hostIsOnline)

    let updateEventObjectRes
    if (hostIsOnline && group_video_chat && !isCompletingEvent) {
      const createGroupRoomRes = await createTwilioVideoRoom(eventId)
      if (createGroupRoomRes.errors) {
        throw new Error(createGroupRoomRes.errors[0].message)
      }

      updateEventObjectRes = await orm.request(updateEventObject, {
        id: eventId,
        newStatus: 'group-video-chat',
      })

      console.log('set status to group video chat')
    } else {
      updateEventObjectRes = await orm.request(updateEventObject, {
        id: eventId,
        newStatus: 'complete',
        ended_at: new Date().toISOString(),
      })
      console.log('set status to event complete')
    }

    if (updateEventObjectRes.errors) {
      throw new Error(updateEventObjectRes.errors[0].message)
    }

    const deleteCronTimestampRes = await orm.request(deleteCronTimestamp, {
      eventId,
    })

    if (deleteCronTimestampRes.errors) {
      Sentry.captureException(deleteCronTimestampRes.errors[0].message)
      throw new Error(deleteCronTimestampRes.errors[0].message)
    }
  } catch (error) {
    console.log('endEvent -> error', error)
    Sentry.captureException(error)
  }
}

export const resetEvent = async (eventId) => {
  killAllJobsByEventId(eventId)

  try {
    const completedRoomsPromises = await setRoomsAsCompleted(eventId)

    await Promise.all(completedRoomsPromises)

    const resetEventRes = await orm.request(resetEventStatus, {
      eventId,
    })

    if (resetEventRes.errors) {
      Sentry.captureException(resetEventRes.errors[0].message)
      throw new Error(resetEventRes.errors[0].message)
    }

    const deletePartnersRes = await orm.request(deletePartnersByEventId, {
      eventId,
    })

    if (deletePartnersRes.errors) {
      Sentry.captureException(deletePartnersRes.errors[0].message)
      throw new Error(deletePartnersRes.errors[0].message)
    }

    const deleteCronTimestampRes = await orm.request(deleteCronTimestamp, {
      eventId,
    })
    console.log('endEvent -> deleteCronTimestampRes', deleteCronTimestampRes)

    if (deleteCronTimestampRes.errors) {
      Sentry.captureException(deleteCronTimestampRes.errors[0].message)
      throw new Error(deleteCronTimestampRes.errors[0].message)
    }
  } catch (error) {
    Sentry.captureException(error)
  }
}
