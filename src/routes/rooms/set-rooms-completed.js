const Twilio = require('twilio')

const twilioAccountSid = 'AC712594f590c0d874685c04858f7398f9' // Your Account SID from www.twilio.com/console
const authToken = '95af76d75ebe6811a23ec3b43d7e6477' // Your Auth Token from www.twilio.com/console
const client = new Twilio(twilioAccountSid, authToken)

const setRoomsCompleted = async () => {
  // TODO: scope rooms list by event id
  const allRooms = await client.video.rooms.list({ status: 'in-progress' })
  console.log('allRooms = ', allRooms)

  return allRooms.map((r) => {
    // TODO: scope rooms update by event id
    return client.video.rooms(r.sid).update({ status: 'completed' })
  })
}

export default setRoomsCompleted
