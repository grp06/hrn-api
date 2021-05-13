import gql from 'graphql-tag'

const insertRoomUser = gql`
  mutation insertRoomUser($objects: [room_users_insert_input!]!) {
    insert_room_users(objects: $objects) {
      returning {
        id
      }
    }
  }
`

export default insertRoomUser
