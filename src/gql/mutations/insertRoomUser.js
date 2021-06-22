import gql from 'graphql-tag'

const insertRoomUser = gql`
  mutation insertRoomUser($objects: [room_users_insert_input!]!) {
    insert_room_users(
      objects: $objects
      on_conflict: { constraint: room_users_pkey, update_columns: [] }
    ) {
      returning {
        id
        user_id
        last_seen
        room_id
        updated_at
      }
    }
  }
`

export default insertRoomUser
