require("dotenv").config();
const cors = require('cors')
const express = require('express')
const morgan = require("morgan");
const { NODE_ENV } = require("./config.js");
// import { startServer } from './server-graphql'

const Twilio = require('twilio')
const twilioAccountSid = 'AC712594f590c0d874685c04858f7398f9' // Your Account SID from www.twilio.com/console
const authToken = '95af76d75ebe6811a23ec3b43d7e6477' // Your Auth Token from www.twilio.com/console
const client = new Twilio(twilioAccountSid, authToken)
const bodyParser = require('body-parser')
const { AccessToken } = require('twilio').jwt
const { VideoGrant } = AccessToken

const roomsRouter = require('./routes/rooms/rooms-router')


  const app = express()
  const morganOption = NODE_ENV === "production" ? "tiny" : "common";

  app.use(
    bodyParser.urlencoded({
      extended: true,
    })
  )
  app.use(bodyParser.json())
  app.use(morgan(morganOption));
  app.use(cors())
  // const port = process.env.PORT
  // startServer(app, 8000)
  // console.log(`Apollo :${port}/graphql`)
  app.use('/api/rooms', roomsRouter)

  // app.post('/create-room', (req, res) => {
  //   const allPartnerXs = req.body
  //   allPartnerXs.forEach((id) => {
  //     client.video.rooms
  //       .create({
  //         uniqueName: id,
  //         type: 'peer-to-peer',
  //         enable_turn: false,
  //       })
  //       .then((room) => {
  //         console.log('room created with ID = ', room.sid)
  //       })
  //   })
  //   res.status(201).send('room created')
  // })



  // app.get('/complete-rooms', (req, res) => {
  //   client.video.rooms.list({ status: 'in-progress' }).then((rooms) =>
  //     rooms.forEach((r) => {
  //       client.video
  //         .rooms(r.sid)
  //         .update({ status: 'completed' })
  //         .then((room) => console.log('completed rooms'))
  //     })
  //   )
  //   res.status(200).send(JSON.stringify({ body: 'something' }))
  // })


  // app.get('/get-my-room/:id', (req, res) => {
  //   client.video
  //     .rooms(req.params.id)
  //     .fetch()
  //     .then((room) => {
  //       res.status(200).send(room)
  //     })
  // })

  app.post('/give-me-a-token', (req, res) => {
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

  app.get("/", (req, res) => {
    res.send("Hello, world!");
  });

  app.use(function errorHandler(error, req, res, next) {
    let response;
    if (NODE_ENV === "production") {
      response = { error: { message: "server error" } };
    } else {
      console.error(error);
      response = { message: error.message, error };
    }
    res.status(500).json(response);
  });

  module.exports = app;