import completeRooms from './complete-rooms'
import runEvent from './run-event'

const express = require('express')

const roomsRouter = express.Router()
const jsonBodyParser = express.json()

roomsRouter.post('/start-event/:id', jsonBodyParser, async (req, res) => {
  runEvent(req, res)
  return res.status(200).json({ res: 'response' })
})

roomsRouter.route('/reset-event').get((req, res) => {
  completeRooms()
  return res.status(200).json({ res: 'reset the event yo' })
})

module.exports = roomsRouter
