const checkIfHasGivenOneStarRating = ({ userId, partnersUserId, allRoundsDataForOnlineUsers }) => {
  let hasGivenOneStarRating = false
  allRoundsDataForOnlineUsers.forEach((item) => {
    const myRowAndIGave1Star = item.user_id === userId && partnersUserId === item.partner_id && item.rating === 1
    const myPartnersRowAndHeGaveMe1Star = item.user_id === partnersUserId && item.rating === 1 && item.partner_id === userId
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

const adjustPointsBasedOnPreviousInteratction = ({
  allRoundsDataForOnlineUsers,
  eventId,
  calculatedPoints,
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
      if (hasMetPartnerThisEvent) {
        item[partnersUserId] -= 1000
      }
      if (hasGivenOneStarRating) {
        item[partnersUserId] -= 10000
      }
    })

    all.push(userObj)
    return all
  }, [])

  return adjustedPoints
}

export default adjustPointsBasedOnPreviousInteratction
