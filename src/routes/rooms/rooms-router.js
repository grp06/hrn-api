import setRoomsCompleted from './set-rooms-completed'
import runEvent from './runEvent'
import orm from '../../services/orm'
import updateEventStatus from '../../gql/mutations/event/updateEventStatus'
import client from '../../extensions/twilioClient'
import * as Sentry from '@sentry/node'
import { getOnlineUsersByEventId } from '../../gql/queries/users/getOnlineUsersByEventId'

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

  let onlineEventUsers
  // get the online users for a given event by checking updated_at
  try {
    // make the last seen a bit longer to accomodate buffer/lag between clients/server?
    const now = Date.now() // Unix timestamp
    const xMsAgo = 20000 // 20 seconds
    const timestampXMsAgo = now - xMsAgo // Unix timestamp
    const seenAfter = new Date(timestampXMsAgo)

    const eventUsersResponse = await orm.request(getOnlineUsersByEventId, {
      later_than: seenAfter,
      event_id: eventId,
    })

    onlineEventUsers = eventUsersResponse.data.event_users.map((user) => user.user.id)
    console.log('onlineEventUsers', onlineEventUsers)
  } catch (error) {
    console.log('error = ', error)
    Sentry.captureException(error)
  }
  return res.status(200).json({ data: onlineEventUsers })
})

roomsRouter.post('/start-pre-event/:id', jsonBodyParser, async (req, res) => {
  const eventId = req.params.id

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
