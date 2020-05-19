require('dotenv').config({ path: __dirname + '/.env' })
const express = require('express')
const tokenRouter = express.Router()
const { AccessToken } = require('twilio').jwt
const { VideoGrant } = AccessToken
const twilioAccountSid = 'AC712594f590c0d874685c04858f7398f9' // Your Account SID from www.twilio.com/console
// const TokenService = require('../services/tokenService');

// POST /token
tokenRouter.post('/', (req, res) => {
  // Create an access token which we will sign and return to the client,
  // containing the grant we just created

  const token = new AccessToken(
    twilioAccountSid,
    process.env.TWILIO_API_KEY,
    process.env.TWILIO_API_SECRET
  )
  token.identity = req.body.myUserId

  // Create a Video grant which enables a client to use Video
  // and limits access to the specified Room (DailyStandup)
  const videoGrant = new VideoGrant({
    room: req.body.partnerX,
  })

  // Add the grant to the token
  token.addGrant(videoGrant)

  // Serialize the token to a JWT string
  res.status(200).send(JSON.stringify({ token: token.toJwt() }))
})

module.exports = tokenRouter
