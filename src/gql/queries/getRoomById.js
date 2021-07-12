import gql from 'graphql-tag'

const getRoomById = gql`
  query getRoomById($roomId: Int!) {
    rooms(where: { id: { _eq: $roomId } }) {
      id
      owner_id
      owner {
        password
      }
    }
  }
`

export default getRoomById
