import completeRooms from './complete-rooms'
import runEvent from './run-event'

const express = require('express')
const Twilio = require('twilio')

const roomsRouter = express.Router()
const jsonBodyParser = express.json()
const twilioAccountSid = 'AC712594f590c0d874685c04858f7398f9' // Your Account SID from www.twilio.com/console
const authToken = '95af76d75ebe6811a23ec3b43d7e6477' // Your Auth Token from www.twilio.com/console
const client = new Twilio(twilioAccountSid, authToken)

roomsRouter.post('/start-event/:id', jsonBodyParser, async (req, res) => {
  runEvent(req, res)
  return res.status(200).json({ res: 'response' })
})

roomsRouter.route('/reset-event').get((req, res) => {
  completeRooms()
  return res.status(200).json({ res: 'reset the event yo' })
})

module.exports = roomsRouter
