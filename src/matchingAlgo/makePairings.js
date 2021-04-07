import adjustPointsBasedOnPreviousInteratction from './adjustPointsBasedOnPreviousInteratction'
import calculatePoints from './calculatePoints'
import generateFinalMatchesArray from './generateFinalMatchesArray'
import moveNullsToTheFront from './moveNullsToTheFront'
import shuffleArray from './shuffleArray'

const _ = require('lodash')

const makePairings = ({
  onlineUsers,
  allRoundsDataForOnlineUsers,
  currentRound,
  eventId,
  fromLobbyScan,
  userIds,
  predeterminedPartnersQueryResponse,
}) => {
  console.log('fromLobbyScan', fromLobbyScan)
  let pairingAttempts = 0
  let finalMatches
  let numNullPairings

  const attemptPairings = () => {
    const calculatedPoints = calculatePoints({
      onlineUsers,
      currentRound,
      eventId,
    })
    console.log('attemptPairings -> calculatedPoints', JSON.stringify(calculatedPoints, null, 2))

    const adjustedPoints = adjustPointsBasedOnPreviousInteratction({
      calculatedPoints,
      allRoundsDataForOnlineUsers,
      eventId,
      predeterminedPartnersQueryResponse,
    })

    shuffleArray(adjustedPoints)
    console.log('attemptPairings -> adjustedPoints', JSON.stringify(adjustedPoints, null, 2))

    let reorderedWithNullsInFront
    if (pairingAttempts < 1) {
      reorderedWithNullsInFront = moveNullsToTheFront({
        adjustedPoints,
        allRoundsDataForOnlineUsers,
        eventId,
      })
    }

    finalMatches = generateFinalMatchesArray(reorderedWithNullsInFront || adjustedPoints)
    if (!fromLobbyScan) {
      // when making assignments, after creating all the pairings, find out who didn't get paired
      const flattenedPairings = _.flatten(finalMatches)
      const difference = _.difference(userIds, flattenedPairings)
      console.log(' difference', difference)

      // push them to the pariings array with a null partner
      difference.forEach((userWithoutPairing) => finalMatches.push([userWithoutPairing, null]))
    }

    numNullPairings = finalMatches.reduce((all, item) => {
      if (item[1] === null) {
        all += 1
      }
      return all
    }, 0)
    console.log('makePairings -> numNullPairings', numNullPairings)

    if (numNullPairings > 1 && pairingAttempts < 20) {
      pairingAttempts += 1
      console.log('makePairings -> pairingAttempts', pairingAttempts)
      finalMatches = null
      numNullPairings = null
      return attemptPairings()
    }
  }

  attemptPairings()

  console.log('makePairings -> finalMatches', finalMatches)

  return finalMatches
}

export default makePairings
