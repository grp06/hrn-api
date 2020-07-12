import setRoomsCompleted from './set-rooms-completed'
import runEvent from './runEvent'
import orm from '../../services/orm'
import updateEventStatus from '../../gql/mutations/event/updateEventStatus'
import client from '../../extensions/twilioClient'
import * as Sentry from '@sentry/node'
import getOnlineUsers from './getOnlineUsers'
import createPreEventRooms from './createPreEventRooms'

const express = require('express')

const roomsRouter = express.Router()
const jsonBodyParser = express.json()

// endpoint needs an auth check
roomsRouter.post('/start-event/:id', jsonBodyParser, async (req, res) => {
  __logger.info(`Event with id ${req.params.id} started.`)
  runEvent(req, res)

  return res.status(200).json({ message: 'runEvent started' })
})

roomsRouter.post('/get-online-event-users/:id', jsonBodyParser, async (req, res) => {
  const eventId = req.params.id
  const onlineEventUsers = await getOnlineUsers(eventId)
  return res.status(200).json({ data: onlineEventUsers })
})

roomsRouter.post('/start-pre-event/:id', jsonBodyParser, async (req, res) => {
  const eventId = req.params.id
  const onlineEventUsers = await getOnlineUsers(eventId)
  const maxNumUsersPerRoom = 40
  const numOnlineUsers = onlineEventUsers.length
  console.log('numOnlineUsers', numOnlineUsers)
  const numRooms = Math.ceil(numOnlineUsers / maxNumUsersPerRoom)

  try {
    const res = await createPreEventRooms(numRooms, eventId)
  } catch (error) {
    Sentry.captureException(error)
    console.log('error = ', error)
  }

  try {
    await orm.request(updateEventStatus, {
      eventId,
      newStatus: 'pre-event',
    })
  } catch (error) {
    console.log('error', error)
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
