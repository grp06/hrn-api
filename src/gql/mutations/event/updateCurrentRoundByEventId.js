import gql from 'graphql-tag'

const updateCurrentRoundByEventId = gql`
  mutation updateCurrentRoundByEventId($id: Int!, $newCurrentRound: Int!) {
    update_events(where: { id: { _eq: $id } }, _set: { current_round: $newCurrentRound }) {
      returning {
        id
        current_round
        host_id
        event_name
      }
    }
  }
`

export default updateCurrentRoundByEventId
