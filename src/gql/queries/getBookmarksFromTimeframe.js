import gql from 'graphql-tag'

const getCronJobs = gql`
  query getBookmarksFromTimeframe($startTime: timestamptz!, $endTime: timestamptz, $ownerId: Int!) {
    bookmarks(
      where: {
        _and: { created_at: { _gt: $startTime }, room_mode: { owner_id: { _eq: $ownerId } } }
        created_at: { _lt: $endTime }
      }
    ) {
      id
    }
  }
`

export default getCronJobs
