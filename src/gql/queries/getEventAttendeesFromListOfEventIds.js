import gql from 'graphql-tag'

const getEventAttendeesFromListOfEventIds = gql`
  query getEventAttendeesFromListOfEventIds($eventIds: [Int!]) {
    partners(where: { event_id: { _in: $eventIds } }, distinct_on: user_id) {
      user {
        email
      }
    }
  }
`
export default getEventAttendeesFromListOfEventIds
