import gql from 'graphql-tag'

const insertRoomUser = gql`
  mutation insertRoomChatMessage($senderId: Int!, $roomId: Int!, $content: String!) {
    insert_room_chat_messages(
      objects: { content: $content, room_id: $roomId, sender_id: $senderId }
    ) {
      returning {
        id
      }
    }
  }
`

export default insertRoomUser
