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
  // looks like this
  // [
  //   { 1: 50 },
  //   { 2: 60 },
  //   { 3: 70 },
  // ]

  // loop through the "current users points array
  // for each score obj
  currentUsersPointsArr.forEach((scoreObj) => {
    const userIdComparison = parseInt(Object.keys(scoreObj)[0], 10)
    const scoreComparison = Object.values(scoreObj)[0]

    // make sure that the current user hasn't already been assigned
    if (!pairedUserIds.includes(userIdComparison)) {
      // on the first pass, there no highest score. Set the userId we're looking at and his associated score as highest
      if (!userIdAndScoreOfBestMatch) {
        // store the userId of the best match + their score in an array
        userIdAndScoreOfBestMatch = [userIdComparison, scoreComparison]
        console.log(' -> userIdComparison', userIdComparison)

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
  return userIdAndScoreOfBestMatch[0]
}

const generateFinalMatchesArray = (pointsArr) => {
  const finalMatches = []
  const pairedUserIds = []

  pointsArr.forEach((userObj) => {
    const currentUserId = userObj.userId
    console.log('pairedUserIds = ', pairedUserIds)
    if (!pairedUserIds.includes(currentUserId)) {
      const bestMatch = getCurrentUsersBestMatch(userObj, pairedUserIds)

      finalMatches.push([parseInt(currentUserId, 10), parseInt(bestMatch, 10) || null])
      pairedUserIds.push(currentUserId, bestMatch)
    }
  })
  return finalMatches
}

export default generateFinalMatchesArray
