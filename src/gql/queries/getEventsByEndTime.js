import gql from 'graphql-tag'

const getEventsByEndTime = gql`
  query getEventsByEndTime($less_than: timestamptz, $greater_than: timestamptz) {
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
      event_users {
        user {
          email
        }
      }
      host {
        email
      }
    }
  }
`

export default getEventsByEndTime
