import gql from 'graphql-tag'

const insertRoomMode = gql`
  mutation insertRoomMode($objects: [room_modes_insert_input!]!) {
    insert_room_modes(objects: $objects) {
      returning {
        id
        mode_name
        pause
        total_rounds
        round_number
        round_length
      }
    }
  }
`

export default insertRoomMode
