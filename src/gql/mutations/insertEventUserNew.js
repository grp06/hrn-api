import gql from 'graphql-tag'

const insertEventUserNew = gql`
  mutation insertEventUserNew($event_id: Int!, $user_id: Int!) {
    insert_event_users_new(objects: { event_id: $event_id, user_id: $user_id }) {
      returning {
        id
        event_id
        user_id
      }
    }
  }
`

export default insertEventUserNew
