import * as Sentry from '@sentry/node'

import { CronJob } from 'cron'
import jobs from '../../services/jobs'
import orm from '../../services/orm'
import { getEventInfoByEventId } from '../../gql/queries'
import omniCreatePairings from '../../matchingAlgo/omniCreatePairings'

const scanLobbyForPairings = (eventId) => {
  console.log('scanLobbyForPairings -> eventId', eventId)
  jobs.lobbyAssignments[eventId] = new CronJob('*/20 * * * * *', async function () {
    console.log('scanning lobby for assignments')
    // get query for eventObj by eventId
    let eventInfo
    try {
      eventInfo = await orm.request(getEventInfoByEventId, {
        eventId,
      })
    } catch (error) {
      console.log('scanLobbyForPairings -> error', error)
      Sentry.captureException(error)
    }

    const eventObj = eventInfo.data.events[0]
    const { status, updated_at, round_length, current_round } = eventObj
    console.log('scanLobbyForPairings -> status', status)

    const roundLengthInMs = round_length * 60000
    const twoMinsInMs = 120000
    const roundEndsAt = new Date(updated_at).getTime() + roundLengthInMs
    const moreThanTwoMinsLeft = roundEndsAt - Date.now() > twoMinsInMs

    if (status === 'room-in-progress' && moreThanTwoMinsLeft) {
      console.log('TRY TO MAKE NEW MATCHES')
      omniCreatePairings({ eventId, currentRound: current_round, fromLobbyScan: true })
    } else {
      console.log('LESS THAN 2 MINS')
    }
    // if we're not in between rounds
    // and there's > 2 mins left in the round
    // make pairings with eventId and currentRound
  })

  setTimeout(() => {
    jobs.lobbyAssignments[eventId].start()
  }, 20000)
}

export default scanLobbyForPairings
