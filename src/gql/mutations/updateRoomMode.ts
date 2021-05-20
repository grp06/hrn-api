import gql from 'graphql-tag'

const updateRoomMode = gql`
  mutation updateRoomMode($roomModeId: Int!, $break: Boolean!, $roundNumber: Int!) {
    update_room_modes(
      where: { id: { _eq: $roomModeId } }
      _set: { break: $break, round_number: $roundNumber }
    ) {
      affected_rows
      returning {
        id
        break
        round_number
      }
    }
  }
`
export default updateRoomMode
