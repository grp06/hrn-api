import gql from 'graphql-tag'

const getCompositionsByOwnerId = gql`
  query getCompositionsByOwnerId($ownerId: Int!) {
    compositions(where: { owner_id: { _eq: $ownerId } }, order_by: { recording_started_at: desc }) {
      recording_started_at
      id
      bookmarks {
        created_at
      }
      user {
        first_name
      }
      composition_sid
    }
  }
`

export default getCompositionsByOwnerId
