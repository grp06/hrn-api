import * as Sentry from '@sentry/node'
import { CronJob } from 'cron'
import nextRound from './nextRound'
import { endEvent, omniFinishRounds } from './runEventHelpers'
import jobs from './jobs'

let betweenRoundsDelay = 20

const initNextRound = async ({ numRounds, eventId, roundLength: round_length, currentRound }) => {
  const roundLengthInMinutes = round_length / 60000
  const eventIsOver = currentRound === numRounds

  const date = new Date()
  date.setMinutes(date.getMinutes() + roundLengthInMinutes)
  // used for testing for super short rounds
  // date.setSeconds(date.getSeconds() + 20)

  // in X minutes, run the following code
  jobs.nextRound[eventId] = new CronJob(date, async function () {
    // const d = new Date()

    // when we're inside, its the END of currentRound
    try {
      await omniFinishRounds(currentRound, eventId)
    } catch (error) {
      Sentry.captureException(error)
    }

    // I know it's not semantic to call variable currentTime, then increment it 20 secs
    // but if I do const twentySecondsFromNow = currentTime.setSeconds(currentTime.getSeconds() + 20)
    // it doesnt work. //Todo ... make this more semantic

    const currentTime = new Date()

    if (eventIsOver) {
      betweenRoundsDelay = 10
    }

    currentTime.setSeconds(currentTime.getSeconds() + betweenRoundsDelay)
    // in 20 seconds, run this code
    jobs.betweenRounds[eventId] = new CronJob(currentTime, async function () {
      if (eventIsOver) {
        return endEvent(eventId)
      }

      return nextRound({
        params: {
          eventId,
          currentRound: currentRound + 1,
          round_length,
          numRounds,
        },
      })
    })

    return jobs.betweenRounds[eventId].start()
  })

  // TODO
  // insert job exectuion time in a new table
  // when the server starts, check for in progress events
  // if theres an in progress event, set up new cron

  return jobs.nextRound[eventId].start()
}
export default initNextRound
