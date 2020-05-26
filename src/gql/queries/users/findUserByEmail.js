import gql from 'graphql-tag'

export const findUserByEmail = gql`
  query findUserByEmail($email: String!) {
    users(where: { email: { _eq: $email } }) {
      id
      email
      role
      password
      name
      last_seen
    }
  }
`

export default findUserByEmail