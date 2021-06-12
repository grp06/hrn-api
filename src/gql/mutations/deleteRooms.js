import gql from 'graphql-tag'

const deleteRooms = gql`
  mutation deleteRooms($roomIds: [Int!]!) {
    delete_rooms(where: { id: { _in: $roomIds } }) {
      affected_rows
    }
  }
`
export default deleteRooms
