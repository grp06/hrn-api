import gql from 'graphql-tag'

export const findUserById = gql`
  query findUserById($id: Int!) {
    users(where: { id: { _eq: $id } }) {
      id
      email
      role
      password
      name
      last_seen
    }
  }
`

export default findUserById