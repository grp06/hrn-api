import gql from 'graphql-tag'

export const getEventStatusByEventId = gql`
  query getEventStatusByEventId($eventId: Int!) {
    events(where: { id: { _eq: $eventId } }) {
      id
      status
    }
  }
`
