import gql from 'graphql-tag'

const getEventUsers = gql`
  query getPartnersFromListOfUserIds($userIds: [Int!]) {
    partners(where: { user_id: { _in: $userIds } }) {
      id
      event_id
      partner_id
      user_id
      left_chat
      rating
    }
  }
`

export default getEventUsers
