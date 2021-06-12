import gql from 'graphql-tag'

const getRecentlyCreatedRooms = gql`
  query getRecentlyCreatedRooms($timestamp: timestamptz!) {
    rooms(where: { created_at: { _gt: $timestamp }, owner: { last_name: { _is_null: true } } }) {
      created_at
      updated_at
      id
      name
    }
  }
`

export default getRecentlyCreatedRooms
