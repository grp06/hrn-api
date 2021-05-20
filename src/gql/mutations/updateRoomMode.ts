import gql from 'graphql-tag'

const updateRoomMode = gql`
  mutation updateRoomMode($roomModeId: Int!, $breakTime: Boolean!, $roundNumber: Int!) {
    update_room_modes(
      where: { id: { _eq: $roomModeId } }
      _set: { break_time: $breakTime, round_number: $roundNumber }
    ) {
      affected_rows
      returning {
        id
        break_time
        round_number
      }
    }
  }
`
export default updateRoomMode
