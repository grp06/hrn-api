import gql from 'graphql-tag'

const deleteRoomById = gql`
  mutation deleteRoomById($roomId: Int) {
    delete_rooms(where: { id: { _eq: $roomId } }) {
      affected_rows
    }
  }
`

export default deleteRoomById
