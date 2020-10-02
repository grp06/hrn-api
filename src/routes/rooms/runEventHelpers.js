import * as Sentry from '@sentry/node'
import setRoomsCompleted from './set-rooms-completed'
import orm from '../../services/orm'
import { updateEventObject, resetEventStatus, deletePartnersByEventId } from '../../gql/mutations'
import jobs from '../../services/jobs'

const killAllJobsByEventId = (eventId) => {
  // console.log('jobs = ', jobs)
  if (jobs.nextRound[eventId]) {
    console.log('clearing next round job')
    jobs.nextRound[eventId].stop()
  }

  if (jobs.lobbyAssignments[eventId]) {
    console.log('clearing lobby assignments job')
    jobs.lobbyAssignments[eventId].stop()
  }

  if (jobs.betweenRounds[eventId]) {
    console.log('clearing between rounds')
    jobs.betweenRounds[eventId].stop()
  }
}

// ensures that rooms are closed before next round
export const omniFinishRounds = async (currentRound, eventId) => {
  if (jobs.lobbyAssignments[eventId]) {
    jobs.lobbyAssignments[eventId].stop()
  }
  try {
    const completedRoomsPromises = await setRoomsCompleted(eventId)
    await Promise.all(completedRoomsPromises)

    const updateEventObjectRes = await orm.request(updateEventObject, {
      id: eventId,
      newStatus: 'in-between-rounds',
      newCurrentRound: currentRound,
    })

    if (updateEventObjectRes.errors) {
      throw new Error(updateEventObjectRes.errors[0].message)
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
  console.log('jobs = ', jobs)
  try {
    const completedRoomsPromises = await setRoomsCompleted(eventId)
    await Promise.all(completedRoomsPromises)

    const updateEventObjectRes = await orm.request(updateEventObject, {
      id: eventId,
      newStatus: 'complete',
      ended_at: new Date().toISOString(),
    })
    console.log('endEvent -> updateEventObjectRes', updateEventObjectRes)

    if (updateEventObjectRes.errors) {
      throw new Error(updateEventObjectRes.errors[0].message)
    }
  } catch (error) {
    console.log('endEvent -> error', error)
    Sentry.captureException(error)
  }

  console.log('EVENT FINISHED')
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
  } catch (error) {
    Sentry.captureException(error)
  }
}
