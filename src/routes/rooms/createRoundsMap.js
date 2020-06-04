const createRoundsMap = (roundData, users) => {
  // look out for this in new algo
  if (!roundData || roundData.rounds.length === 0) {
    return {}
  }

  const generateUserMap = (user_id) => {
    const userRounds = roundData.rounds.filter(
      (pairing) => pairing.partnerX_id === user_id || pairing.partnerY_id === user_id
    )
    // This is to get an array of only your partners id for each round as the array element
    return userRounds.map((roundObject) => {
      if (roundObject.partnerX_id === user_id) {
        return roundObject.partnerY_id
      }
      return roundObject.partnerX_id
    })
  }

  const roundsMapObject = users.reduce((all, user) => {
    const map = generateUserMap(user)
    all[user] = map
    return all
  }, {})

  return roundsMapObject
}

export default createRoundsMap
