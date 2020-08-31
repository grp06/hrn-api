import * as Sentry from '@sentry/node'
import setRoomsCompleted from './set-rooms-completed'
import createRooms from './createPreEventRooms'
import orm from '../../services/orm'
import updateEventObject from '../../gql/mutations/event/updateEventObject'
import setEventEndedAt from '../../gql/mutations/event/setEventEndedAt'
import resetEventStatus from '../../gql/mutations/event/resetEventStatus'
import deleteRounds from '../../gql/mutations/event/deleteRounds'
// ensures that rooms are closed before next round
export const omniFinishRounds = async (currentRound, eventId) => {
  let completedRoomsPromises
  try {
    completedRoomsPromises = await setRoomsCompleted(eventId)
  } catch (error) {
    Sentry.captureException(error)
  }

  try {
    await Promise.all(completedRoomsPromises)
  } catch (error) {
    Sentry.captureException(error)
  }

  // set ended_at in db for the round we just completed
  if (currentRound > 0) {
    try {
      await orm.request(updateEventObject, {
        id: eventId,
        newStatus: 'in-between-rounds',
        newCurrentRound: currentRound,
      })

      console.log('set room to in-between-rounds for eventId ', eventId)
    } catch (error) {
      Sentry.captureException(error)
      console.log('error setting ended_at for event = ', error)
    }
  }
}

export const endEvent = async (eventId, betweenRoundsTimeout, roundsTimeout) => {
  try {
    await orm.request(setEventEndedAt, {
      id: eventId,
      ended_at: new Date().toISOString(),
    })
  } catch (error) {
    Sentry.captureException(error)
    console.log('error = ', error)
  }

  try {
    await orm.request(updateEventObject, {
      id: eventId,
      newStatus: 'complete',
    })
    console.log('event set to complete')
  } catch (error) {
    Sentry.captureException(error)
    console.log('error = ', error)
  }

  clearTimeout(betweenRoundsTimeout)
  clearTimeout(roundsTimeout)
  console.log('EVENT FINISHED')
}

export const createNewRooms = async (currentRoundData, eventId) => {
  const newRoundsByRowId = currentRoundData.reduce((all, row) => {
    all.push(row.id)
    return all
  }, [])

  // on the frontend maybe consider putting in a delay on the 'join room'  function
  // to make sure clients dont join rooms before they're created? Unlikely, but technically possible
  // twilio room id is the same as the round id in the db
  try {
    const createdRoomsPromises = await createRooms(newRoundsByRowId, eventId)
    const res = await Promise.all(createdRoomsPromises)
    console.log('just created these guys -> res', res)
  } catch (error) {
    Sentry.captureException(error)
    console.log('error = ', error)
  }
}

export const resetEvent = async (eventId, betweenRoundsTimeout, roundsTimeout) => {
  let completedRoomsPromises
  try {
    completedRoomsPromises = await setRoomsCompleted(eventId)
  } catch (error) {
    Sentry.captureException(error)
  }

  try {
    await Promise.all(completedRoomsPromises)
  } catch (error) {
    console.log('runEvent -> error', error)
    Sentry.captureException(error)
  }

  try {
    await orm.request(resetEventStatus, {
      eventId,
    })
    console.log('reset event to not-started')
    console.log('eventId = ', eventId)
  } catch (error) {
    console.log('runEvent -> error', error)
    Sentry.captureException(error)
  }

  try {
    await orm.request(deleteRounds, {
      eventId,
    })
    console.log('deleted round')
    console.log('eventId = ', eventId)
  } catch (error) {
    console.log('runEvent -> error', error)
    Sentry.captureException(error)
  }

  clearTimeout(betweenRoundsTimeout)
  clearTimeout(roundsTimeout)
  console.log('cleared timeouts')
  console.log('eventId = ', eventId)
}
