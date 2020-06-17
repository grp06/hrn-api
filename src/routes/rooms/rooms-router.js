import setRoomsCompleted from './set-rooms-completed'
import runEvent from './runEvent'
import orm from '../../services/orm'
import updateEventStatus from '../../gql/mutations/users/updateEventStatus'

const express = require('express')

const roomsRouter = express.Router()
const jsonBodyParser = express.json()

// endpoint needs an auth check
roomsRouter.post('/start-event/:id', jsonBodyParser, async (req, res) => {
  console.log('inside start EVENT')

  runEvent(req, res)

  return res.status(200).json({ message: 'runEvent started' })
})

roomsRouter.post('/start-pre-event/:id', jsonBodyParser, async (req, res) => {
  const eventId = req.params.id
  console.log('EVENT ID', eventId)

  try {
    await orm.request(updateEventStatus, {
      eventId,
      newStatus: 'pre-event',
    })
    console.log('updated status to pre-event')
  } catch (error) {
    return res.status(500).json({ message: 'pre-event failed' })
  }

  return res.status(200).json({ message: 'pre-event started' })
})

roomsRouter.route('/reset-event').get((req, res) => {
  setRoomsCompleted()
  return res.status(200).json({ res: 'reset the event yo' })
})

module.exports = roomsRouter
