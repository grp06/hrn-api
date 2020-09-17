import getCurrentUsersBestMatch from './getCurrentUsersBestMatch'

// const pointsArr3 = [
//   {
//     userId: 1,
//     scores: [
//       { 2: 0 },
//       { 3: 0 },
//     }],
//   ,
// ]

const generateFinalMatchesArray = (pointsArr) => {
  const finalMatches = []
  const pairedUserIds = []
  pointsArr.forEach((userObj) => {
    const currentUserId = userObj.userId

    if (!pairedUserIds.includes(currentUserId)) {
      const bestMatch = getCurrentUsersBestMatch(userObj, currentUserId)

      finalMatches.push([parseInt(currentUserId, 10), parseInt(bestMatch, 10) || null])
      console.log('currentUserId', currentUserId)
      pairedUserIds.push(currentUserId, bestMatch)
    }
  })
  return pointsArr
}

export default generateFinalMatchesArray
