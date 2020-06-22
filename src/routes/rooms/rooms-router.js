import setRoomsCompleted from './set-rooms-completed'
import runEvent from './runEvent'
import orm from '../../services/orm'
import updateEventStatus from '../../gql/mutations/users/updateEventStatus'
import client from '../../extensions/twilioClient'

const express = require('express')

const roomsRouter = express.Router()
const jsonBodyParser = express.json()

// endpoint needs an auth check
roomsRouter.post('/start-event/:id', jsonBodyParser, async (req, res) => {

  __logger.info(`Event with id ${req.params.id} started.`)
  runEvent(req, res)

  return res.status(200).json({ message: 'runEvent started' })
})

roomsRouter.post('/start-pre-event/:id', jsonBodyParser, async (req, res) => {
  const eventId = req.params.id
  const createdRoom = await client.video.rooms.create({
    uniqueName: `${eventId}-pre-event`,
    type: 'group',
  })

  try {
    await orm.request(updateEventStatus, {
      eventId,
      newStatus: 'pre-event',
    })
  } catch (error) {
    Sentry.captureException(error)
    return res.status(500).json({ message: 'pre-event failed' })
  }

  return res.status(200).json({ message: 'pre-event started' })
})

roomsRouter.route('/reset-event').get((req, res) => {
  const { eventId } = req.body

  setRoomsCompleted(eventId)
  return res.status(200).json({ res: 'reset the event yo' })
})

module.exports = roomsRouter
