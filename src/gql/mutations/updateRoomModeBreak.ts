import gql from 'graphql-tag'

const updateRoomModeBreak = gql`
  mutation updateRoom($roomModeId: Int!, $pause: Boolean!) {
    update_room_modes(where: { id: { _eq: $roomModeId } }, _set: { pause: $pause }) {
      affected_rows
    }
  }
`
export default updateRoomModeBreak
