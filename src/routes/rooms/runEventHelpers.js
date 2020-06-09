import setRoomsCompleted from './set-rooms-completed'
import createRooms from './create-rooms'
import updateRoundEndedAt from '../../gql/mutations/users/updateRoundEndedAt'
import orm from '../../services/orm'

// ensures that rooms are closed before next round
export const omniFinishRounds = async (
  req,
  currentRound,
  eventId,
  betweenRoundsTimeout,
  roundsTimeout
) => {
  console.log('in OMNI')
  const completedRoomsPromises = await setRoomsCompleted()

  if (req.body.reset) {
    currentRound = 0
    clearTimeout(betweenRoundsTimeout)
    clearTimeout(roundsTimeout)
    return
  }

  await Promise.all(completedRoomsPromises)

  // set ended_at in db for the round we just completed
  if (currentRound > 0) {
    try {
      await orm.request(updateRoundEndedAt, {
        event_id: eventId,
        roundNumber: currentRound,
        endedAt: new Date().toISOString(),
      })
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
