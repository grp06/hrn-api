import gql from 'graphql-tag'

const updateUserEmail = gql`
  mutation updateUser($user_id: Int!, $email: String!) {
    update_users(where: { id: { _eq: $user_id } }, _set: { email: $email }) {
      affected_rows
    }
  }
`
export default updateUserEmail
