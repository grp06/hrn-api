import shuffleArray from './shuffleArray'
import generateFinalMatchesArray from './generateFinalMatchesArray'
import calculatePoints from './calculatePoints'

const makePairings = (onlineUsers, partnersRows, currentRound) => {
  // console.log('makePairings -> onlineUsers', onlineUsers)

  const calculatedPoints = calculatePoints({ onlineUsers, partnersRows, currentRound })
  console.log('makePairings -> calculatedPoints', JSON.stringify(calculatedPoints, null, 2))

  // console.log('initialPointsArray =', JSON.stringify(pointsArr, null, 2))

  // shuffleArray(pointsArr)

  const finalMatches = generateFinalMatchesArray(calculatedPoints)
  console.log('makePairings -> finalMatches', finalMatches)

  return finalMatches
}

export default makePairings
