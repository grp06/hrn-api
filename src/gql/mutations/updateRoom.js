import gql from 'graphql-tag'

const updateRoom = gql`
  mutation updateRoom($roomId: Int!, $roomModesId: Int!) {
    update_rooms(where: { id: { _eq: $roomId } }, _set: { room_modes_id: $roomModesId }) {
      affected_rows
    }
  }
`
export default updateRoom
