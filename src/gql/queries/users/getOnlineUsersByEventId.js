import gql from 'graphql-tag'

export const getOnlineUsersByEventId = gql`
  query getOnlineUsersByEventId($later_than: timestamptz, $event_id: Int) {
    event_users(
      where: { user: { last_seen: { _gte: $later_than } }, _and: { event_id: { _eq: $event_id } } }
    ) {
      user {
        id
        last_seen
        name
      }
    }
  }
`

export default getOnlineUsersByEventId
