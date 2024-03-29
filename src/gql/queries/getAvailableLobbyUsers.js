import gql from 'graphql-tag'

const getAvailableLobbyUsers = gql`
  query getAvailableLobbyUsers($eventId: Int!) {
    online_event_users(where: { event_id: { _eq: $eventId } }) {
      event_id
      last_seen
      user_id
      side
      tags_users {
        tag {
          name
        }
      }
    }
  }
`

export default getAvailableLobbyUsers
