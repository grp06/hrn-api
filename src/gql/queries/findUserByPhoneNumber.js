import gql from 'graphql-tag'

const findUserByPhoneNumber = gql`
  query findUserByPhoneNumber($phoneNumber: String!) {
    users_new(where: { phone_number: { _eq: $phoneNumber } }) {
      id
      name
      phone_number
      role
      password
    }
  }
`

export default findUserByPhoneNumber
