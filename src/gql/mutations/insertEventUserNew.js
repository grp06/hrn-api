import gql from 'graphql-tag'

const insertEventUserNew = gql`
  mutation insertEventUserNew($event_id: Int!, $user_id: Int!) {
    insert_chit_chat_users(objects: { event_id: $event_id, user_id: $user_id }) {
      returning {
        id
        user_id
        event_id
        event {
          chit_chat_users {
            user_id
            status
          }
        }
      }
    }
  }
`

export default insertEventUserNew
