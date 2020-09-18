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
  const eitherPartnerGaveOtherOneStar = allRoundsDataForOnlineUsers.reduce((all, user) => {
    if (all) {
      return true
    }

    const userAGaveUserBOneStar =
      user.user_id === userA && user.partner_id === userB && user.rating === 1

    const userBGaveUserAOneStar =
      user.user_id === userB && user.partner_id === userA && user.rating === 1

    if (userAGaveUserBOneStar || userBGaveUserAOneStar) {
      return true
    }

    return all
  }, false)

  if (eitherPartnerGaveOtherOneStar) {
    return -9999
  }

  const usersHaveAlreadyMatched = allRoundsDataForOnlineUsers.reduce((all, user) => {
    if (all) {
      return true
    }

    const userAAlreadyMatchedUserBThisEvent =
      user.user_id === userA && user.partner_id === userB && user.event_id === eventId

    const userBAlreadyMatchedUserAThisEvent =
      user.user_id === userB && user.partner_id === userA && user.event_id === eventId

    if (userAAlreadyMatchedUserBThisEvent || userBAlreadyMatchedUserAThisEvent) {
      return true
    }

    return all
  }, false)

  if (usersHaveAlreadyMatched) {
    return -999
  }

  return 0
}

export default adjustPointsBasedOnPreviousInteratction
