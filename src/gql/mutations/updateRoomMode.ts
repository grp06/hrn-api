import gql from 'graphql-tag'

const updateRoomMode = gql`
  mutation updateRoomMode($roomModeId: Int!, $pause: Boolean!, $roundNumber: Int!) {
    update_room_modes(
      where: { id: { _eq: $roomModeId } }
      _set: { pause: $pause, round_number: $roundNumber }
    ) {
      affected_rows
      returning {
        id
        pause
        round_number
        rooms {
          id
        }
      }
    }
  }
`
export default updateRoomMode
