import * as Sentry from '@sentry/node'
import orm from '../services/orm'
import { getAvailableLobbyUsers } from '../gql/queries'

const getOnlineUsers = async (eventId) => {
  const onlineUsersResponse = await orm.request(getAvailableLobbyUsers, {
    eventId,
  })

  if (onlineUsersResponse.errors) {
    Sentry.captureException(onlineUsersResponse.errors[0].message)
    throw new Error(onlineUsersResponse.errors[0].message)
  }

  const onlineUsers = onlineUsersResponse.data.online_users
  console.log(`found ${onlineUsers.length} online users`)

  const userIds = onlineUsers.map((user) => user.id)
  return [userIds, onlineUsers]
}

export default getOnlineUsers
