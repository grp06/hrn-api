import gql from 'graphql-tag'

const query = gql`
  mutation insertUser($objects: [users_insert_input!]!) {
    insert_users(objects: $objects) {
      returning {
        id
        name
        email
        password
        role
      }
    }
  }
`

export default query