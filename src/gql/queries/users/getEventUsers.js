import gql from 'graphql-tag'

export const getEventUsers = gql`
  query getEventUsers($event_id: Int!) {
    event_users(where: { event_id: { _eq: $event_id } }) {
      user {
        id
        name
        email
        linkedIn_url
        city
        short_bio
        tags_users {
          tag {
            name
          }
        }
      }
    }
  }
`

export default getEventUsers
