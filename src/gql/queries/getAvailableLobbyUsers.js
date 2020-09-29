import gql from 'graphql-tag'

const getAvailableLobbyUsers = gql`
  query getAvailableLobbyUsers($eventId: Int!) {
    online_users(where: { event_users: { event_id: { _eq: $eventId } } }) {
      id
      last_seen
      tags_users {
        tag {
          name
        }
      }
    }
  }
`

export default getAvailableLobbyUsers
