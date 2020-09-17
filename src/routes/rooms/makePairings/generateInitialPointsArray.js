const generateInitialPointsArr = (onlineUsers) => {
  const pointsArr = onlineUsers.map((userId) => ({ userId, scores: [] }))

  pointsArr.forEach((userObj) => {
    onlineUsers.forEach((user) => {
      const currentUserId = userObj.userId
      if (currentUserId !== user) {
        userObj.scores.push({ [user]: 0 })
      }
    })
  })

  return pointsArr
}

export default generateInitialPointsArr
