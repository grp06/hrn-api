const getHighestScoringPartner = (userObj, pairedUserIds) => {
  let userIdAndScoreOfBestMatch // -> looks like [1, 50]

  // loop through the current users scores
  // for each score obj
  userObj.scores.forEach((scoreObj) => {
    const userIdToCompare = parseInt(Object.keys(scoreObj)[0], 10)
    const scoreToCompare = Object.values(scoreObj)[0]

    // make sure that the current user hasn't already been assigned
    if (!pairedUserIds.includes(userIdToCompare)) {
      // on the first pass, there no highest score. Set the userId we're looking at and his associated score as highest
      // (as long as the score is > 0 (they havent given each other 1 star or already matched))
      if (!userIdAndScoreOfBestMatch) {
        // store the userId of the best match + their score in an array
        userIdAndScoreOfBestMatch = [userIdToCompare, scoreToCompare]

        // see if the score of this user is higher than the highest we've seen
      } else if (scoreToCompare > userIdAndScoreOfBestMatch[1]) {
        userIdAndScoreOfBestMatch = [userIdToCompare, scoreToCompare]
      }
      // otherwise, do nothing
    }
  })
  if (!userIdAndScoreOfBestMatch) {
    return null
  }

  // return the userId with the highest score
  return userIdAndScoreOfBestMatch
}

const generateFinalMatchesArray = (pointsArr) => {
  const finalMatches = []
  const pairedUserIds = []

  pointsArr.forEach((userObj) => {
    const bestMatch = getHighestScoringPartner(userObj, pairedUserIds)
    const currentUserId = userObj.userId
    const hasntYetBeenPaired = !pairedUserIds.includes(currentUserId)
    const bestMatchIsValid = bestMatch && bestMatch[1] >= 0

    if (hasntYetBeenPaired && bestMatchIsValid) {
      finalMatches.push([currentUserId, bestMatch[0]])
      pairedUserIds.push(currentUserId, bestMatch[0])
    }
  })
  console.log('finalMatches = ', finalMatches)
  return finalMatches
}

export default generateFinalMatchesArray
