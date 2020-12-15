import * as Sentry from '@sentry/node'
import { CronJob } from 'cron'
import nextRound from './nextRound'
import { endEvent, omniFinishRounds } from './runEventHelpers'
import jobs from '../../services/jobs'
import orm from '../../services/orm'
import { setCronTimestamp } from '../../gql/mutations'

const initNextRound = async ({
  numRounds,
  eventId,
  roundLength: round_length,
  currentRound,
  nextRoundStart,
  useSamyakAlgo,
}) => {
  console.log('numRounds', numRounds)
  console.log('eventId', eventId)
  console.log('roundLength', round_length)
  console.log('currentRound', currentRound)
  console.log('nextRoundStart', nextRoundStart)
  let betweenRoundsDelay = eventId === 656 ? 300 : 20
  const eventIsOver = currentRound === numRounds

  const roundLengthForStartupFuel = 900000
  const length = eventId === 656 ? roundLengthForStartupFuel : round_length
  const timeToEndRound = new Date(new Date().getTime() + length)
  console.log('🚀 ~ timeToEndRound', timeToEndRound)
  console.log('time now =', new Date(new Date().getTime()))
  // used for testing for super short rounds
  // date.setSeconds(date.getSeconds() + 20)

  let recoveredStartTime

  if (nextRoundStart) {
    recoveredStartTime = new Date(nextRoundStart)
    console.log('recoverd =', recoveredStartTime)
  }
  // in X minutes, run the following code
  // if next_round_start exists, we're recovering from a server restart
  jobs.nextRound[eventId] = new CronJob(recoveredStartTime || timeToEndRound, async function () {
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
      console.log('initNextRound -> eventIsOver', eventIsOver)
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
          useSamyakAlgo,
        },
      })
    })

    return jobs.betweenRounds[eventId].start()
  })

  if (!nextRoundStart) {
    console.log('time sav =', timeToEndRound)
    const setCronTimestampRes = await orm.request(setCronTimestamp, {
      eventId,
      timestamp: timeToEndRound.toISOString(),
    })
    console.log('setCronTimestampRes', setCronTimestampRes)
  }

  // TODO
  // insert job exectuion time in a new table
  // when the server starts, check for in progress events
  // if theres an in progress event, set up new cron

  return jobs.nextRound[eventId].start()
}
export default initNextRound
