import gql from 'graphql-tag'

const insertRoomModeCronjob = gql`
  mutation insertRoomModeCronjob(
    $roomId: Int!
    $roomModeId: Int!
    $roundNumber: Int!
    $timestamp: timestamptz!
  ) {
    insert_room_mode_cronjobs(
      objects: {
        room_id: $roomId
        room_modes_id: $roomModeId
        round_number: $roundNumber
        timestamp: $timestamp
      }
    ) {
      affected_rows
      returning {
        id
        room_id
        room_modes_id
        round_number
      }
    }
  }
`

export default insertRoomModeCronjob
