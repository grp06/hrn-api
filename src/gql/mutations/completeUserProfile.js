import gql from 'graphql-tag'

const completeUserProfile = gql`
  mutation updateUser(
    $first_name: String!
    $last_name: String!
    $password: String
    $id: Int!
    $email: String!
  ) {
    update_users(
      where: { id: { _eq: $id } }
      _set: { email: $email, last_name: $last_name, password: $password, first_name: $first_name }
    ) {
      returning {
        id
        first_name
        last_name
        email
        password
        role
        created_at
      }
    }
  }
`
export default completeUserProfile
