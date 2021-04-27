import gql from 'graphql-tag'

const updateStripeCustomerId = gql`
  mutation updateStripeCustomerId($user_id: Int!, $stripe_customer_id: String!) {
    update_users(
      where: { id: { _eq: $user_id } }
      _set: { stripe_customer_id: $stripe_customer_id }
    ) {
      returning {
        first_name
        last_name
        email
        stripe_customer_id
        id
      }
    }
  }
`
export default updateStripeCustomerId
