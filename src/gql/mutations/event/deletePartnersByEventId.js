import gql from 'graphql-tag'

const deletePartnersByEventId = gql`
  mutation deletePartnersByEventId($eventId: Int!) {
    delete_partners(where: { event_id: { _eq: $eventId } }) {
      affected_rows
    }
  }
`
export default deletePartnersByEventId
