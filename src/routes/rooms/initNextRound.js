import * as Sentry from '@sentry/node'
import { CronJob } from 'cron'
import nextRound from './nextRound'

const initNextRound = async ({
  numRounds = 10,
  eventId,
  roundLength: round_length,
  currentRound,
}) => {
  const roundLengthInMinutes = round_length / 60000

  const date = new Date()
  date.setMinutes(date.getMinutes() + roundLengthInMinutes)
  // date.setSeconds(date.getSeconds() + 5)

  const job = new CronJob(date, function () {
    // const d = new Date()

    if (currentRound + 1 < numRounds) {
      nextRound({
        params: {
          eventId,
          currentRound: currentRound + 1,
          round_length,
          numRounds,
        },
      })
    } else {
      //
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
