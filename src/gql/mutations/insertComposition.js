import gql from 'graphql-tag'

const insertComposition = gql`
  mutation insertComposition($ownerId: Int!, $startTime: timestamptz!) {
    insert_compositions(objects: { owner_id: $ownerId, recording_started_at: $startTime }) {
      affected_rows
    }
  }
`

export default insertComposition
