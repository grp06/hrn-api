const createPartnersMap = ({ allRoundsDataForOnlineUsers, userIds, eventId }) => {
  console.log('createPartnersMap -> userIds', userIds)
  console.log('createPartnersMap -> allRoundsDataForOnlineUsers', allRoundsDataForOnlineUsers)
  // look out for this in new algo
  // if (!allRoundsDataForOnlineUsers || allRoundsDataForOnlineUsers.length === 0) {
  //   return {}
  // }
  const roundsFromThisEvent = allRoundsDataForOnlineUsers.filter(
    (round) => round.event_id === eventId
  )
  const getPreviousMatches = (userId) => {
    const partnerRows = roundsFromThisEvent.filter((row) => row.user_id === userId)
    // This is to get an array of only your partners id for each round as the array element
    return partnerRows.map((partnerObject) => {
      if (partnerObject.user_id === userId) {
        return partnerObject.partner_id
      }
    })
  }

  // after we generate the users map
  // loop through all rounds for online users and add  blocked users to
  // the maps of the person who did the blocking

  const partnersMapObject = userIds.reduce((all, userId) => {
    const arrayOfPreviousMatches = getPreviousMatches(userId)
    all[userId] = arrayOfPreviousMatches
    return all
  }, {})

  const pairingsWhoShouldntMatch = []
  allRoundsDataForOnlineUsers.forEach((row) => {
    const userIdIsInPartnersMap = partnersMapObject[row.user_id]
    const partnerIsInPartnersMap = partnersMapObject[row.partner_id]
    if (row.rating === 0 && userIdIsInPartnersMap && partnerIsInPartnersMap) {
      pairingsWhoShouldntMatch.push([row.user_id, row.partner_id])
    }
  })
  console.log('partnersMapObject = ', partnersMapObject)
  console.log('createPartnersMap -> pairingsWhoShouldntMatch', pairingsWhoShouldntMatch)

  pairingsWhoShouldntMatch.forEach((pairing) => {
  console.log("createPartnersMap -> pairing", pairing)
    console.log("createPartnersMap -> pairing[0]", pairing[0])
    console.log("createPartnersMap -> pairing[1]", pairing[1])
    partnersMapObject[pairing[0]].push(pairing[1])
    partnersMapObject[pairing[1]].push(pairing[0])
  })

  return partnersMapObject
}

export default createPartnersMap
