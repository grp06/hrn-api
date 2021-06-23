import gql from 'graphql-tag'

const updateRoomUser = gql`
  mutation updateRoomUser($roomId: Int!, $userId: Int!) {
    update_room_users(
      where: { room_id: { _eq: $roomId }, user_id: { _eq: $userId } }
      _set: { on_stage: true }
    ) {
      affected_rows
    }
  }
`

export default updateRoomUser
