import gql from 'graphql-tag'

import { GraphQlResponse } from '../../types'

export type OnlineUser = {
  last_seen: string
  user_id: number
  room_id: number
}

export type OnlineRoomUsersResponse = GraphQlResponse<{
  online_room_users: OnlineUser[]
}>

const getOnlineUsersByRoomId = gql`
  query getOnlineUsersByRoomId($roomId: Int) {
    online_room_users(where: { room_id: { _eq: $roomId } }) {
      last_seen
      user_id
      room_id
    }
  }
`

export default getOnlineUsersByRoomId
