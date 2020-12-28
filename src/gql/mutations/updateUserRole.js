import gql from 'graphql-tag'

const updateUserRole = gql`
  mutation updateUserRole($user_id: Int!, $role: String!, $became_host_at: timestamptz!) {
    update_users(
      where: { id: { _eq: $user_id } }
      _set: { role: $role, became_host_at: $became_host_at }
    ) {
      returning {
        id
        role
        name
        email
        city
        linkedIn_url
        became_host_at
      }
    }
  }
`
export default updateUserRole
