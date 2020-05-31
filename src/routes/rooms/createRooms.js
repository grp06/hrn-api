const Twilio = require('twilio')

const twilioAccountSid = 'AC712594f590c0d874685c04858f7398f9' // Your Account SID from www.twilio.com/console
const authToken = '95af76d75ebe6811a23ec3b43d7e6477' // Your Auth Token from www.twilio.com/console
const client = new Twilio(twilioAccountSid, authToken)

const createRooms = (allRoomIds) => {
  allRoomIds.forEach((id) => {
    client.video.rooms
      .create({
        uniqueName: id,
        type: 'peer-to-peer',
      })
      .then((room) => {
        console.log('room created with ID = ', room.sid)
      })
  })
}

export default createRooms
