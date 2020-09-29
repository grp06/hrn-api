import * as Sentry from '@sentry/node'
import { getOnlineUsersByEventId } from '../../gql/queries'
import orm from '../../services/orm'

const getOnlineUsers = async (eventId) => {
  let onlineEventUsers
  try {
    // make the last seen a bit longer to accomodate buffer/lag between clients/server?
    const now = Date.now() // Unix timestamp
    const xMsAgo = 30000 // 20 seconds
    const timestampXMsAgo = now - xMsAgo // Unix timestamp
    const seenAfter = new Date(timestampXMsAgo)

    const eventUsersResponse = await orm.request(getOnlineUsersByEventId, {
      later_than: seenAfter,
      event_id: eventId,
    })

    onlineEventUsers = eventUsersResponse.data.event_users.map((user) => user.user.id)
  } catch (error) {
    console.log('getOnlineUsers -> error', error)
    Sentry.captureException(error)
  }

  return onlineEventUsers
}

export default getOnlineUsers
