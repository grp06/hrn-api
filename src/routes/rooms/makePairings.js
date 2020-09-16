const makePairings = (onlineUsers, partnersRows, currentRound) => {
  const tagsPointsMap = {
    guitar: 10,
    piano: 9,
    jumping: 3,
    programming: 10,
    design: 8,
    UX: 4,
    partying: 4,
  }

  const pointsObj = {
    1: {
      2: 0,
      3: 0,
      4: 0,
    },
    2: {
      1: 0,
      3: 0,
      4: 0,
    },
    3: {
      1: 0,
      2: 0,
      4: 0,
    },
    4: {
      1: 0,
      2: 0,
      3: 0,
    },
  }

  // George isn't convinced of this quite yet. Let's revisit
  // const points = [
  //   {1:
  //     { 2: 0},
  //     { 3: 0},
  //     { 4: 0}},
  //   {2:
  //     {1: 0},
  //     {3: 0},
  //     {4: 0}
  //   }]

  // Max suggested alternative
  // const newStructure = {
  //   1: [[2, 76], [3,73], [4,72]],
  //   2: [[1, 76], [3,73], [4,72]]
  // }

  const getListOfTags = (user) => {
    return user.tags_users.map((item) => item.tag.name)
  }

  // loop over online users
  const calculations = onlineUsers.reduce((all, user, index) => {
    const listOfMyTags = getListOfTags(user)
    console.log('makePairings -> listOfMyTags', listOfMyTags)

    // for each tag
    user.tags_users.forEach((tag) => {
      // loop over all users loop over each onlineUser's tags and calc points

      onlineUsers.forEach((onlineUser) => {
        onlineUser.tags_users.forEach((tag) => {
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
