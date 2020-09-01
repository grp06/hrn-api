import gql from 'graphql-tag'

const getEventUsers = gql`
  query getPartnersFromListOfUserIds($userIds: [Int!]) {
    partners(where: { user_id: { _in: $userIds } }) {
      id
      created_at
      dont_rematch
      event_id
      partner_id
      user_id
      user {
        tags_users {
          tag_id
        }
      }
    }
  }
`

export default getEventUsers
