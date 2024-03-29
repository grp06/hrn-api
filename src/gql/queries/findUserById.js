import gql from 'graphql-tag'

const findUserById = gql`
  query findUserById($id: Int!) {
    users(where: { id: { _eq: $id } }) {
      id
      email
      role
      password
      first_name
      last_name
      created_at
    }
  }
`

export default findUserById
