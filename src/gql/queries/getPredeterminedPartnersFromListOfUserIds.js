import gql from 'graphql-tag'

const getPredeterminedPartnersFromListOfUserIds = gql`
  query getPredeterminedPartnersFromListOfUserIds($userIds: [Int!]) {
    predetermined_partners(
      where: { partner_1_id: { _in: $userIds }, _and: { partner_2_id: { _in: $userIds } } }
    ) {
      partner_1_id
      partner_2_id
    }
  }
`

export default getPredeterminedPartnersFromListOfUserIds
