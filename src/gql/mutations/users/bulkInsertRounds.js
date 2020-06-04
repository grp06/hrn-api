import gql from 'graphql-tag'

const bulkInsertRounds = gql`
  mutation bulkInsertRounds($objects: [rounds_insert_input!]!) {
    insert_rounds(objects: $objects) {
      returning {
        id
        partnerX_id
        partnerY_id
        round_number
        started_at
        event_id
        partnerX_thumb
        partnerY_thumb
      }
    }
  }
`
export default bulkInsertRounds
