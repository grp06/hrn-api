import gql from 'graphql-tag'

const updateUserRole = gql`
  mutation updateUserRole($user_id: Int!, $role: String!) {
    update_users(where: { id: { _eq: $user_id } }, _set: { role: $role }) {
      returning {
        id
        role
        name
      }
    }
  }
`
export default updateUserRole
