import gql from 'graphql-tag'

const updateRoomName = gql`
  mutation updateRoomName($name: String!, $roomId: Int!) {
    update_rooms(where: { id: { _eq: $roomId } }, _set: { name: $name }) {
      affected_rows
    }
  }
`

export default updateRoomName
