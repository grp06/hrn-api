import { CronJob } from 'cron'

type Jobs = {
  nextRound: { [key: number]: CronJob | null }
  betweenRounds: { [key: number]: CronJob | null }
  countdown: { [key: number]: CronJob | null }
}

const jobs: Jobs = {
  nextRound: {},
  betweenRounds: {},
  countdown: {},
}

export default jobs
