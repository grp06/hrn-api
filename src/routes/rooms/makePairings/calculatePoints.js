import generateInitialPointsArr from './generateInitialPointsArray'
import checkIfUsersMatchedThisEvent from './checkIfUsersMatchedThisEvent'

const calculatePoints = ({ onlineUsers, partnersRows, currentRound }) => {
  const onlineUsersIdArray = onlineUsers.map((user) => user.id)
  const pointsArr = generateInitialPointsArr(onlineUsersIdArray)

  const onlineUsersWithSimplifiedTags = onlineUsers.map((user) => {
    return {
      id: user.id,
      last_seen: user.last_seen,
      tags: user.tags_users.map((tagObj) => tagObj.tag.name),
    }
  })

  // loop over online users
  onlineUsersWithSimplifiedTags.forEach((myUser) => {
    // for each tag
    myUser.tags.forEach((tagString) => {
      // check each online user and see if we share a tag
      onlineUsersWithSimplifiedTags.forEach((partner) => {
        const alreadyMatchedThisEvent = checkIfUsersMatchedThisEvent(
          myUser.id,
          partner.id,
          partnersRows,
          currentRound
        )
        if (myUser.id !== partner.id || alreadyMatchedThisEvent) {
          partner.tags.forEach((partnerTag) => {
            const iAlsoHaveThisTag = tagString === partnerTag
            // and if we share this tag, increment on that user on "my" object
            if (iAlsoHaveThisTag) {
              const pointDefault = Number(Math.random().toFixed(3)) + 10
              const myPointsObj = pointsArr.find((partnerObj) => partnerObj.userId === myUser.id)

              const userToIncrementPointsOn = myPointsObj.scores.find((u) => {
                const currentUsersId = parseInt(Object.keys(u)[0], 10)
                return partner.id === currentUsersId
              })

              console.log(`added ${pointDefault} points because we match on ${partnerTag}`)
              userToIncrementPointsOn[partner.id] += pointDefault
            }
          })
        }
      })
    })
  })
  return pointsArr
}

export default calculatePoints
