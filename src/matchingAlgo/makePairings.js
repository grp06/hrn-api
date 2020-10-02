import shuffleArray from './shuffleArray'
import generateFinalMatchesArray from './generateFinalMatchesArray'
import calculatePoints from './calculatePoints'
import moveNullsToTheFront from './moveNullsToTheFront'

const _ = require('lodash')

const makePairings = ({
  onlineUsers,
  allRoundsDataForOnlineUsers,
  currentRound,
  eventId,
  fromLobbyScan,
  userIds,
}) => {
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

  if (!fromLobbyScan) {
    // when making assignments, after creating all the pairings, find out who didn't get paired
    const flattenedPairings = _.flatten(finalMatches)
    const difference = _.difference(userIds, flattenedPairings)
    console.log(' difference', difference)

    // push them to the pariings array with a null partner
    difference.forEach((userWithoutPairing) => finalMatches.push([userWithoutPairing, null]))
  }

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
