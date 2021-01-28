import gql from 'graphql-tag'

const findUserByPhoneNumber = gql`
  query findUserByPhoneNumber($phone_number: String!) {
    users_new(where: { phone_number: { _eq: $phone_number } }) {
      id
      name
      phone_number
      role
      password
    }
  }
`

export default findUserByPhoneNumber
