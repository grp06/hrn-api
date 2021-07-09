import gql from 'graphql-tag'

const getRoomLogin = gql`
  query getRoomLogin($roomId: Int!) {
    rooms_by_pk(id: $roomId) {
      password
    }
  }
`
export default getRoomLogin