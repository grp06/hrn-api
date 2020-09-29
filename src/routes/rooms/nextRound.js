import * as Sentry from '@sentry/node'

import { resetEvent, omniFinishRounds } from './runEventHelpers'
import orm from '../../services/orm'

import {updateEventObject} from '../../gql/mutations'
import initNextRound from './initNextRound'
import createPairingsFromOnlineUsers from '../../matchingAlgo/createPairingsFromOnlineUsers'
import scanLobbyForPairings from './scanLobbyForPairings'

const nextRound = async ({ req, res, params }) => {
  const oneMinuteInMs = 60000
  let eventId
  let numRounds
  let round_length
  let currentRound

  try {
    if (req) {
      // we just called start event. First round
      eventId = parseInt(req.params.eventId, 10)
      numRounds = req.body.num_rounds || 10 // default ten rounds
      round_length = req.body.round_length * oneMinuteInMs || 300000
      if (req.body.reset) {
        return resetEvent(eventId)
      }

      await omniFinishRounds(currentRound, eventId)

      currentRound = 1
    } else {
      // at least round 2
      eventId = params.eventId
      numRounds = params.numRounds
      round_length = params.round_length
      currentRound = params.currentRound
    }

    const createPairingsRes = await createPairingsFromOnlineUsers({ eventId, currentRound })
    console.log('nextRound -> createPairingsRes', createPairingsRes)
    if (createPairingsRes === 'ended event') {
      return null
    }
    // set event status to in-progress
    const updateEventObjectRes = await orm.request(updateEventObject, {
      id: eventId,
      newCurrentRound: currentRound,
      newStatus: 'room-in-progress',
    })

    if (updateEventObjectRes.errors) {
      Sentry.captureException(updateEventObjectRes.errors[0].message)
      throw new Error(updateEventObjectRes.errors[0].message)
    }
  } catch (error) {
    console.log('error = ', error)
    if (res) {
      Sentry.captureException(error)
      return res.status(500).json({ error })
    }
    return Sentry.captureException(error)
  }

  initNextRound({ numRounds, eventId, roundLength: round_length, currentRound })

  scanLobbyForPairings(eventId)
  if (res) {
    return res
      .status(200)
      .json({ message: 'Success starting the event and queueing up next round' })
  }

  // only in round 1
  // subscribe to online users
  // check to see if neither has blocked the other
  // pair off and insert rounds
}

export default nextRound
