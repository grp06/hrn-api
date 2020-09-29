import gql from 'graphql-tag'

const getRoundsByEventId = gql`
  query getRoundsByEventId($event_id: Int!) {
    rounds(where: { event_id: { _eq: $event_id } }) {
      id
      round_number
      partnerX_id
      partnerY_id
      ended_at
    }
  }
`

export default getRoundsByEventId
