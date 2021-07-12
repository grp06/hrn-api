import gql from 'graphql-tag'

const getCompositionsByOwnerId = gql`
  query getCompositionsByOwnerId($ownerId: Int!) {
    compositions(
      where: { owner_id: { _eq: $ownerId }, _and: { status: { _eq: "completed" } } }
      order_by: { recording_started_at: desc }
    ) {
      recording_started_at
      recording_ended_at
      id
      bookmarks {
        created_at
      }
      user {
        first_name
      }
      url
    }
  }
`

export default getCompositionsByOwnerId
