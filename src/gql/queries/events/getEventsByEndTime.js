import gql from 'graphql-tag'

export const getEventsByEndTime = gql`
  query MyQuery($less_than: timestamptz, $greater_than: timestamptz) {
    events(where: { ended_at: { _lte: $less_than, _gt: $greater_than } }) {
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

export default getEventsByEndTime
