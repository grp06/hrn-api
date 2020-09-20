import { CronJob } from 'cron'
import jobs from './jobs'

const scanLobbyForPairings = (eventId) => {
  console.log('scanLobbyForPairings -> eventId', eventId)
  jobs.lobbyAssignments[eventId] = new CronJob('*/3 * * * * *', async function () {
    console.log('scanning lobby for assignments')
  })

  jobs.lobbyAssignments[eventId].start()
}

export default scanLobbyForPairings
