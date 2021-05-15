import gql from 'graphql-tag'

const updateRoomModeBreak = gql`
  mutation updateRoom($roomModeId: Int!, $break: Boolean!) {
    update_room_modes(where: { id: { _eq: $roomModeId } }, _set: { break: $break }) {
      affected_rows
    }
  }
`
export default updateRoomModeBreak
