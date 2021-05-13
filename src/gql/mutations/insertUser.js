import gql from 'graphql-tag'

const insertUser = gql`
  mutation insertUser($objects: [users_insert_input!]!) {
    insert_users(objects: $objects) {
      returning {
        id
      }
    }
  }
`

export default insertUser
