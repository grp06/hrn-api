import gql from 'graphql-tag'

const insertRoom = gql`
  mutation insertRoom($objects: [rooms_insert_input!]!) {
    insert_rooms(objects: $objects) {
      returning {
        id
        name
        owner_id
        room_modes_id
      }
    }
  }
`

export default insertRoom
