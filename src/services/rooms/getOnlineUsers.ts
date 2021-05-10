import * as Sentry from '@sentry/node'

import { getOnlineUsersByEventId } from '../../gql/queries'
import orm from '../orm'

// TODO: create a generic type for Hasura result type
type OnlineUsers = {
  data: {
    event_users: {
      user: {
        id: number
        updated_at: string // TODO: specify that's a Date string
        name: string
      }
    }[]
  }
}

/**
 * Get the online users
 * @param eventId
 */
const getOnlineUsers = async (eventId: number): Promise<number[] | undefined> => {
  // TODO: Make the last seen a bit longer to accommodate buffer/lag between clients/server?
  const thirtySecInMs = 30000 // 30 seconds // TODO: move to constant
  const timestampXMsAgo = Date.now() - thirtySecInMs // Unix timestamp
  const seenAfter = new Date(timestampXMsAgo)

  try {
    const eventUsersResponse: OnlineUsers = await orm.request(getOnlineUsersByEventId, {
      later_than: seenAfter,
      event_id: eventId,
    })

    return eventUsersResponse.data.event_users.map((user) => user.user.id)
  } catch (error) {
    console.error('(getOnlineUsers) 🙊 There was an error:', error)
    Sentry.captureException(error)
    return undefined
  }
}

export default getOnlineUsers
