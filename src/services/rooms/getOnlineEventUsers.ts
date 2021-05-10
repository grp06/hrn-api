import * as Sentry from '@sentry/node'

import { getAvailableLobbyUsers } from '../../gql/queries'
import { GraphQlResponse } from '../../types'
import orm from '../orm'

type OnlineUser = {
  event_id: number
  last_seen: string
  user_id: number
  side: null | unknown // TODO: what type is this?
  tags_users: {
    tag: {
      name: string
    }
  }[]
}

type OnlineEventUsersResponse = GraphQlResponse<{
  online_event_users: OnlineUser[]
}>

/**
 * Get available users in a lobby
 */
const getOnlineEventUsers = async (eventId: number): Promise<[number[], OnlineUser[]]> => {
  const onlineUsersResponse: OnlineEventUsersResponse = await orm.request(getAvailableLobbyUsers, {
    eventId,
  })

  // Check if there are any errors
  if (onlineUsersResponse.errors) {
    Sentry.captureException(onlineUsersResponse.errors[0].message)
    throw new Error(onlineUsersResponse.errors[0].message)
  }

  const onlineUsers = onlineUsersResponse.data.online_event_users
  console.info(`(getOnlineEventUsers) 🟢 Found ${onlineUsers.length} online users`)

  const userIds = onlineUsers.map((user) => user.user_id)
  return [userIds, onlineUsers]
}

export default getOnlineEventUsers
