import shuffleArray from './shuffleArray'
import generateFinalMatchesArray from './generateFinalMatchesArray'
import calculatePoints from './calculatePoints'
import moveNullsToTheFront from './moveNullsToTheFront'

const makePairings = ({ onlineUsers, allRoundsDataForOnlineUsers, currentRound, eventId }) => {
  let pairingAttempts = 0

  const attemptPairings = () => {
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

    const matchesArray = generateFinalMatchesArray(reorderedWithNullsInFront)
    return matchesArray
  }

  const finalMatches = attemptPairings()
  console.log('makePairings -> finalMatches', finalMatches)

  const numNullPairings = finalMatches.reduce((all, item, index) => {
    if (item[1] === null) {
      all += 1
    }
    return all
  }, 0)
  console.log('makePairings -> numNullPairings', numNullPairings)

  if (numNullPairings > 1 && pairingAttempts < 20) {
    pairingAttempts += 1
    console.log('makePairings -> pairingAttempts', pairingAttempts)
    return attemptPairings()
  }

  return finalMatches
}

export default makePairings
