import setRoomsCompleted from './set-rooms-completed'
import createRooms from './create-rooms'
import orm from '../../services/orm'
import updateEventStatus from '../../gql/mutations/users/updateEventStatus'
import setEventEndedAt from '../../gql/mutations/users/setEventEndedAt'

// ensures that rooms are closed before next round
export const omniFinishRounds = async (req, currentRound, eventId) => {
  console.log('in OMNI')
  const completedRoomsPromises = await setRoomsCompleted(eventId)

  await Promise.all(completedRoomsPromises)

  // set ended_at in db for the round we just completed
  if (currentRound > 0) {
    try {
      const updatedEventStatus = await orm.request(updateEventStatus, {
        eventId,
        newStatus: 'in-between-rounds',
      })
      console.log('set room to in-between-rounds')
    } catch (error) {
      console.log('error = ', error)
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
    console.log('error = ', error)
  }

  try {
    await orm.request(updateEventStatus, {
      eventId,
      newStatus: 'complete',
    })
  } catch (error) {
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
    console.log('error = ', error)
  }
}
