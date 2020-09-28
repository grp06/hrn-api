import * as Sentry from '@sentry/node'
import setRoomsCompleted from './set-rooms-completed'
import runEvent from './runEvent'
import startEvent from './startEvent'
import orm from '../../services/orm'
import updateEventObject from '../../gql/mutations/event/updateEventObject'
import getOnlineUsers from './getOnlineUsers'
import createPreEventRooms from './createPreEventRooms'
import nextRound from './nextRound'

const express = require('express')

const roomsRouter = express.Router()
const jsonBodyParser = express.json()

roomsRouter.post('/get-online-event-users/:id', jsonBodyParser, async (req, res) => {
  const eventId = req.params.id
  const onlineEventUsers = await getOnlineUsers(eventId)
  return res.status(200).json({ data: onlineEventUsers })
})

roomsRouter.post('/start-pre-event/:id', jsonBodyParser, async (req, res) => {
  const eventId = req.params.id

  let onlineEventUsers
  try {
    onlineEventUsers = await getOnlineUsers(eventId)
  } catch (error) {
    Sentry.captureException(error)
    console.log('error = ', error)
  }

  const maxNumUsersPerRoom = 40
  const numOnlineUsers = onlineEventUsers.length
  console.log('numOnlineUsers', numOnlineUsers)
  const numRooms = Math.ceil(numOnlineUsers / maxNumUsersPerRoom)

  try {
    await createPreEventRooms(numRooms, eventId)
  } catch (error) {
    Sentry.captureException(error)
    console.log('error = ', error)
  }

  try {
    await orm.request(updateEventObject, {
      id: eventId,
      newStatus: 'pre-event',
    })
    console.log('started pre event')
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

// api/rooms/start-event/:eventId
roomsRouter.post('/start-event/:eventId', jsonBodyParser, async (req, res) => {
  __logger.info(`Event with id ${req.params.eventId} started.`)

  return nextRound({ req, res })
})

module.exports = roomsRouter
