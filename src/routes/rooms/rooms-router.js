import setRoomsCompleted from './set-rooms-completed'
import runEvent from './runEvent'

const express = require('express')

const roomsRouter = express.Router()
const jsonBodyParser = express.json()

// endpoint needs an auth check
roomsRouter.post('/start-event/:id', jsonBodyParser, async (req, res) => {
  runEvent(req, res)

  // return res.status(200).json({ res: 'runEvent finished' })
})

roomsRouter.route('/reset-event').get((req, res) => {
  setRoomsCompleted()
  return res.status(200).json({ res: 'reset the event yo' })
})

module.exports = roomsRouter
