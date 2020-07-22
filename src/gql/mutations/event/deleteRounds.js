import gql from 'graphql-tag'

const deleteRounds = gql`
  mutation deleteAllRounds($eventId: Int!) {
    delete_rounds(where: { event_id: { _eq: $eventId } }) {
      affected_rows
    }
  }
`
export default deleteRounds
