import * as Sentry from '@sentry/node'
import { CronJob } from 'cron'
import nextRound from './nextRound'
import { endEvent, omniFinishRounds } from './runEventHelpers'
import jobs from './jobs'

const betweenRoundsTimeout = 20000

const initNextRound = async ({
  numRounds = 10,
  eventId,
  roundLength: round_length,
  currentRound,
}) => {
  const roundLengthInMinutes = round_length / 60000

  const date = new Date()
  // date.setMinutes(date.getMinutes() + roundLengthInMinutes)
  // used for testing for super short rounds
  date.setSeconds(date.getSeconds() + 20)

  jobs[eventId] = new CronJob(date, async function () {
    // const d = new Date()

    if (currentRound < numRounds) {
      try {
        await omniFinishRounds(currentRound, eventId)
      } catch (error) {
        Sentry.captureException(error)
      }

      setTimeout(() => {
        nextRound({
          params: {
            eventId,
            currentRound: currentRound + 1,
            round_length,
            numRounds,
          },
        })
      }, betweenRoundsTimeout)
    } else {
      endEvent(eventId)
    }
  })

  jobs[eventId].start()

  // insert job exectuion time in a new table
  // when the server starts, check for in progress events
  // if theres an in progress event, set up new cron

  // also, when the server starts, if therse an on going event
  // set up the subscription
}
export default initNextRound
