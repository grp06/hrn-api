import * as Sentry from '@sentry/node'
import setRoomsCompleted from './set-rooms-completed'
import orm from '../../services/orm'
import { updateEventObject } from '../../gql/mutations'
import getOnlineUsers from './getOnlineUsers'
import nextRound from './nextRound'
import { getAvailableLobbyUsers } from '../../gql/queries'
import { endEvent } from './runEventHelpers'

const express = require('express')

const roomsRouter = express.Router()
const jsonBodyParser = express.json()

roomsRouter.post('/end-event/:id', jsonBodyParser, async (req, res) => {
  try {
    await endEvent(req.params.id, true)
  } catch (error) {
    console.log('error', error)
    Sentry.captureException(error)
  }
})

// api/rooms/start-event/:eventId
roomsRouter.post('/start-event/:eventId', jsonBodyParser, async (req, res) => {
  __logger.info(`Event with id ${req.params.eventId} started.`)

  return nextRound({ req, res })
})

module.exports = roomsRouter
