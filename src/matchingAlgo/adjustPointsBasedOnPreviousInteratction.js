const checkIfHasGivenOneStarRating = ({ userId, partnersUserId, allRoundsDataForOnlineUsers }) => {
  let hasGivenOneStarRating = false
  allRoundsDataForOnlineUsers.forEach((item) => {
    const myRowAndIGave1Star =
      item.user_id === userId && partnersUserId === item.partner_id && item.rating === 1
    const myPartnersRowAndHeGaveMe1Star =
      item.user_id === partnersUserId && item.rating === 1 && item.partner_id === userId
    if (myRowAndIGave1Star || myPartnersRowAndHeGaveMe1Star) {
      hasGivenOneStarRating = true
    }
  })
  return hasGivenOneStarRating
}

const checkIfHasMetPartnerThisEvent = ({
  userId,
  partnersUserId,
  allRoundsDataForOnlineUsers,
  eventId,
}) => {
  let hasMetThisEvent = false
  allRoundsDataForOnlineUsers.forEach((item) => {
    if (
      item.user_id === userId &&
      item.event_id === eventId &&
      item.partner_id === partnersUserId
    ) {
      hasMetThisEvent = true
    }
  })
  return hasMetThisEvent
}

const checkIfPredeterminedMatch = ({
  userId,
  partnersUserId,
  predeterminedPartnersQueryResponse,
}) => {
  let pairingIsPredetermined = false
  predeterminedPartnersQueryResponse.forEach((pairing) => {
    if (
      (pairing.partner_1_id === userId && pairing.partner_2_id === partnersUserId) ||
      (pairing.partner_1_id === partnersUserId && pairing.partner_2_id === userId)
    ) {
      pairingIsPredetermined = true
    }
  })

  return pairingIsPredetermined
}

const adjustPointsBasedOnPreviousInteratction = ({
  allRoundsDataForOnlineUsers,
  eventId,
  calculatedPoints,
  predeterminedPartnersQueryResponse,
}) => {
  const adjustedPoints = calculatedPoints.reduce((all, userObj, index) => {
    const { scores, userId } = userObj
    scores.forEach((item, idx) => {
      const partnersUserId = parseInt(Object.keys(item)[0], 10)

      const hasGivenOneStarRating = checkIfHasGivenOneStarRating({
        userId,
        partnersUserId,
        allRoundsDataForOnlineUsers,
      })
      const hasMetPartnerThisEvent = checkIfHasMetPartnerThisEvent({
        userId,
        partnersUserId,
        allRoundsDataForOnlineUsers,
        eventId,
      })

      const userArePredeterminedToMatch = checkIfPredeterminedMatch({
        userId,
        partnersUserId,
        predeterminedPartnersQueryResponse,
      })

      if (hasMetPartnerThisEvent) {
        item[partnersUserId] -= 1000
      }

      if (hasGivenOneStarRating) {
        item[partnersUserId] -= 10000
      }

      if (userArePredeterminedToMatch) {
        console.log('predetermined!!!!')
        // add a number between 500 - 599 to that users' points object
        item[partnersUserId] += Math.floor(Math.random() * 100) + 500
      }

      if (eventId === 656 && item[partnersUserId] < 100) {
        // here
        item[partnersUserId] -= 1000
      }
    })

    all.push(userObj)
    return all
  }, [])

  return adjustedPoints
}

export default adjustPointsBasedOnPreviousInteratction
