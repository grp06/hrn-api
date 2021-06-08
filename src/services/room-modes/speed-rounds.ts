import * as Sentry from '@sentry/node'
import { CronJob } from 'cron'
import { Response } from 'express'
import moment from 'moment'

import { bulkInsertPartners } from '../../gql/mutations'
import insertRoomModeCronjob from '../../gql/mutations/insertRoomModeCronjob'
import updateRoomMode from '../../gql/mutations/updateRoomMode'
import { omniFinishRounds, endEvent } from '../../matchingAlgo/runEventHelpers'
import transformPairingsToGqlVars from '../../matchingAlgo/transformPairingsToGqlVars'
import jobs from '../jobs'
import orm from '../orm'
import getAllRoundsDataForOnlineUsers from '../rooms/getAllRoundsDataForOnlineUsers'
import getOnlineRoomUsers from '../rooms/getOnlineRoomUsers'
import makePairingsFromSamyakAlgo from '../rooms/makePairingsFromSamyakAlgo'
import setRoomsAsCompleted from '../twilio/setRoomsAsCompleted'

type InitNextRoundParams = {
  roomId: number
  roomModeId: number
  roundNumber: number
  roundLength: number
  totalRounds: number
  nextRoundStart?: string // TODO: change to something that indicates date
}

type InitNextRound = (params: InitNextRoundParams) => Promise<void>

/**
 * Start the first round
 * @returns {Promise<*>}
 * @param params
 */
export const initNextRound: InitNextRound = async (params) => {
  const {
    roomId,
    roomModeId,
    roundNumber,
    roundLength,
    totalRounds,
    nextRoundStart: recoveredStartTime,
  } = params
  const defaultDelayBetweenRounds = 20 // TODO: make this a constant

  // Check if a next round start time was recovered from a server restart
  // TODO: check if we should store/retrieve this from the database
  if (recoveredStartTime) {
    console.log('(initNextRound) 🕚 (recovered) Next round start time:', recoveredStartTime)
  }

  // Determine when should we start the next round
  const nextRoundStartTime = recoveredStartTime
    ? moment(recoveredStartTime)
    : moment().add(roundLength, 'minutes')

  // Set cronjob for when to start the next round
  jobs.nextRound[roomId] = new CronJob(nextRoundStartTime, async () => {
    try {
      // Ensures that rooms are closed before next round
      await omniFinishRounds(roundNumber, roomId, roomModeId)
    } catch (error) {
      Sentry.captureException(error)
    }

    // Check if we should end the event because we've finished all the rounds
    const eventIsOver = roundNumber === totalRounds

    // Establish the delay between rounds
    const delayBetweenRounds = moment().add(defaultDelayBetweenRounds, 'seconds')
    // If the event is over, end it
    if (eventIsOver) {
      return endEvent(roomId)
    }
    // Wait for the delay between rounds & initiate the next one
    jobs.betweenRounds[roomId] = new CronJob(delayBetweenRounds, async () => {
      // TODO: describe this action
      console.log('end of pause INIT SPEED ROUNDS AGAIN')
      await initSpeedRounds({
        roomId,
        roomModeId,
        roundNumber: roundNumber + 1,
        roundLength,
        totalRounds,
      })
    })

    return jobs.betweenRounds[roomId]?.start()
  })

  // If this isn't a recovered cron job, save it to the database
  if (!recoveredStartTime) {
    console.log('we save a cron every round')

    await orm.request(insertRoomModeCronjob, {
      roomId,
      roomModeId,
      roundNumber,
      timestamp: nextRoundStartTime.utc().toISOString(), // TODO: remove this when we get rid of all the values in witch the UTC is stored
    })
  }

  // TODO(s)
  //  ~ insert job execution time in a new table;
  //  ~ when the server starts, check for in progress events;
  //  ~ if theres an in progress event, set up new cron;

  // TODO: (?)
  return jobs.nextRound[roomId]?.start()
}

type CreatePairingsParams = {
  roomId: number
  roomModeId: number
  currentRound?: number // TODO: deprecated
  fromLobbyScan?: unknown // TODO: deprecated
}

type CreatePairingsRes = {
  success: boolean
  eventEndedEarly: boolean
}

type CreatePairings = (params: CreatePairingsParams) => Promise<CreatePairingsRes>

/**
 * Create the speed rounds pairings
 * @param eventId
 */
