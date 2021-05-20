import gql from 'graphql-tag'

const updateRoom = gql`
  mutation updateRoom($roomId: Int!, $roomModesId: Int!) {
    update_rooms(where: { id: { _eq: $roomId } }, _set: { room_modes_id: $roomModesId }) {
      returning {
        id
        owner_id
        name
        room_modes_id
      }
    }
  }
`
export default updateRoom
