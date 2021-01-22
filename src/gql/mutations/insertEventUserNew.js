import gql from 'graphql-tag'

const insertEventUserNew = gql`
  mutation insertEventUserNew($event_id: Int!, $user_id: Int!) {
    insert_event_users_new(objects: { event_id: $event_id, user_id: $user_id }) {
      returning {
        id
        user_id
        event_id
        event {
          event_users_new {
            user_id
            status
          }
        }
      }
    }
  }
`

export default insertEventUserNew
