import gql from 'graphql-tag'

const findUserByEmail = gql`
  query findUserByEmail($email: String!) {
    users(where: { email: { _eq: $email } }) {
      id
      email
      role
      password
      first_name
      last_name
      created_at
    }
  }
`

export default findUserByEmail
