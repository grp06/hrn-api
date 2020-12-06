import gql from 'graphql-tag'

const findUserByStripeCustomerId = gql`
  query findUserByStripeCustomerId($stripe_customer_id: String!) {
    users(where: { stripe_customer_id: { _eq: $stripe_customer_id } }) {
      id
      email
      name
      role
      stripe_customer_id
      sub_period_end
    }
  }
`

export default findUserByStripeCustomerId
