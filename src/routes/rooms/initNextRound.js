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
}
export default initNextRound
