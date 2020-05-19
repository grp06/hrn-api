const express = require('express')

const roomsRouter = express.Router()
const jsonBodyParser = express.json()
const Twilio = require('twilio')
const twilioAccountSid = 'AC712594f590c0d874685c04858f7398f9' // Your Account SID from www.twilio.com/console
const authToken = '95af76d75ebe6811a23ec3b43d7e6477' // Your Auth Token from www.twilio.com/console
const client = new Twilio(twilioAccountSid, authToken)

roomsRouter
  //rename to make function clearer?
  .route('/complete-rooms')
  .get((req, res) => {
    console.log('are we here/????')
    const completedIds = []
    client.video.rooms.list({ status: 'in-progress' }).then((rooms) => {
      return rooms.forEach((r) => {
        completedIds.push(r.sid)
        client.video
          .rooms(r.sid)
          .update({ status: 'completed' })
          .then((room) => console.log('completed rooms'))
      })
    })
    res.status(200).send('completed some rooms')
  })

// evetually, this func should receive an array
roomsRouter
  .route('/create-rooms')
  //require auth and parse JSON
  .post(jsonBodyParser, (req, res, next) => {
    const allPartnerXs = req.body
    allPartnerXs.forEach((id) => {
      client.video.rooms
        .create({
          uniqueName: id,
          type: 'peer-to-peer',
          enable_turn: false,
        })
        .then((room) => {
          console.log('room created with ID = ', room.sid)
        })
        .catch((err) => console.log('err == ', err))
    })
    res.status(201).send('room created')
  })

roomsRouter
  .route('/:room_id')
  //check room exists...maybe just keep error response in catch
  .get((req, res) => {
    client.video
      .rooms(req.params.id)
      .fetch()
      .then((room) => {
        res.status(200).send(room)
      })
  })

module.exports = roomsRouter
