import shuffleArray from './shuffleArray'
import generateFinalMatchesArray from './generateFinalMatchesArray'
import calculatePoints from './calculatePoints'

const makePairings = ({ onlineUsers, allRoundsDataForOnlineUsers, currentRound, eventId }) => {
  const calculatedPoints = calculatePoints({
    onlineUsers,
    allRoundsDataForOnlineUsers,
    currentRound,
    eventId,
  })

  // shuffleArray(pointsArr)

  const finalMatches = generateFinalMatchesArray(calculatedPoints)

  return finalMatches
}

export default makePairings
