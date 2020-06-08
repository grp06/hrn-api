import gql from 'graphql-tag'

const query = gql`
  mutation setEventEndedAt($id: Int!, $ended_at: timestamptz) {
    update_events(where: { id: { _eq: $id } }, _set: { ended_at: $ended_at }) {
      returning {
        description
        event_name
        host_id
        id
        start_at
        ended_at
      }
    }
  }
`

export default query
