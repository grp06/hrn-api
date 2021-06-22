import gql from 'graphql-tag'

const deleteRoomChats = gql`
  mutation deleteRoomChats($roomId: Int!) {
    delete_room_chat_messages(where: { room_id: { _eq: $roomId } }) {
      affected_rows
    }
  }
`

export default deleteRoomChats
