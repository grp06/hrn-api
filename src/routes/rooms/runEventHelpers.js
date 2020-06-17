import setRoomsCompleted from './set-rooms-completed'
import createRooms from './create-rooms'
import updateRoundEndedAt from '../../gql/mutations/users/updateRoundEndedAt'
import orm from '../../services/orm'
import updateEventStatus from '../../gql/mutations/users/updateEventStatus'

// ensures that rooms are closed before next round
export const omniFinishRounds = async (req, currentRound, eventId) => {
  console.log('in OMNI')
  const completedRoomsPromises = await setRoomsCompleted()

  await Promise.all(completedRoomsPromises)

  if (currentRound > 0) {
    try {
      await orm.request(updateEventStatus, {
        eventId,
        newStatus: 'in-between-rounds',
      })
      console.log('set room to in-between-rounds')
    } catch (error) {
      console.log('error = ', error)
    }
  }
}

export const createNewRooms = async (currentRoundData) => {
  const newRoundsByRowId = currentRoundData.reduce((all, row) => {
    all.push(row.id)
    return all
  }, [])

  // on the frontend maybe consider putting in a delay on the 'join room'  function
  // to make sure clients dont join rooms before they're created? Unlikely, but technically possible
  // twilio room id is the same as the round id in the db
  try {
    const createdRoomsPromises = await createRooms(newRoundsByRowId)
    await Promise.all(createdRoomsPromises)
  } catch (error) {
    console.log('error = ', error)
  }
}
