import gql from 'graphql-tag'

const insertUser = gql`
  mutation insertUser($objects: [users_insert_input!]!) {
    insert_users(objects: $objects) {
      returning {
        id
        first_name
        last_name
        email
        role
        created_at
      }
    }
  }
`

export default insertUser
