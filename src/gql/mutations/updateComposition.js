import gql from 'graphql-tag'

const updateComposition = gql`
  mutation updateComposition(
    $latestCompositionId: Int!
    $compositionSid: String!
    $recordingEndedAt: timestamptz!
    $status: String!
  ) {
    update_compositions(
      where: { id: { _eq: $latestCompositionId } }
      _set: {
        composition_sid: $compositionSid
        recording_ended_at: $recordingEndedAt
        status: $status
      }
    ) {
      affected_rows
    }
  }
`

export default updateComposition
