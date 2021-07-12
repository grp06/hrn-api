import gql from 'graphql-tag'

const updateBookmarksWithCompositionSid = gql`
  mutation updateBookmarksWithCompositionSid(
    $startTime: timestamptz!
    $endTime: timestamptz
    $roomId: Int!
    $compositionSid: String!
  ) {
    update_bookmarks(
      where: {
        _and: { created_at: { _gt: $startTime } }
        created_at: { _lt: $endTime }
        room_mode: { rooms: { id: { _eq: $roomId } } }
      }
      _set: { composition_sid: $compositionSid }
    ) {
      affected_rows
    }
  }
`

export default updateBookmarksWithCompositionSid
