const Twilio = require('twilio')

const twilioAccountSid = 'AC712594f590c0d874685c04858f7398f9' // Your Account SID from www.twilio.com/console
const authToken = '95af76d75ebe6811a23ec3b43d7e6477' // Your Auth Token from www.twilio.com/console
const client = new Twilio(twilioAccountSid, authToken)

const completeRooms = () => {
  return client.video.rooms.list({ status: 'in-progress' }).then((rooms) => {
    console.log('rooms.length = ', rooms.length)
    rooms.forEach((r) => {
      client.video
        .rooms(r.sid)
        .update({ status: 'completed' })
        .then((room) => console.log('completed room ', room.sid))
    })
  })
}

export default completeRooms
