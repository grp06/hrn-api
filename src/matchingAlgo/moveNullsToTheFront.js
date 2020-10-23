const moveNullsToTheFront = ({ adjustedPoints, allRoundsDataForOnlineUsers, eventId }) => {
  const usersWhoHaveSatOut = []
  // make a list of userIds who have sat out
  allRoundsDataForOnlineUsers.forEach((userObj) => {
    // if the user has had a null partner this event already
    if (userObj.event_id === eventId && !userObj.partner_id) {
      usersWhoHaveSatOut.push(userObj.user_id)
    }
  })

  // if nobody's sat out yet, just return what we started with
  if (!usersWhoHaveSatOut.length) {
    return adjustedPoints
  }

  const reorderedWithNullsInFront = adjustedPoints.reduce((all, item, index) => {
    // if the current user has sat out before, push him to the front of the array
    if (usersWhoHaveSatOut.includes(item.userId)) {
      all.unshift(item)

      const idxToSplice = usersWhoHaveSatOut.indexOf(item.user_id)
      usersWhoHaveSatOut.splice(idxToSplice, 1)
      return all
    }
    // otherwise just add them in via normal ordering
    all.push(item)
    return all
  }, [])
  return reorderedWithNullsInFront
}

export default moveNullsToTheFront
