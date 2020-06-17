const Twilio = require('twilio')

const twilioAccountSid = 'AC712594f590c0d874685c04858f7398f9' // Your Account SID from www.twilio.com/console
const authToken = '95af76d75ebe6811a23ec3b43d7e6477' // Your Auth Token from www.twilio.com/console
const client = new Twilio(twilioAccountSid, authToken)

const createRooms = async (allRowIds, eventId) => {
  return allRowIds.map((rowId) => {
    console.log(`${eventId}-${rowId}`)

    return client.video.rooms.create({
      uniqueName: `${eventId}-${rowId}`,
      type: 'peer-to-peer',
    })
  })
}

export default createRooms
