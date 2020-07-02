import gql from 'graphql-tag'

export const getEventsByStartTime = gql`
  query getEventsByStartTime($start_time: timestamptz!) {
    events(where: {start_at: {_gte: $start_time}}) {
        event_name
        ended_at
        description
        current_round
        host_id
        id
        round_length
        start_at
        status
      }
  }
`

export default getEventsByStartTime