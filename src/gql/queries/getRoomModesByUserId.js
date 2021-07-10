import gql from 'graphql-tag'

const getRoomUsersByRoomId = gql`
  query getRoomModesByUserId($userId: Int!) {
    room_modes(where: { owner_id: { _eq: $userId } }) {
      twilio_room_sid
    }
  }
`

export default getRoomUsersByRoomId
