import gql from 'graphql-tag'

const setEventEndedAt = gql`
  mutation updateCurrentRound($id: Int!) {
    update_events(where: { id: { _eq: $id } }, _inc: { current_round: 1 }) {
      returning {
        current_round
      }
    }
  }
`

export default setEventEndedAt
