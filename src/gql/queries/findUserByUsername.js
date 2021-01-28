import gql from 'graphql-tag'

const findUserByUsername = gql`
  query findUserByUsername($username: String!) {
    users_new(where: { username: { _eq: $username } }) {
      id
    }
  }
`

export default findUserByUsername
