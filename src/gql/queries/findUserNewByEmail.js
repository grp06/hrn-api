import gql from 'graphql-tag'

const findUserNewByEmail = gql`
  query findUserNewByEmail($email: String!) {
    users_new(where: { email: { _eq: $email } }) {
      created_at
      email
      id
      name
      password
      role
    }
  }
`

export default findUserNewByEmail
