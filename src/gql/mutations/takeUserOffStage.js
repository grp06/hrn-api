import gql from 'graphql-tag'

const takeUserOffStage = gql`
  mutation takeUserOffStage($userId: Int!, $roomId: Int!) {
    update_room_users(
      where: { user_id: { _eq: $userId }, room_id: { _eq: $roomId } }
      _set: { on_stage: false, last_seen: null }
    ) {
      affected_rows
    }
  }
`

export default takeUserOffStage
