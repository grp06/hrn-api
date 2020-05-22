import gql from 'graphql-tag'

export const query = gql`
  query getUsers {
    users(where: {}) {
      id
      role
      name
      email
      role
      last_seen
    }
  }
`

export default query
