import getOnlineUsers from './getOnlineUsers'

const createPairingsForTwoSidedEvent = async ({ eventId }) => {
  const [userIds, onlineUsers] = await getOnlineUsers(eventId)
}
