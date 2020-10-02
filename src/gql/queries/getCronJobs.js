import gql from 'graphql-tag'

const getCronJobs = gql`
  query getCronJobs {
    cron_jobs(where: { next_round_start: { _is_null: false } }) {
      next_round_start
      event {
        num_rounds
        id
        round_length
        current_round
      }
    }
  }
`

export default getCronJobs
