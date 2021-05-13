import gql from 'graphql-tag'

const insertUser = gql`
  mutation insertUser($objects: [users_insert_input!]!) {
    insert_users(objects: $objects) {
      returning {
        id
        first_name
        last_name
        email
        created_at
        role
      }
    }
  }
`

export default insertUser
