import gql from 'graphql-tag'

// make sure to only pull for the current eventId

const getPredeterminedPartnersFromListOfUserIds = gql`
  query getPredeterminedPartnersFromListOfUserIds($userIds: [Int!], $eventId: Int!) {
    predetermined_partners(
      where: {
        partner_1_id: { _in: $userIds }
        _and: { partner_2_id: { _in: $userIds }, event_id: { _eq: $eventId } }
        event_id: { _eq: $eventId }
      }
    ) {
      partner_1_id
      partner_2_id
    }
  }
`

export default getPredeterminedPartnersFromListOfUserIds
