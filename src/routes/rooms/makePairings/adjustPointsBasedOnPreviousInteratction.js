const adjustPointsBasedOnPreviousInteratction = ({
  userA,
  userB,
  allRoundsDataForOnlineUsers,
  eventId,
}) => {
  // at the moment, this is within a loop
  // what this means is that we'll hit this mutliple times
  // (as many times as we have tags)
  // it just makes the number super negative
  // probably ok for now, but we should fix
  const eitherPartnerGaveOtherOneStar = allRoundsDataForOnlineUsers.reduce(
    (all, currentUserRow) => {
      if (all) {
        return true
      }

      const userAGaveUserBOneStar =
        currentUserRow.user_id === userA &&
        currentUserRow.partner_id === userB &&
        currentUserRow.rating === 1

      const userBGaveUserAOneStar =
        currentUserRow.user_id === userB &&
        currentUserRow.partner_id === userA &&
        currentUserRow.rating === 1

      if (userAGaveUserBOneStar || userBGaveUserAOneStar) {
        return true
      }

      return all
    },
    false
  )

  if (eitherPartnerGaveOtherOneStar) {
    return -9999
  }

  const usersHaveAlreadyMatched = allRoundsDataForOnlineUsers.reduce((all, currentUserRow) => {
    if (all) {
      return true
    }

    const userAAlreadyMatchedUserBThisEvent =
      currentUserRow.user_id === userA &&
      currentUserRow.partner_id === userB &&
      currentUserRow.event_id === eventId

    const userBAlreadyMatchedUserAThisEvent =
      currentUserRow.user_id === userB &&
      currentUserRow.partner_id === userA &&
      currentUserRow.event_id === eventId

    if (userAAlreadyMatchedUserBThisEvent || userBAlreadyMatchedUserAThisEvent) {
      return true
    }

    return all
  }, false)

  if (usersHaveAlreadyMatched) {
    return -999
  }

  const eitherPartnerHasReportedTheOther = allRoundsDataForOnlineUsers.reduce(
    (all, currentUserRow) => {
      if (all) {
        return true
      }

      const userAReportedUserB =
        currentUserRow.user_id === userA &&
        currentUserRow.partner_id === userB &&
        currentUserRow.left_chat === 'reported my partner'

      const userBReportedUserA =
        currentUserRow.user_id === userB &&
        currentUserRow.partner_id === userA &&
        currentUserRow.left_chat === 'reported my partner'

      if (userAReportedUserB || userBReportedUserA) {
        return true
      }

      return false
    }
  )

  if (eitherPartnerHasReportedTheOther) {
    return -999
  }

  return 0
}

export default adjustPointsBasedOnPreviousInteratction
