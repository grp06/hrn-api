import gql from 'graphql-tag'

const getBookmarksFromTimeframe = gql`
  query getBookmarksFromTimeframe($startTime: timestamptz!, $endTime: timestamptz, $roomId: Int!) {
    bookmarks(
      where: {
        _and: { created_at: { _gt: $startTime }, room_mode: { rooms: { id: { _eq: $roomId } } } }
        created_at: { _lt: $endTime }
      }
    ) {
      id
    }
  }
`

export default getBookmarksFromTimeframe
