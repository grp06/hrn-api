import gql from 'graphql-tag'

const deleteRoomModeCronjob = gql`
  mutation deleteRoomModeCronjob($roomId: Int!) {
    delete_room_mode_cronjobs(where: { room_id: { _eq: $roomId } }) {
      affected_rows
    }
  }
`

export default deleteRoomModeCronjob
