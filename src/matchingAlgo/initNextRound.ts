import * as Sentry from '@sentry/node'
import { CronJob } from 'cron'

import { setCronTimestamp } from '../gql/mutations'
import jobs from '../services/jobs'
import orm from '../services/orm'
// TODO: (IMPORTANT) fix this circular dependency
import nextRound from './nextRound'
import { endEvent, omniFinishRounds } from './runEventHelpers'

type InitNextRoundParams = {
  numRounds: number
  eventId: number
  roundLength: number
  currentRound: number
  nextRoundStart?: string // TODO: change to something that indicates date
  useSamyakAlgo?: boolean
}

type InitNextRound = (params: InitNextRoundParams) => Promise<void>

/**
 * Handler that takes care of when the next round should start
 * @returns {Promise<*>}
 * @param params
 */
const initNextRound: InitNextRound = async (params) => {
  const { numRounds, eventId, roundLength, currentRound, nextRoundStart, useSamyakAlgo } = params

  console.info('\n\n(initNextRound) 🔤 Params:', params)

  const nowMilliseconds = new Date().getTime()
  // TODO: check if we should store/retrieve this from the database
  const timeToEndRound = new Date(nowMilliseconds + roundLength)

  console.info(`(initNextRound) 🔢 Round ${currentRound}/${numRounds}`)
  console.info('(initNextRound) 🕚 Now time:', new Date(nowMilliseconds))

  // TODO: what's this?
  //  // Used for testing for super short rounds
  //  date.setSeconds(date.getSeconds() + 20)

  // Check if a next round start time was recovered from a server restart
  const recoveredStartTime = nextRoundStart ? new Date(nextRoundStart) : undefined
  if (recoveredStartTime) {
    console.log('(initNextRound) 🕚 (recovered) Next round start time:', recoveredStartTime)
  }

  // Code to run at the end of the round to (a) end the event or (b) start the next round
  jobs.nextRound[eventId] = new CronJob(recoveredStartTime || timeToEndRound, async () => {
    // Ensures that rooms are closed before next round
    try {
      await omniFinishRounds(currentRound, eventId)
    } catch (error) {
      Sentry.captureException(error)
    }

    // Check if the event is over
    const eventIsOver = currentRound === numRounds
    console.log('(initNextRound->nextRoundJob) 🏁 Is the event over?', eventIsOver)

    // Establish the delay between rounds
    const delayBetweenRounds = eventIsOver ? 10 : 20 // TODO: should this be a constant?

    // TODO: make 'currentTime' more semantic
    // I know it's not semantic to call variable currentTime, then increment it 20 secs
    // but if I do const twentySecondsFromNow = currentTime.setSeconds(currentTime.getSeconds() + 20)
    // it doesnt work.
    const currentTime = new Date()
    currentTime.setSeconds(currentTime.getSeconds() + delayBetweenRounds)

    // Wait for the delay between rounds & run this code
    jobs.betweenRounds[eventId] = new CronJob(currentTime, async () => {
      // If the event is over, end it
      if (eventIsOver) {
        return endEvent(eventId)
      }

      // TODO: describe this action
      return nextRound({
        params: {
          eventId,
          currentRound: currentRound + 1,
          round_length: roundLength,
          numRounds,
          useSamyakAlgo,
        },
      })
    })

    // TODO: why do we do this inside?
    return jobs.betweenRounds[eventId].start()
  })

  // If this isn't a recovered cron job, save it to the database
  if (!recoveredStartTime) {
    console.log('(initNextRound) 🕚 Time to end the round:', timeToEndRound)
    const setCronTimestampRes = await orm.request(setCronTimestamp, {
      eventId,
      timestamp: timeToEndRound.toISOString(),
    })
    console.log('(initNextRound) ↩️ `setCronTimestampRes`:', setCronTimestampRes)
  }

  // TODO(s)
  //  ~ insert job execution time in a new table;
  //  ~ when the server starts, check for in progress events;
  //  ~ if theres an in progress event, set up new cron;

  // TODO: (?)
  return jobs.nextRound[eventId].start()
}

export default initNextRound
