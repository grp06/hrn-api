import gql from 'graphql-tag'

const findUserByIssuer = gql`
  query findUserByIssuer($issuer: String!) {
    users(where: { issuer: { _eq: $issuer } }) {
      id
      first_name
      last_name
      issuer
    }
  }
`

export default findUserByIssuer
