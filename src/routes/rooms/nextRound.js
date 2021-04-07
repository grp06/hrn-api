import * as Sentry from '@sentry/node'

import { updateEventObject } from '../../gql/mutations'
import omniCreatePairings from '../../matchingAlgo/omniCreatePairings'
import orm from '../../services/orm'
import initNextRound from './initNextRound'
import { resetEvent, endEvent } from './runEventHelpers'
import setRoomsCompleted from './set-rooms-completed'

const nextRound = async ({ req, res, params }) => {
  const oneMinuteInMs = 60000
  let eventId
  let numRounds
  let round_length
  let currentRound
  let createPairingsRes
  let useSamyakAlgo
  try {
    if (req) {
      // we just called start event. First round
      eventId = parseInt(req.params.eventId, 10)
      numRounds = req.body.num_rounds || 10 // default ten rounds
      round_length = req.body.round_length * oneMinuteInMs || 300000
      if (req.body.reset) {
        return resetEvent(eventId)
      }
      const completedRoomsPromises = await setRoomsCompleted(eventId)
      console.log('nextRound -> completedRoomsPromises', completedRoomsPromises)
      await Promise.all(completedRoomsPromises)

      currentRound = 1
    } else {
      // at least round 2
      eventId = params.eventId
      numRounds = params.numRounds
      round_length = params.round_length
      currentRound = params.currentRound
      useSamyakAlgo = params.useSamyakAlgo
      console.log('nextRound params -> useSamyakAlgo', useSamyakAlgo)
    }

    // createPairingsRes can either be undefined, true, or ended event early'
    createPairingsRes = await omniCreatePairings({ eventId, currentRound, useSamyakAlgo })
    console.log('nextRound -> createPairingsRes', createPairingsRes)

    if (createPairingsRes === 'ended event early') {
      console.log('no more pairings, end the event')
      endEvent(eventId)
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
    console.log('nextRound -> error', error)

    if (res) {
      Sentry.captureException(error)
      return res.status(500).json({ error })
    }
    return Sentry.captureException(error)
  }

  initNextRound({
    numRounds,
    eventId,
    roundLength: round_length,
    currentRound,
    useSamyakAlgo: createPairingsRes,
  })

  if (res) {
    return res
      .status(200)
      .json({ message: 'Success starting the event and queueing up next round' })
  }
}

export default nextRound
