import generateInitialPointsArr from './generateInitialPointsArray'

const calculatePoints = ({ onlineUsers }) => {
  const onlineUsersIdArray = onlineUsers.map((user) => user.user_id)

  // start out with this points array where everyone has 0 points
  const pointsArr = generateInitialPointsArr(onlineUsersIdArray)

  // map over it to make tags easier to work with
  // tags: ['guitar', 'basketball', 'piano', 'investment banking']
  const onlineUsersWithSimplifiedTags = onlineUsers.map((user) => {
    return {
      id: user.user_id,
      last_seen: user.last_seen,
      tags: user.tags_users.map((tagObj) => tagObj.tag.name),
      side: user.side,
    }
  })

  // loop over online users
  onlineUsersWithSimplifiedTags.forEach((myUser) => {
    // for each of my tags
    const myPointsObj = pointsArr.find((pointsObj) => {
      return pointsObj.userId === myUser.id
    })
    myUser.tags.forEach((tagString) => {
      // check each online user and see if we share a tag
      onlineUsersWithSimplifiedTags.forEach((partner) => {
        const userToAdjustPointsOn = myPointsObj.scores.find((u) => {
          const partnerIdWithinMyPointsObj = parseInt(Object.keys(u)[0], 10)

          return partner.id === partnerIdWithinMyPointsObj
        })

        if (myUser.id !== partner.id) {
          const tenPointsAndChange = Number(Math.random().toFixed(3)) + 10

          // if me and my partner are on the same side, subtract points
          if (myUser.side && partner.side && myUser.side === partner.side) {
            userToAdjustPointsOn[partner.id] -= 999
          }

          partner.tags.forEach((partnerTag) => {
            const iAlsoHaveThisTag = tagString === partnerTag
            // and if we share this tag, increment on that user on "my" object
            if (iAlsoHaveThisTag) {
              userToAdjustPointsOn[partner.id] += tenPointsAndChange
            }
          })
        }
      })
    })
  })
  return pointsArr
}

export default calculatePoints
