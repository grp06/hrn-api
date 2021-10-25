import gql from 'graphql-tag'

const insertUser = gql`
  mutation insertUser($objects: [users_insert_input!]!) {
    insert_users(objects: $objects) {
      returning {
        id
        issuer
        publicAddress
        email
      }
    }
  }
`

export default insertUser
