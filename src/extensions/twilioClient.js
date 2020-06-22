const Twilio = require('twilio')

const client = new Twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTHTOKEN)

export default client
