import gql from 'graphql-tag'

const getRoomUsersByRoomId = gql`
  query getRoomUsersByRoomId($roomId: Int!) {
    online_room_users(where: { room_id: { _eq: $roomId } }) {
      on_stage
      user_id
    }
  }
`

export default getRoomUsersByRoomId
