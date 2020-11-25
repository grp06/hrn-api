import gql from 'graphql-tag'

const updateUserSubPeriod = gql`
  mutation updateUserSubPeriod($user_id: Int!, $sub_period_end: timestamptz!) {
    update_users(where: { id: { _eq: $user_id } }, _set: { sub_period_end: $sub_period_end }) {
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
