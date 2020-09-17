import shuffleArray from './shuffleArray'
import generateInitialPointsArr from './generateInitialPointsArray'
import generateFinalMatchesArray from './generateFinalMatchesArray'

const makePairings = (onlineUsers, partnersRows, currentRound) => {
  // console.log(JSON.stringify(generateInitialPointsArr(onlineUsers), null, 2))
  const pointsArr = generateInitialPointsArr(onlineUsers)
  console.log('pointsArr', JSON.stringify(pointsArr, null, 2))

  // shuffle before we go to get final matches
  // shuffleArray(pointsArr)

  const finalMatches = generateFinalMatchesArray(pointsArr)

  const getListOfTags = (user) => {
    return user.tags_users.map((item) => item.tag.name)
  }

  // loop over online users
  const calculations = onlineUsers.reduce((all, user, index) => {
    const listOfMyTags = getListOfTags(user)
    console.log('makePairings -> listOfMyTags', listOfMyTags)

    // for each tag object
    user.tags_users.forEach(() => {
      // loop over each onlineUser
      onlineUsers.forEach((onlineUser) => {
        // loop over each one of their tags
        onlineUser.tags_users.forEach((tag) => {
          console.log('tag = ', tag)
          const iHaveThisTag = listOfMyTags.includes(tag.tag.name)
          const comparingToMyself = user.id === onlineUser.id
          if (iHaveThisTag && !comparingToMyself) {
            const pointDefault = Number(Math.random().toFixed(3)) + 10
            pointsObj[user.id][onlineUser.id] += pointDefault
          }
        })
      })
    })
  }, {})
  // for each tag, com

  if (currentRound === 1) {
    return [
      [1, 2],
      [3, 4],
    ]
  }

  if (currentRound === 2) {
    return [
      [1, 3],
      [2, 4],
    ]
  }

  if (currentRound === 3) {
    return [
      [1, 4],
      [2, 3],
    ]
  }
}

export default makePairings
