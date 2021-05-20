import gql from 'graphql-tag'

const completeUserProfile = gql`
  mutation updateUser(
    $firstName: String!
    $lastName: String!
    $password: String
    $id: Int!
    $email: String!
  ) {
    update_users(
      where: { id: { _eq: $id } }
      _set: { email: $email, last_name: $lastName, password: $password, first_name: $firstName }
    ) {
      returning {
        created_at
        email
        first_name
        id
        last_name
        password
        role
      }
    }
  }
`
export default completeUserProfile
