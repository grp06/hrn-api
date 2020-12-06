import gql from 'graphql-tag'

const updateUserSubPeriod = gql`
  mutation updateUserSubPeriod($stripe_customer_id: String!, $sub_period_end: timestamptz!) {
    update_users(
      where: { stripe_customer_id: { _eq: $stripe_customer_id } }
      _set: { sub_period_end: $sub_period_end }
    ) {
      returning {
        name
        id
        role
        sub_period_end
      }
    }
  }
`
export default updateUserSubPeriod
