import gql from 'graphql-tag'

const updateRoomModeRoomSid = gql`
  mutation updateRoomModeRoomSid($roomModeId: Int!, $twilioRoomSid: String!) {
    update_room_modes(
      where: { id: { _eq: $roomModeId } }
      _set: { twilio_room_sid: $twilioRoomSid }
    ) {
      affected_rows
    }
  }
`
export default updateRoomModeRoomSid
