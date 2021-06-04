import { CronJob } from 'cron'

type Jobs = {
  nextRound: { [key: number]: CronJob }
  lobbyAssignments: { [key: number]: CronJob }
  betweenRounds: { [key: number]: CronJob }
  countdown: { [key: number]: CronJob }
}

const jobs: Jobs = {
  nextRound: {},
  lobbyAssignments: {},
  betweenRounds: {},
  countdown: {},
}

export default jobs
