import generateInitialPointsArr from './generateInitialPointsArray'
import adjustPointsBasedOnPreviousInteratction from './adjustPointsBasedOnPreviousInteratction'

const calculatePoints = ({ onlineUsers, allRoundsDataForOnlineUsers, eventId }) => {
  const onlineUsersIdArray = onlineUsers.map((user) => user.id)

  // start out with this points array where everyone has 0 points
  const pointsArr = generateInitialPointsArr(onlineUsersIdArray)

  // map over it to make tags easier to work with
  // tags: ['guitar', 'basketball', 'piano', 'investment banking']
  const onlineUsersWithSimplifiedTags = onlineUsers.map((user) => {
    return {
      id: user.id,
      last_seen: user.last_seen,
      tags: user.tags_users.map((tagObj) => tagObj.tag.name),
    }
  })

  // console.log('calculatePoints -> pointsArr', JSON.stringify(pointsArr, null, 2))
  // loop over online users
  onlineUsersWithSimplifiedTags.forEach((myUser) => {
    // for each of my tags
    myUser.tags.forEach((tagString) => {
      // check each online user and see if we share a tag
      onlineUsersWithSimplifiedTags.forEach((partner) => {
        if (myUser.id !== partner.id) {
          // make sure that neither user has given the other 1 star
          // the two users in question haven't already matched this event
          const pointsAdjustment = adjustPointsBasedOnPreviousInteratction({
            userA: myUser.id,
            userB: partner.id,
            allRoundsDataForOnlineUsers,
            eventId,
          })
          const pointDefault = Number(Math.random().toFixed(3)) + 10
          const myPointsObj = pointsArr.find((pointsObj) => pointsObj.userId === myUser.id)

          const userToAdjustPointsOn = myPointsObj.scores.find((u) => {
            const partnerIdWithinMyPointsObj = parseInt(Object.keys(u)[0], 10)

            return partner.id === partnerIdWithinMyPointsObj
          })

          if (pointsAdjustment === 0) {
            partner.tags.forEach((partnerTag) => {
              const iAlsoHaveThisTag = tagString === partnerTag
              // and if we share this tag, increment on that user on "my" object
              if (iAlsoHaveThisTag) {
                userToAdjustPointsOn[partner.id] += pointDefault
              }
            })
          } else {
            userToAdjustPointsOn[partner.id] += pointsAdjustment
          }
        }
      })
    })
  })
  return pointsArr
}

export default calculatePoints
