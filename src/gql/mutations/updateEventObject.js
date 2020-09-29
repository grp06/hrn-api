import gql from 'graphql-tag'

const updateEventObject = gql`
  mutation updateEventObject(
    $id: Int!
    $newCurrentRound: Int
    $newStatus: String
    $ended_at: timestamptz
  ) {
    update_events(
      where: { id: { _eq: $id } }
      _set: { current_round: $newCurrentRound, status: $newStatus, ended_at: $ended_at }
    ) {
      returning {
        id
        current_round
        host_id
        event_name
      }
    }
  }
`

export default updateEventObject
