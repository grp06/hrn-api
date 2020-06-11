import gql from 'graphql-tag'

const updateEventStatus = gql`
  mutation updateEventStatus($eventId: Int!, $newStatus: String!) {
    update_events(where: { id: { _eq: $eventId } }, _set: { status: $newStatus }) {
      returning {
        current_round
        description
        ended_at
        event_name
        status
        start_at
        id
        host_id
      }
    }
  }
`

export default updateEventStatus
