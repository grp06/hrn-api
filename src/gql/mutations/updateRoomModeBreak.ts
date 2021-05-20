import gql from 'graphql-tag'

const updateRoomModeBreak = gql`
  mutation updateRoom($roomModeId: Int!, $breakTime: Boolean!) {
    update_room_modes(where: { id: { _eq: $roomModeId } }, _set: { break_time: $breakTime }) {
      affected_rows
    }
  }
`
export default updateRoomModeBreak
