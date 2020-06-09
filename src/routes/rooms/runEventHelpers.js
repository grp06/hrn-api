import setRoomsCompleted from './set-rooms-completed'
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
  const completedRoomsPromises = await setRoomsCompleted()

  if (req.body.reset) {
    currentRound = 0
    clearTimeout(betweenRoundsTimeout)
    clearTimeout(roundsTimeout)
    return
  }

  await Promise.all(completedRoomsPromises)

  // set ended_at for the round we just completed
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
