import gql from 'graphql-tag'

const getContactSharesForSendingEmail = gql`
  query getContactSharesForSendingEmail($event_id: Int!) {
    partners(where: { partner_shared_details: { _eq: true }, event_id: { _eq: $event_id } }) {
      user {
        email
        name
      }
      partner {
        name
        linkedIn_url
        short_bio
        city
        email
        tags_users {
          tag {
            name
          }
        }
      }
      event {
        event_name
      }
    }
  }
`

export default getContactSharesForSendingEmail
