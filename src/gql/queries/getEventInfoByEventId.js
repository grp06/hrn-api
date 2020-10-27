import gql from 'graphql-tag'

const getEventInfoByEventId = gql`
  query getEventInfoByEventId($eventId: Int!) {
    events(where: { id: { _eq: $eventId } }) {
      id
      status
      current_round
      updated_at
      round_length
      host_id
      group_video_chat
    }
  }
`
export default getEventInfoByEventId
