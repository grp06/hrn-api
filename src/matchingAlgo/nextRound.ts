import * as Sentry from '@sentry/node'
import { Request, Response } from 'express'

import { updateEventObject } from '../gql/mutations'
import omniCreatePairings from './omniCreatePairings'
import orm from '../services/orm'
import setRoomsAsCompleted from '../services/twilio/setRoomsAsCompleted'
// TODO: (IMPORTANT) fix this circular dependency
import initNextRound from './initNextRound'
import { resetEvent, endEvent } from './runEventHelpers'

type NextRoundParams = {
  req?: Request
  res?: Response
  params?: {
    eventId: number
    currentRound: number
    round_length: number
    numRounds: number
    useSamyakAlgo?: boolean
  }
}

type NextRound = (params: NextRoundParams) => Promise<Response | string | null | void>

/**
 * Handler that initiate the event with the rounds
 * @param req
 * @param res
 * @param params
 */
const nextRound: NextRound = async ({ req, res, params }) => {
  // const defaultRounds = 10 // TODO: move to constants
  // const defaultRoundLength = 300000 // 5 min // TODO: move to constants
  // const oneMinuteInMs = 60000
  // let eventId
  // let numRounds
  // let round_length
  // let currentRound
  // let createPairingsRes
  // let useSamyakAlgo
  // console.info('\n\n(nextRound) 🔤 Params:', params)
  // try {
  //   // Initialise the variable and do some cleanups
  //   if (req) {
  //     // We just called "Start event", this is the first round
  //     currentRound = 1
  //     eventId = parseInt(req.params.eventId, 10)
  //     numRounds = req.body.num_rounds || defaultRounds
  //     round_length = req.body.round_length * oneMinuteInMs || defaultRoundLength
  //     // The consumer wants to reset the event
  //     if (req.body.reset) {
  //       return resetEvent(eventId)
  //     }
  //     // Complete all the in-progress rooms
  //     const completedRoomsRes = await Promise.all(await setRoomsAsCompleted(eventId))
  //     console.log('(nextRound) ☑️ `completedRoomsRes`:', completedRoomsRes)
  //   } else if (params) {
  //     // In this case, this is at least the 2nd round
  //     currentRound = params.currentRound
  //     eventId = params.eventId
  //     numRounds = params.numRounds
  //     round_length = params.round_length
  //     useSamyakAlgo = params.useSamyakAlgo
  //   } else {
  //     return Sentry.captureException(new Error('"params" or "req" must be defined'))
  //   }
  //   // Create the pairing for this event
  //   createPairingsRes = await omniCreatePairings({ eventId, currentRound, useSamyakAlgo })
  //   console.log('(nextRound) 👯 Pairing creation result:', createPairingsRes)
  //   // End the event if no more parings
  //   if (createPairingsRes?.eventEndedEarly) {
  //     console.log('(nextRound) ⏹ The event will be ended, no more pairs')
  //     endEvent(eventId) // TODO: check later if we should wait
  //     return null
  //   }
  //   // Set event status to "room-in-progress"
  //   const updateEventObjectRes = await orm.request(updateEventObject, {
  //     id: eventId,
  //     newCurrentRound: currentRound,
  //     newStatus: 'room-in-progress',
  //   })
  //   // Check if there were any errors updating the event
  //   if (updateEventObjectRes.errors) {
  //     Sentry.captureException(updateEventObjectRes.errors[0].message)
  //     // TODO: find another way to throw the error, because we're inside of a try/catch
  //     throw new Error(updateEventObjectRes.errors[0].message)
  //   }
  // } catch (error) {
  //   console.error('(nextRound) 🙊 There was an error:', error)
  //   // If a `res` was passed, propagate the error
  //   if (res) {
  //     Sentry.captureException(error)
  //     return res.status(500).json({ error })
  //   }
  //   // If not, let just Sentry to know about this
  //   return Sentry.captureException(error)
  // }
  // // TODO(s)
  // //  ~ check later if we should wait
  // //  ~ better description
  // //  ~ check if should be moved
  // initNextRound({
  //   numRounds,
  //   eventId,
  //   roundLength: round_length,
  //   currentRound,
  //   useSamyakAlgo: !!createPairingsRes?.isSamyakAlgo,
  // })
  // // If a `res` was passed, propagate the response
  // if (res) {
  //   return res
  //     .status(200)
  //     .json({ message: 'Success starting the event and queueing up next round' })
  // }
  // // TODO: we should return something, do it after we finish refactoring
}

export default nextRound
