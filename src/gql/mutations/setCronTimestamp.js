import gql from 'graphql-tag'

const setCronTimestamp = gql`
  mutation setCronTimestamp($eventId: Int!, $timestamp: timestamptz) {
    insert_cron_jobs(objects: { event_id: $eventId, next_round_start: $timestamp }) {
      affected_rows
    }
  }
`

export default setCronTimestamp
