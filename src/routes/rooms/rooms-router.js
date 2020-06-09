import setRoomsCompleted from './set-rooms-completed'
import runEvent from './runEvent'

const express = require('express')

const roomsRouter = express.Router()
const jsonBodyParser = express.json()

roomsRouter.post('/start-event/:id', jsonBodyParser, async (req, res) => {
  runEvent(req, res)
  return res.status(200).json({ res: 'response' })
})

roomsRouter.route('/reset-event').get((req, res) => {
  setRoomsCompleted()
  return res.status(200).json({ res: 'reset the event yo' })
})

module.exports = roomsRouter
