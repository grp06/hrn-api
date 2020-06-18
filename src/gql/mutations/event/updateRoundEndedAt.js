import gql from 'graphql-tag'

const updateRoundEndedAt = gql`
  mutation updateRoundEndedAt($event_id: Int!, $roundNumber: Int!, $endedAt: timestamptz) {
    update_rounds(
      where: { round_number: { _eq: $roundNumber }, event_id: { _eq: $event_id } }
      _set: { ended_at: $endedAt }
    ) {
      returning {
        ended_at
      }
    }
  }
`

export default updateRoundEndedAt
