import gql from 'graphql-tag'

const deleteRoomMode = gql`
  mutation deleteRoomMode($roomModeId: Int!) {
    delete_room_mode_cronjobs(where: { room_modes_id: { _eq: $roomModeId } }) {
      affected_rows
    }
  }
`
export default deleteRoomMode
