import * as Sentry from '@sentry/node'
import setRoomsCompleted from './set-rooms-completed'
import orm from '../../services/orm'
import {
  updateEventObject,
  resetEventStatus,
  deletePartnersByEventId,
  deleteCronTimestamp,
} from '../../gql/mutations'
import { getEventInfoByEventId, getAvailableLobbyUsers } from '../../gql/queries'

import jobs from '../../services/jobs'

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
export const omniFinishRounds = async (currentRound, eventId) => {
  if (jobs.lobbyAssignments[eventId]) {
    jobs.lobbyAssignments[eventId].stop()
    jobs.lobbyAssignments[eventId] = null
  }
  if (jobs.nextRound[eventId]) {
    jobs.nextRound[eventId].stop()
    jobs.nextRound[eventId] = null
    console.log('clearing next round job')
  }
  try {
    const updateEventObjectRes = await orm.request(updateEventObject, {
      id: eventId,
      newStatus: 'in-between-rounds',
      newCurrentRound: currentRound,
    })

    if (updateEventObjectRes.errors) {
      throw new Error(updateEventObjectRes.errors[0].message)
    }

    const deleteCronTimestampRes = await orm.request(deleteCronTimestamp, {
      eventId,
    })
    console.log('omniFinishRounds -> deleteCronTimestampRes', deleteCronTimestampRes)

    if (deleteCronTimestampRes.errors) {
      Sentry.captureException(deleteCronTimestampRes.errors[0].message)
      throw new Error(deleteCronTimestampRes.errors[0].message)
    }

    console.log('set room to in-between-rounds for eventId ', eventId)
  } catch (error) {
    console.log('omniFinishRounds -> error', error)
    Sentry.captureException(error)
  }

  // set ended_at in db for the round we just completed
}

export const endEvent = async (eventId) => {
  killAllJobsByEventId(eventId)
  // console.log('jobs = ', jobs)
  try {
    const completedRoomsPromises = await setRoomsCompleted(eventId)
    await Promise.all(completedRoomsPromises)

    const eventInfoRes = await orm.request(getEventInfoByEventId, { eventId })

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
    if (hostIsOnline && group_video_chat) {
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
    const completedRoomsPromises = await setRoomsCompleted(eventId)

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
