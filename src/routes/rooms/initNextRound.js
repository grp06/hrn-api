import * as Sentry from '@sentry/node'
import { CronJob } from 'cron'
import nextRound from './nextRound'
import { endEvent, omniFinishRounds } from './runEventHelpers'

const betweenRoundsTimeout = 20000

const initNextRound = async ({
  numRounds = 10,
  eventId,
  roundLength: round_length,
  currentRound,
}) => {
  const roundLengthInMinutes = round_length / 60000
  // console.log('roundLengthInMinutes', roundLengthInMinutes)

  const date = new Date()
  // date.setMinutes(date.getMinutes() + roundLengthInMinutes)
  // used for testing for super short rounds
  date.setSeconds(date.getSeconds() + 20)

  const job = new CronJob(date, async function () {
    // const d = new Date()

    console.log('currentRound = ', currentRound)
    console.log('numRounds = ', numRounds)
    if (currentRound < numRounds) {
      try {
        await omniFinishRounds(currentRound, eventId)
        console.log('waiting between rounds')
      } catch (error) {
        Sentry.captureException(error)
        console.log(error)
      }

      setTimeout(() => {
        console.log('calling next round ', Date.now())
        nextRound({
          params: {
            eventId,
            currentRound: currentRound + 1,
            round_length,
            numRounds,
          },
        })

        job.stop()
      }, betweenRoundsTimeout)
    } else {
      endEvent(eventId)
      // end event
    }
  })

  job.start()
  // insert job exectuion time in a new table
  // when the server starts, check for in progress events
  // if theres an in progress event, set up new cron

  // also, when the server starts, if therse an on going event
  // set up the subscription
}
export default initNextRound
