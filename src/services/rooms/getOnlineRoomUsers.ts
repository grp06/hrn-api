import * as Sentry from '@sentry/node'

import getOnlineUsersByRoomId, {
  OnlineRoomUsersResponse,
  OnlineUser,
} from '../../gql/queries/getOnlineUsersByRoomId'
import orm from '../orm'

type GetOnlineRoomUsers = (
  roomId: number
) => Promise<{ userIds: number[]; onlineUsers: OnlineUser[] }>

/**
 * Get available users in a lobby
 */
const getOnlineRoomUsers: GetOnlineRoomUsers = async (roomId: number) => {
  const onlineUsersResponse: OnlineRoomUsersResponse = await orm.request(getOnlineUsersByRoomId, {
    roomId,
  })

  // Check if there are any errors
  if (onlineUsersResponse.errors) {
    Sentry.captureException(onlineUsersResponse.errors[0].message)
    throw new Error(onlineUsersResponse.errors[0].message)
  }

  const onlineUsers = onlineUsersResponse.data.online_room_users
  console.info(
    `(getOnlineRoomUsers) 🟢 Found ${onlineUsers?.length} online users in the room ${roomId}`,
  )

  const userIds = onlineUsers.map((user) => user.user_id)

  return {
    userIds,
    onlineUsers,
  }
}

export default getOnlineRoomUsers
