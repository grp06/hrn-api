import gql from 'graphql-tag'

const getOnlineRoomUsersByRoomId = gql`
  query getOnlineRoomUsersByRoomId($roomId: Int!) {
    online_room_users(where: { room_id: { _eq: $roomId } }) {
      on_stage
      user_id
    }
  }
`

export default getOnlineRoomUsersByRoomId
