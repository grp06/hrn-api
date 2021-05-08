import gql from 'graphql-tag'

const updateNames = gql`
  mutation updateNames($userId: Int!, $firstName: String!, $lastName: String) {
    update_users(
      where: { id: { _eq: $userId } }
      _set: { first_name: $firstName, last_name: $lastName }
    ) {
      returning {
        id
        email
        role
      }
    }
  }
`

export default updateNames
