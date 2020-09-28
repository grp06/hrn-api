import gql from 'graphql-tag'

const bulkInsertPartners = gql`
  mutation bulkInsertPartners($objects: [partners_insert_input!]!) {
    insert_partners(objects: $objects) {
      returning {
        id
        event_id
      }
    }
  }
`
export default bulkInsertPartners
