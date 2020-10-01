import shuffleArray from './shuffleArray'
import generateFinalMatchesArray from './generateFinalMatchesArray'
import calculatePoints from './calculatePoints'
import moveNullsToTheFront from './moveNullsToTheFront'

const makePairings = ({ onlineUsers, allRoundsDataForOnlineUsers, currentRound, eventId }) => {
  const calculatedPoints = calculatePoints({
    onlineUsers,
    allRoundsDataForOnlineUsers,
    currentRound,
    eventId,
  })

  shuffleArray(calculatedPoints)

  const reorderedWithNullsInFront = moveNullsToTheFront({
    calculatedPoints,
    allRoundsDataForOnlineUsers,
    eventId,
  })

  const finalMatches = generateFinalMatchesArray(reorderedWithNullsInFront)

  return finalMatches
}

export default makePairings
