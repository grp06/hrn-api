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
  console.log('makePairings -> calculatedPoints', JSON.stringify(calculatedPoints, null, 2))

  // shuffleArray(pointsArr)

  const finalMatches = generateFinalMatchesArray(calculatedPoints)
  console.log('makePairings -> finalMatches', finalMatches)

  return finalMatches
}

export default makePairings
