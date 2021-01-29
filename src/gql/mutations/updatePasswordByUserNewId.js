import gql from 'graphql-tag'

const query = gql`
  mutation updatePasswordByUserId($id: Int!, $newPassword: String!) {
    update_users_new(where: { id: { _eq: $id } }, _set: { password: $newPassword }) {
      returning {
        id
        email
        role
      }
    }
  }
`

export default query
