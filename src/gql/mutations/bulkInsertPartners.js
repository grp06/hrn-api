import gql from 'graphql-tag'

const bulkInsertPartners = gql`
  mutation bulkInsertPartners($objects: [partners_insert_input!]!) {
    insert_partners(objects: $objects) {
      returning {
        id
        user_id
        partner_id
        room_modes_id
      }
    }
  }
`
export default bulkInsertPartners
