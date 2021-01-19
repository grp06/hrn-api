import gql from 'graphql-tag'

const findUserNewById = gql`
  query findUserNewById($id: Int) {
    users_new(where: { id: { _eq: $id } }) {
      cash_app
      email
      id
      name
      phone_number
      role
      venmo
      profile_pic_url
    }
  }
`

export default findUserNewById
