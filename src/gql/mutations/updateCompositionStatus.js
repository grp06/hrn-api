import gql from 'graphql-tag'

const updateCompositionStatus = gql`
  mutation updateCompositionStatus($compositionSid: String!) {
    update_compositions(
      where: { composition_sid: { _eq: $compositionSid } }
      _set: { status: "completed" }
    ) {
      affected_rows
    }
  }
`

export default updateCompositionStatus
