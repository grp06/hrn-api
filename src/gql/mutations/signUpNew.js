import gql from 'graphql-tag'

const insertUserNew = gql`
  mutation insertUserNew($objects: [users_new_insert_input!]!) {
    insert_users_new(objects: $objects) {
      returning {
        id
        email
        created_at
        role
        name
        cash_app
        phone_number
        profile_pic_url
        venmo
      }
    }
  }
`

export default insertUserNew
