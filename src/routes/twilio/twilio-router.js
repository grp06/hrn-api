const express = require('express')

const twilioRouter = express.Router()
const { AccessToken } = require('twilio').jwt

const { VideoGrant } = AccessToken
const twilioAccountSid = 'AC712594f590c0d874685c04858f7398f9' // Your Account SID from www.twilio.com/console
// const TokenService = require('../services/tokenService');

// POST /token
twilioRouter.post('/get-token', (req, res) => {
  // Create an access token which we will sign and return to the client,
  // containing the grant we just created
  const { uniqueName } = req.body.input
  const userId = req.body.session_variables['x-hasura-user-id']
  const token = new AccessToken(
    twilioAccountSid,
    process.env.TWILIO_API_KEY,
    process.env.TWILIO_API_SECRET
  )
  token.identity = userId

  // Create a Video grant which enables a client to use Video
  // and limits access to the specified Room (DailyStandup)
  const videoGrant = new VideoGrant({
    room: uniqueName,
  })

  // Add the grant to the token
  token.addGrant(videoGrant)

  // Serialize the token to a JWT string
  const tokenAsJwt = token.toJwt()
  res.json({ token: tokenAsJwt })
})

export default twilioRouter
