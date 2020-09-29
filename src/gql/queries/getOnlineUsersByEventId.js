import gql from 'graphql-tag'

const getOnlineUsersByEventId = gql`
  query getOnlineUsersByEventId($later_than: timestamptz, $event_id: Int) {
    event_users(
      where: { user: { updated_at: { _gte: $later_than } }, _and: { event_id: { _eq: $event_id } } }
      order_by: { user: { id: asc } }
    ) {
      user {
        id
        updated_at
        name
      }
    }
  }
`

export default getOnlineUsersByEventId