const createPairings: CreatePairings = async ({ roomId, roomModeId }) => {
  try {
    // Get all online users for this roomId
    const { userIds, onlineUsers } = await getOnlineRoomUsers(roomId)

    // Check if we have enough users for pairing
    if (userIds.length < 2) {
      console.error('(createPairings) Not enough users to pair in the room')
      return {
        success: false,
        eventEndedEarly: true,
      }
    }

    // Get partners for the userIds
    const allRoundsDataForOnlineUsers = await getAllRoundsDataForOnlineUsers(userIds, roomModeId)

    // Making assignments with samyak algo
    const pairings = makePairingsFromSamyakAlgo({
      allRoundsDataForOnlineUsers,
      userIds,
      roomId,
    })

    // Check if we have too many bad pairings
    const numNullPairings = pairings.reduce((all, item) => {
      if (item[1] === null) {
        all += 1
      }
      return all
    }, 0)

    // don't end it if we're just dealing with 3 people, we're most likely testing
    const tooManyBadPairings = numNullPairings >= onlineUsers.length / 2 || pairings.length === 0

    if (tooManyBadPairings) {
      console.log('End event early')
      return {
        success: false,
        eventEndedEarly: true,
      }
    }

    // transform pairings to be ready for insertion to partners table
    const variablesArray = transformPairingsToGqlVars({ pairings, roomModeId })

    // Write to partners table
    const bulkInsertPartnersRes = await orm.request(bulkInsertPartners, {
      objects: variablesArray,
    })
    if (bulkInsertPartnersRes.errors) {
      throw new Error(bulkInsertPartnersRes.errors[0].message)
    }

    return {
      success: true,
      eventEndedEarly: false,
    }
  } catch (error) {
    console.log('(createPairings) 🙊 There was an error:', error)
    Sentry.captureException(error)
    return {
      success: false,
      eventEndedEarly: false,
    }
  }
}

type InitSpeedRoundParams = {
  roomId: number
  roomModeId: number
  roundNumber: number
  roundLength: number
  totalRounds: number
}

type InitSpeedRounds = (params: InitSpeedRoundParams) => Promise<Response | string | null | void>

/**
 * Handler that initiate the event with the rounds
 * TODO: combine this with `initNextRound`
 * @param params
 */
export const initSpeedRounds: InitSpeedRounds = async (params) => {
  const { roomId, roomModeId, roundNumber, roundLength, totalRounds } = params
  console.log('🚀🚀🚀  ~ roomId', roomId)
  const defaultTotalRounds = 10 // TODO: move to constants
  const defaultRoundLength = 1 // 5 min // TODO: move to constants

  console.info('\n\n(initSpeedRounds) 🔤 Params:', params)

  try {
    // Complete all the in-progress Twilio video rooms for this room
    const completedRoomsRes = await Promise.all(await setRoomsAsCompleted(roomId))
    console.log('(initSpeedRounds) ☑️ Previous Twilio video rooms completed:', completedRoomsRes)

    // Create the pairing for this mode
    const createPairingsRes = await createPairings({
      roomId,
      roomModeId,
      currentRound: roundNumber,
    })

    console.log('(initSpeedRounds) 👯 Pairing creation result:', createPairingsRes)

    // End the mode if no more parings
    // TODO: adapt this
    // if (createPairingsRes?.eventEndedEarly) {
    //   console.log('(initSpeedRounds) ⏹ The room mode will be ended, no more pairs')
    //   await endEvent(roomId)
    //   return null
    // }

    // Update the room mode status
    const roomModeUpdate = await orm.request(updateRoomMode, {
      roomModeId,
      pause: false,
      roundNumber,
    })
    console.log(`updated room mode to round = ${roundNumber}, pause = false `)

    // Check if there were any errors updating the room mode
    if (roomModeUpdate.errors) {
      Sentry.captureException(roomModeUpdate.errors[0].message)
      throw new Error(roomModeUpdate.errors[0].message)
    }
  } catch (error) {
    console.error('(initSpeedRounds) 🙊 There was an error:', error)
    return Sentry.captureException(error)
  }

  await initNextRound({
    totalRounds: totalRounds || defaultTotalRounds,
    roomId,
    roomModeId,
    roundLength: roundLength || defaultRoundLength,
    roundNumber,
  })
}
