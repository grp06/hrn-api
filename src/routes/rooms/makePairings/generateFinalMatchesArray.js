// const pointsArr3 = [
//   {
//     userId: 1,
//     scores: [
//       { 2: 0 },
//       { 3: 0 },
//     }],
//   ,
// ]

const getCurrentUsersBestMatch = (userObj, pairedUserIds) => {
  let userIdAndScoreOfBestMatch // -> looks like [1, 50]

  const currentUsersPointsArr = userObj.scores

  // loop through the "current users points array
  // for each score obj
  currentUsersPointsArr.forEach((scoreObj) => {
    const userIdComparison = parseInt(Object.keys(scoreObj)[0], 10)
    const scoreComparison = Object.values(scoreObj)[0]

    // make sure that the current user hasn't already been assigned
    if (!pairedUserIds.includes(userIdComparison)) {
      // on the first pass, there no highest score. Set the userId we're looking at and his associated score as highest
      // (as long as the score is > 0 (they havent given each other 1 star or already matched))
      if (!userIdAndScoreOfBestMatch) {
        // store the userId of the best match + their score in an array
        userIdAndScoreOfBestMatch = [userIdComparison, scoreComparison]

        // see if the score of this user is higher than the highest we've seen
      } else if (scoreComparison > userIdAndScoreOfBestMatch[1]) {
        userIdAndScoreOfBestMatch = [userIdComparison, scoreComparison]
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
    const currentUserId = userObj.userId
    const bestMatch = getCurrentUsersBestMatch(userObj, pairedUserIds)
    console.log('generateFinalMatchesArray -> bestMatch', bestMatch)
    if (!pairedUserIds.includes(currentUserId) && bestMatch && bestMatch[1] >= 0) {
      finalMatches.push([parseInt(currentUserId, 10), parseInt(bestMatch, 10) || null])
      pairedUserIds.push(currentUserId, bestMatch[0])
    }
  })
  return finalMatches
}

export default generateFinalMatchesArray
