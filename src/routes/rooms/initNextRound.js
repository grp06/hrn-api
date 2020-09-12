import * as Sentry from '@sentry/node'
import { CronJob } from 'cron'
import nextRound from './nextRound'
import orm from '../../services/orm'
import updateEventObject from '../../gql/mutations/event/updateEventObject'
import { endEvent } from './runEventHelpers'

const initNextRound = async ({
  numRounds = 10,
  eventId,
  roundLength: round_length,
  currentRound,
}) => {
  console.log('inside initNextRound. Creating job for 15 secs from now')
  const roundLengthInMinutes = round_length / 60000
  // console.log('roundLengthInMinutes', roundLengthInMinutes)

  const date = new Date()
  // date.setMinutes(date.getMinutes() + roundLengthInMinutes)
  date.setSeconds(date.getSeconds() + 15)
  const job = new CronJob(date, async function () {
    // const d = new Date()
    console.log('inside job ', job)
    console.log('currentRound = ', currentRound)
    console.log('numRounds = ', numRounds)
    if (currentRound < numRounds) {
      console.log('try to update to in-between-rounds')
      try {
        await orm.request(updateEventObject, {
          id: eventId,
          newStatus: 'in-between-rounds',
          newCurrentRound: currentRound,
        })

        console.log('set room to in-between-rounds for eventId ', eventId)
      } catch (error) {
        Sentry.captureException(error)
        console.log('error setting ended_at for event = ', error)
      }

      setTimeout(() => {
        console.log('calling next round')
        nextRound({
          params: {
            eventId,
            currentRound: currentRound + 1,
            round_length,
            numRounds,
          },
        })
        console.log('calling stop')
        job.stop()
      }, 10000)
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
