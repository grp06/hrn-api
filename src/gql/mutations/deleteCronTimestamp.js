import gql from 'graphql-tag'

const deleteCronTimestamp = gql`
  mutation deleteCronTimestamp($eventId: Int!) {
    delete_cron_jobs(where: { event_id: { _eq: $eventId } }) {
      affected_rows
    }
  }
`

export default deleteCronTimestamp
