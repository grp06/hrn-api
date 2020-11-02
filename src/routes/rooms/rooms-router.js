import * as Sentry from '@sentry/node'
import setRoomsCompleted from './set-rooms-completed'
import orm from '../../services/orm'
import { updateEventObject } from '../../gql/mutations'
import getOnlineUsers from './getOnlineUsers'
import createPreEventRooms from './createPreEventRooms'
import nextRound from './nextRound'
import { getAvailableLobbyUsers } from '../../gql/queries'

const express = require('express')

const roomsRouter = express.Router()
const jsonBodyParser = express.json()

roomsRouter.post('/end-event/:id', jsonBodyParser, async (req, res) => {
  try {
    const completedRoomsPromises = await setRoomsCompleted(req.params.id)
    await Promise.all(completedRoomsPromises)

    await orm.request(updateEventObject, {
      id: req.params.id,
      newStatus: 'complete',
      ended_at: new Date().toISOString(),
    })
    console.log('set status to event complete')
  } catch (error) {
    console.log('error', error)
    Sentry.captureException(error)
  }
})

roomsRouter.post('/start-pre-event/:id', jsonBodyParser, async (req, res) => {
  const eventId = req.params.id

  let onlineUsersResponse
  try {
    onlineUsersResponse = await orm.request(getAvailableLobbyUsers, {
      eventId,
    })
    console.log('onlineUsersResponse', onlineUsersResponse)

    const maxNumUsersPerRoom = 40
    const numOnlineUsers = onlineUsersResponse.data.online_event_users.length
    console.log('numOnlineUsers', numOnlineUsers)
    const numRooms = Math.ceil(numOnlineUsers / maxNumUsersPerRoom)
    console.log('numRooms', numRooms)
    await createPreEventRooms(numRooms, eventId)

    await orm.request(updateEventObject, {
      id: eventId,
      newStatus: 'pre-event',
    })
  } catch (error) {
    Sentry.captureException(error)
    console.log('error = ', error)
    return res.status(500).json({ message: 'start pre-event failed' })
  }

  return res.status(200).json({ message: 'pre-event started' })
})

// api/rooms/start-event/:eventId
roomsRouter.post('/start-event/:eventId', jsonBodyParser, async (req, res) => {
  __logger.info(`Event with id ${req.params.eventId} started.`)

  return nextRound({ req, res })
})

module.exports = roomsRouter
