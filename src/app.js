import * as Sentry from '@sentry/node'
import { startServer } from './server-graphql'
import logger from './logger'
import './services/cron-service'
import webhooks from './webhooks'
import orm from './services/orm'
import { bulkInsertPartners } from './gql/mutations'

import initNextRound from './routes/rooms/initNextRound'

import { getCronJobs } from './gql/queries'

require('dotenv').config()
const cors = require('cors')
const express = require('express')
const morgan = require('morgan')
const bodyParser = require('body-parser')
const { NODE_ENV, PORT } = require('./config.js')
const roomsRouter = require('./routes/rooms/rooms-router')
const tokenRouter = require('./routes/twilio-token/twilio-token-router')
const usersRouter = require('./routes/users/users-router')
const authRouter = require('./routes/auth/auth-router')
const emailRouter = require('./routes/email/email-router')

const app = express()

Sentry.init({ dsn: 'https://c9f54122fb8e4de4b52f55948a091e2b@o408346.ingest.sentry.io/5279031' })

const morganOption = NODE_ENV === 'production' ? 'tiny' : 'common'

global.__logger = logger
global.__Sentry = Sentry
// The request handler must be the first middleware on the app
app.use(Sentry.Handlers.requestHandler())

app.use(
  bodyParser.urlencoded({
    extended: true,
  })
)
app.use(bodyParser.json())
app.use(morgan(morganOption))
app.use(cors())
startServer(app, PORT)
console.log(`Apollo :${PORT}/graphql`)
app.use('/api/rooms', roomsRouter)
app.use('/api/token', tokenRouter)
app.use('/api/signup', usersRouter)
app.use('/api/auth', authRouter)
app.use('/api/email', emailRouter)
app.use('/webhooks', webhooks)

app.get('/', (req, res) => {
  res.send('Looks like the HiRightNow API is working!')
})

app.get('/event-trigger-test', () => {
  console.log('hiii from event trigger test')
})

app.get('/debug-sentry', () => {
  throw new Error('My first Sentry error!')
})

// The error handler must be before any other error middleware
app.use(Sentry.Handlers.errorHandler())
app.set('view engine', 'ejs')

app.use(function errorHandler(error, req, res, next) {
  let response
  if (NODE_ENV === 'production') {
    response = { error: { message: 'server error' } }
  } else {
    console.error(error)
    response = { message: error.message, error }
  }
  res.status(500).json(response)
})

const checkForInterruptedEvents = async () => {
  console.log('checking for interrupted events')
  const cronJobs = await orm.request(getCronJobs)
  console.log('cronJobs.data.cron_jobs = ', cronJobs.data.cron_jobs)
  if (cronJobs.data.cron_jobs.length) {
    cronJobs.data.cron_jobs.forEach((event) => {
      const { next_round_start: nextRoundStart } = event
      const {
        num_rounds: numRounds,
        id: eventId,
        round_length,
        current_round: currentRound,
      } = event.event
      const roundLength = round_length * 60000
      initNextRound({ numRounds, eventId, roundLength, currentRound, nextRoundStart })
    })
  }
}

checkForInterruptedEvents()

const insertPartners = async () => {
  try {
    const rounds = [
      {
        partnerX: {
          id: 167,
        },
        partnerY: {
          id: 225,
        },
        round_number: 9,
        event_id: 27,
      },
      {
        partnerX: {
          id: 12,
        },
        partnerY: {
          id: 172,
        },
        round_number: 2,
        event_id: 33,
      },
      {
        partnerX: {
          id: 223,
        },
        partnerY: {
          id: 283,
        },
        round_number: 2,
        event_id: 33,
      },
      {
        partnerX: {
          id: 12,
        },
        partnerY: {
          id: 283,
        },
        round_number: 3,
        event_id: 33,
      },
      {
        partnerX: {
          id: 12,
        },
        partnerY: {
          id: 223,
        },
        round_number: 5,
        event_id: 33,
      },
      {
        partnerX: {
          id: 136,
        },
        partnerY: {
          id: 289,
        },
        round_number: 9,
        event_id: 27,
      },
      {
        partnerX: {
          id: 167,
        },
        partnerY: {
          id: 285,
        },
        round_number: 1,
        event_id: 27,
      },
      {
        partnerX: {
          id: 225,
        },
        partnerY: {
          id: 236,
        },
        round_number: 1,
        event_id: 27,
      },
      {
        partnerX: {
          id: 167,
        },
        partnerY: {
          id: 287,
        },
        round_number: 2,
        event_id: 27,
      },
      {
        partnerX: {
          id: 167,
        },
        partnerY: {
          id: 8,
        },
        round_number: 3,
        event_id: 27,
      },
      {
        partnerX: {
          id: 288,
        },
        partnerY: {
          id: 8,
        },
        round_number: 4,
        event_id: 27,
      },
      {
        partnerX: {
          id: 225,
        },
        partnerY: {
          id: 285,
        },
        round_number: 4,
        event_id: 27,
      },
      {
        partnerX: {
          id: 136,
        },
        partnerY: {
          id: 167,
        },
        round_number: 5,
        event_id: 27,
      },
      {
        partnerX: {
          id: 225,
        },
        partnerY: {
          id: 289,
        },
        round_number: 5,
        event_id: 27,
      },
      {
        partnerX: {
          id: 285,
        },
        partnerY: {
          id: 289,
        },
        round_number: 6,
        event_id: 27,
      },
      {
        partnerX: {
          id: 167,
        },
        partnerY: {
          id: 288,
        },
        round_number: 6,
        event_id: 27,
      },
      {
        partnerX: {
          id: 225,
        },
        partnerY: {
          id: 290,
        },
        round_number: 6,
        event_id: 27,
      },
      {
        partnerX: {
          id: 225,
        },
        partnerY: {
          id: 288,
        },
        round_number: 7,
        event_id: 27,
      },
      {
        partnerX: {
          id: 236,
        },
        partnerY: {
          id: 289,
        },
        round_number: 7,
        event_id: 27,
      },
      {
        partnerX: {
          id: 167,
        },
        partnerY: {
          id: 236,
        },
        round_number: 8,
        event_id: 27,
      },
      {
        partnerX: {
          id: 287,
        },
        partnerY: {
          id: 290,
        },
        round_number: 8,
        event_id: 27,
      },
      {
        partnerX: {
          id: 136,
        },
        partnerY: {
          id: 225,
        },
        round_number: 8,
        event_id: 27,
      },
      {
        partnerX: {
          id: 513,
        },
        partnerY: {
          id: 596,
        },
        round_number: 5,
        event_id: 56,
      },
      {
        partnerX: {
          id: 319,
        },
        partnerY: {
          id: 591,
        },
        round_number: 5,
        event_id: 56,
      },
      {
        partnerX: {
          id: 1071,
        },
        partnerY: {
          id: 1804,
        },
        round_number: 1,
        event_id: 119,
      },
      {
        partnerX: {
          id: 568,
        },
        partnerY: {
          id: 586,
        },
        round_number: 5,
        event_id: 56,
      },
      {
        partnerX: {
          id: 119,
        },
        partnerY: {
          id: 557,
        },
        round_number: 5,
        event_id: 56,
      },
      {
        partnerX: {
          id: 12,
        },
        partnerY: {
          id: 297,
        },
        round_number: 5,
        event_id: 56,
      },
      {
        partnerX: {
          id: 579,
        },
        partnerY: {
          id: 8,
        },
        round_number: 5,
        event_id: 56,
      },
      {
        partnerX: {
          id: 1759,
        },
        partnerY: {
          id: 1769,
        },
        round_number: 1,
        event_id: 119,
      },
      {
        partnerX: {
          id: 590,
        },
        partnerY: {
          id: 600,
        },
        round_number: 5,
        event_id: 56,
      },
      {
        partnerX: {
          id: 539,
        },
        partnerY: {
          id: 593,
        },
        round_number: 5,
        event_id: 56,
      },
      {
        partnerX: {
          id: 557,
        },
        partnerY: {
          id: 590,
        },
        round_number: 8,
        event_id: 56,
      },
      {
        partnerX: {
          id: 598,
        },
        partnerY: {
          id: 600,
        },
        round_number: 8,
        event_id: 56,
      },
      {
        partnerX: {
          id: 579,
        },
        partnerY: {
          id: 596,
        },
        round_number: 8,
        event_id: 56,
      },
      {
        partnerX: {
          id: 513,
        },
        partnerY: {
          id: 586,
        },
        round_number: 8,
        event_id: 56,
      },
      {
        partnerX: {
          id: 12,
        },
        partnerY: {
          id: 296,
        },
        round_number: 1,
        event_id: 54,
      },
      {
        partnerX: {
          id: 539,
        },
        partnerY: {
          id: 595,
        },
        round_number: 8,
        event_id: 56,
      },
      {
        partnerX: {
          id: 1629,
        },
        partnerY: {
          id: 1784,
        },
        round_number: 1,
        event_id: 119,
      },
      {
        partnerX: {
          id: 12,
        },
        partnerY: {
          id: 1805,
        },
        round_number: 1,
        event_id: 119,
      },
      {
        partnerX: {
          id: 1600,
        },
        partnerY: {
          id: 1655,
        },
        round_number: 1,
        event_id: 123,
      },
      {
        partnerX: {
          id: 1693,
        },
        partnerY: {
          id: 1905,
        },
        round_number: 7,
        event_id: 131,
      },
      {
        partnerX: {
          id: 1837,
        },
        partnerY: {
          id: 1925,
        },
        round_number: 7,
        event_id: 131,
      },
      {
        partnerX: {
          id: 12,
        },
        partnerY: {
          id: 550,
        },
        round_number: 7,
        event_id: 131,
      },
      {
        partnerX: {
          id: 1910,
        },
        partnerY: {
          id: 1958,
        },
        round_number: 7,
        event_id: 131,
      },
      {
        partnerX: {
          id: 1901,
        },
        partnerY: {
          id: 1933,
        },
        round_number: 7,
        event_id: 131,
      },
      {
        partnerX: {
          id: 1532,
        },
        partnerY: {
          id: 8,
        },
        round_number: 7,
        event_id: 131,
      },
      {
        partnerX: {
          id: 371,
        },
        partnerY: {
          id: 465,
        },
        round_number: 1,
        event_id: 49,
      },
      {
        partnerX: {
          id: 319,
        },
        partnerY: {
          id: 500,
        },
        round_number: 1,
        event_id: 49,
      },
      {
        partnerX: {
          id: 128,
        },
        partnerY: {
          id: 516,
        },
        round_number: 1,
        event_id: 49,
      },
      {
        partnerX: {
          id: 498,
        },
        partnerY: {
          id: 514,
        },
        round_number: 1,
        event_id: 49,
      },
      {
        partnerX: {
          id: 12,
        },
        partnerY: {
          id: 413,
        },
        round_number: 1,
        event_id: 49,
      },
      {
        partnerX: {
          id: 34,
        },
        partnerY: {
          id: 348,
        },
        round_number: 1,
        event_id: 49,
      },
      {
        partnerX: {
          id: 389,
        },
        partnerY: {
          id: 484,
        },
        round_number: 1,
        event_id: 49,
      },
      {
        partnerX: {
          id: 457,
        },
        partnerY: {
          id: 509,
        },
        round_number: 1,
        event_id: 49,
      },
      {
        partnerX: {
          id: 397,
        },
        partnerY: {
          id: 506,
        },
        round_number: 1,
        event_id: 49,
      },
      {
        partnerX: {
          id: 115,
        },
        partnerY: {
          id: 488,
        },
        round_number: 1,
        event_id: 49,
      },
      {
        partnerX: {
          id: 353,
        },
        partnerY: {
          id: 463,
        },
        round_number: 3,
        event_id: 49,
      },
      {
        partnerX: {
          id: 468,
        },
        partnerY: {
          id: 485,
        },
        round_number: 1,
        event_id: 49,
      },
      {
        partnerX: {
          id: 335,
        },
        partnerY: {
          id: 8,
        },
        round_number: 1,
        event_id: 49,
      },
      {
        partnerX: {
          id: 362,
        },
        partnerY: {
          id: 472,
        },
        round_number: 3,
        event_id: 49,
      },
      {
        partnerX: {
          id: 379,
        },
        partnerY: {
          id: 411,
        },
        round_number: 1,
        event_id: 49,
      },
      {
        partnerX: {
          id: 464,
        },
        partnerY: {
          id: 504,
        },
        round_number: 1,
        event_id: 49,
      },
      {
        partnerX: {
          id: 391,
        },
        partnerY: {
          id: 476,
        },
        round_number: 1,
        event_id: 49,
      },
      {
        partnerX: {
          id: 481,
        },
        partnerY: {
          id: 52,
        },
        round_number: 1,
        event_id: 49,
      },
      {
        partnerX: {
          id: 350,
        },
        partnerY: {
          id: 515,
        },
        round_number: 1,
        event_id: 49,
      },
      {
        partnerX: {
          id: 355,
        },
        partnerY: {
          id: 472,
        },
        round_number: 1,
        event_id: 49,
      },
      {
        partnerX: {
          id: 484,
        },
        partnerY: {
          id: 514,
        },
        round_number: 3,
        event_id: 49,
      },
      {
        partnerX: {
          id: 225,
        },
        partnerY: {
          id: 297,
        },
        round_number: 3,
        event_id: 49,
      },
      {
        partnerX: {
          id: 354,
        },
        partnerY: {
          id: 468,
        },
        round_number: 2,
        event_id: 49,
      },
      {
        partnerX: {
          id: 379,
        },
        partnerY: {
          id: 495,
        },
        round_number: 3,
        event_id: 49,
      },
      {
        partnerX: {
          id: 254,
        },
        partnerY: {
          id: 500,
        },
        round_number: 3,
        event_id: 49,
      },
      {
        partnerX: {
          id: 350,
        },
        partnerY: {
          id: 389,
        },
        round_number: 2,
        event_id: 49,
      },
      {
        partnerX: {
          id: 464,
        },
        partnerY: {
          id: 488,
        },
        round_number: 3,
        event_id: 49,
      },
      {
        partnerX: {
          id: 509,
        },
        partnerY: {
          id: 516,
        },
        round_number: 3,
        event_id: 49,
      },
      {
        partnerX: {
          id: 470,
        },
        partnerY: {
          id: 52,
        },
        round_number: 3,
        event_id: 49,
      },
      {
        partnerX: {
          id: 510,
        },
        partnerY: {
          id: 52,
        },
        round_number: 2,
        event_id: 49,
      },
      {
        partnerX: {
          id: 225,
        },
        partnerY: {
          id: 472,
        },
        round_number: 2,
        event_id: 49,
      },
      {
        partnerX: {
          id: 335,
        },
        partnerY: {
          id: 413,
        },
        round_number: 2,
        event_id: 49,
      },
      {
        partnerX: {
          id: 348,
        },
        partnerY: {
          id: 515,
        },
        round_number: 2,
        event_id: 49,
      },
      {
        partnerX: {
          id: 457,
        },
        partnerY: {
          id: 470,
        },
        round_number: 2,
        event_id: 49,
      },
      {
        partnerX: {
          id: 297,
        },
        partnerY: {
          id: 488,
        },
        round_number: 2,
        event_id: 49,
      },
      {
        partnerX: {
          id: 362,
        },
        partnerY: {
          id: 492,
        },
        round_number: 2,
        event_id: 49,
      },
      {
        partnerX: {
          id: 397,
        },
        partnerY: {
          id: 498,
        },
        round_number: 2,
        event_id: 49,
      },
      {
        partnerX: {
          id: 364,
        },
        partnerY: {
          id: 476,
        },
        round_number: 2,
        event_id: 49,
      },
      {
        partnerX: {
          id: 495,
        },
        partnerY: {
          id: 517,
        },
        round_number: 2,
        event_id: 49,
      },
      {
        partnerX: {
          id: 128,
        },
        partnerY: {
          id: 463,
        },
        round_number: 2,
        event_id: 49,
      },
      {
        partnerX: {
          id: 353,
        },
        partnerY: {
          id: 506,
        },
        round_number: 2,
        event_id: 49,
      },
      {
        partnerX: {
          id: 254,
        },
        partnerY: {
          id: 516,
        },
        round_number: 2,
        event_id: 49,
      },
      {
        partnerX: {
          id: 371,
        },
        partnerY: {
          id: 379,
        },
        round_number: 2,
        event_id: 49,
      },
      {
        partnerX: {
          id: 12,
        },
        partnerY: {
          id: 474,
        },
        round_number: 2,
        event_id: 49,
      },
      {
        partnerX: {
          id: 458,
        },
        partnerY: {
          id: 503,
        },
        round_number: 2,
        event_id: 49,
      },
      {
        partnerX: {
          id: 474,
        },
        partnerY: {
          id: 498,
        },
        round_number: 3,
        event_id: 49,
      },
      {
        partnerX: {
          id: 119,
        },
        partnerY: {
          id: 12,
        },
        round_number: 6,
        event_id: 56,
      },
      {
        partnerX: {
          id: 588,
        },
        partnerY: {
          id: 598,
        },
        round_number: 6,
        event_id: 56,
      },
      {
        partnerX: {
          id: 297,
        },
        partnerY: {
          id: 590,
        },
        round_number: 6,
        event_id: 56,
      },
      {
        partnerX: {
          id: 587,
        },
        partnerY: {
          id: 600,
        },
        round_number: 6,
        event_id: 56,
      },
      {
        partnerX: {
          id: 557,
        },
        partnerY: {
          id: 596,
        },
        round_number: 6,
        event_id: 56,
      },
      {
        partnerX: {
          id: 586,
        },
        partnerY: {
          id: 597,
        },
        round_number: 6,
        event_id: 56,
      },
      {
        partnerX: {
          id: 579,
        },
        partnerY: {
          id: 593,
        },
        round_number: 6,
        event_id: 56,
      },
      {
        partnerX: {
          id: 568,
        },
        partnerY: {
          id: 579,
        },
        round_number: 7,
        event_id: 56,
      },
      {
        partnerX: {
          id: 587,
        },
        partnerY: {
          id: 597,
        },
        round_number: 7,
        event_id: 56,
      },
      {
        partnerX: {
          id: 1759,
        },
        partnerY: {
          id: 8,
        },
        round_number: 2,
        event_id: 119,
      },
      {
        partnerX: {
          id: 1208,
        },
        partnerY: {
          id: 1769,
        },
        round_number: 2,
        event_id: 119,
      },
      {
        partnerX: {
          id: 1071,
        },
        partnerY: {
          id: 1685,
        },
        round_number: 2,
        event_id: 123,
      },
      {
        partnerX: {
          id: 119,
        },
        partnerY: {
          id: 1805,
        },
        round_number: 2,
        event_id: 119,
      },
      {
        partnerX: {
          id: 297,
        },
        partnerY: {
          id: 8,
        },
        round_number: 8,
        event_id: 56,
      },
      {
        partnerX: {
          id: 588,
        },
        partnerY: {
          id: 591,
        },
        round_number: 8,
        event_id: 56,
      },
      {
        partnerX: {
          id: 12,
        },
        partnerY: {
          id: 1629,
        },
        round_number: 2,
        event_id: 119,
      },
      {
        partnerX: {
          id: 1698,
        },
        partnerY: {
          id: 1784,
        },
        round_number: 2,
        event_id: 119,
      },
      {
        partnerX: {
          id: 12,
        },
        partnerY: {
          id: 546,
        },
        round_number: 8,
        event_id: 56,
      },
      {
        partnerX: {
          id: 1686,
        },
        partnerY: {
          id: 1791,
        },
        round_number: 2,
        event_id: 123,
      },
      {
        partnerX: {
          id: 1682,
        },
        partnerY: {
          id: 1828,
        },
        round_number: 2,
        event_id: 123,
      },
      {
        partnerX: {
          id: 1600,
        },
        partnerY: {
          id: 1681,
        },
        round_number: 2,
        event_id: 123,
      },
      {
        partnerX: {
          id: 1655,
        },
        partnerY: {
          id: 1827,
        },
        round_number: 2,
        event_id: 123,
      },
      {
        partnerX: {
          id: 1724,
        },
        partnerY: {
          id: 1801,
        },
        round_number: 2,
        event_id: 123,
      },
      {
        partnerX: {
          id: 1653,
        },
        partnerY: {
          id: 1700,
        },
        round_number: 2,
        event_id: 123,
      },
      {
        partnerX: {
          id: 509,
        },
        partnerY: {
          id: 52,
        },
        round_number: 5,
        event_id: 49,
      },
      {
        partnerX: {
          id: 411,
        },
        partnerY: {
          id: 413,
        },
        round_number: 3,
        event_id: 49,
      },
      {
        partnerX: {
          id: 364,
        },
        partnerY: {
          id: 500,
        },
        round_number: 5,
        event_id: 49,
      },
      {
        partnerX: {
          id: 34,
        },
        partnerY: {
          id: 354,
        },
        round_number: 3,
        event_id: 49,
      },
      {
        partnerX: {
          id: 362,
        },
        partnerY: {
          id: 504,
        },
        round_number: 6,
        event_id: 49,
      },
      {
        partnerX: {
          id: 128,
        },
        partnerY: {
          id: 350,
        },
        round_number: 3,
        event_id: 49,
      },
      {
        partnerX: {
          id: 353,
        },
        partnerY: {
          id: 8,
        },
        round_number: 5,
        event_id: 49,
      },
      {
        partnerX: {
          id: 476,
        },
        partnerY: {
          id: 515,
        },
        round_number: 3,
        event_id: 49,
      },
      {
        partnerX: {
          id: 389,
        },
        partnerY: {
          id: 506,
        },
        round_number: 3,
        event_id: 49,
      },
      {
        partnerX: {
          id: 12,
        },
        partnerY: {
          id: 504,
        },
        round_number: 3,
        event_id: 49,
      },
      {
        partnerX: {
          id: 355,
        },
        partnerY: {
          id: 495,
        },
        round_number: 5,
        event_id: 49,
      },
      {
        partnerX: {
          id: 411,
        },
        partnerY: {
          id: 463,
        },
        round_number: 5,
        event_id: 49,
      },
      {
        partnerX: {
          id: 34,
        },
        partnerY: {
          id: 492,
        },
        round_number: 5,
        event_id: 49,
      },
      {
        partnerX: {
          id: 115,
        },
        partnerY: {
          id: 364,
        },
        round_number: 4,
        event_id: 49,
      },
      {
        partnerX: {
          id: 391,
        },
        partnerY: {
          id: 500,
        },
        round_number: 4,
        event_id: 49,
      },
      {
        partnerX: {
          id: 297,
        },
        partnerY: {
          id: 495,
        },
        round_number: 4,
        event_id: 49,
      },
      {
        partnerX: {
          id: 458,
        },
        partnerY: {
          id: 488,
        },
        round_number: 5,
        event_id: 49,
      },
      {
        partnerX: {
          id: 350,
        },
        partnerY: {
          id: 371,
        },
        round_number: 4,
        event_id: 49,
      },
      {
        partnerX: {
          id: 12,
        },
        partnerY: {
          id: 495,
        },
        round_number: 6,
        event_id: 49,
      },
      {
        partnerX: {
          id: 411,
        },
        partnerY: {
          id: 516,
        },
        round_number: 4,
        event_id: 49,
      },
      {
        partnerX: {
          id: 362,
        },
        partnerY: {
          id: 457,
        },
        round_number: 4,
        event_id: 49,
      },
      {
        partnerX: {
          id: 485,
        },
        partnerY: {
          id: 504,
        },
        round_number: 5,
        event_id: 49,
      },
      {
        partnerX: {
          id: 34,
        },
        partnerY: {
          id: 379,
        },
        round_number: 4,
        event_id: 49,
      },
      {
        partnerX: {
          id: 355,
        },
        partnerY: {
          id: 389,
        },
        round_number: 4,
        event_id: 49,
      },
      {
        partnerX: {
          id: 498,
        },
        partnerY: {
          id: 8,
        },
        round_number: 4,
        event_id: 49,
      },
      {
        partnerX: {
          id: 463,
        },
        partnerY: {
          id: 485,
        },
        round_number: 4,
        event_id: 49,
      },
      {
        partnerX: {
          id: 353,
        },
        partnerY: {
          id: 509,
        },
        round_number: 4,
        event_id: 49,
      },
      {
        partnerX: {
          id: 514,
        },
        partnerY: {
          id: 520,
        },
        round_number: 4,
        event_id: 49,
      },
      {
        partnerX: {
          id: 225,
        },
        partnerY: {
          id: 506,
        },
        round_number: 4,
        event_id: 49,
      },
      {
        partnerX: {
          id: 515,
        },
        partnerY: {
          id: 52,
        },
        round_number: 4,
        event_id: 49,
      },
      {
        partnerX: {
          id: 413,
        },
        partnerY: {
          id: 476,
        },
        round_number: 4,
        event_id: 49,
      },
      {
        partnerX: {
          id: 297,
        },
        partnerY: {
          id: 464,
        },
        round_number: 5,
        event_id: 49,
      },
      {
        partnerX: {
          id: 115,
        },
        partnerY: {
          id: 520,
        },
        round_number: 5,
        event_id: 49,
      },
      {
        partnerX: {
          id: 225,
        },
        partnerY: {
          id: 498,
        },
        round_number: 5,
        event_id: 49,
      },
      {
        partnerX: {
          id: 335,
        },
        partnerY: {
          id: 516,
        },
        round_number: 5,
        event_id: 49,
      },
      {
        partnerX: {
          id: 470,
        },
        partnerY: {
          id: 514,
        },
        round_number: 5,
        event_id: 49,
      },
      {
        partnerX: {
          id: 128,
        },
        partnerY: {
          id: 397,
        },
        round_number: 5,
        event_id: 49,
      },
      {
        partnerX: {
          id: 12,
        },
        partnerY: {
          id: 481,
        },
        round_number: 5,
        event_id: 49,
      },
      {
        partnerX: {
          id: 362,
        },
        partnerY: {
          id: 379,
        },
        round_number: 5,
        event_id: 49,
      },
      {
        partnerX: {
          id: 457,
        },
        partnerY: {
          id: 506,
        },
        round_number: 5,
        event_id: 49,
      },
      {
        partnerX: {
          id: 474,
        },
        partnerY: {
          id: 515,
        },
        round_number: 5,
        event_id: 49,
      },
      {
        partnerX: {
          id: 350,
        },
        partnerY: {
          id: 476,
        },
        round_number: 5,
        event_id: 49,
      },
      {
        partnerX: {
          id: 354,
        },
        partnerY: {
          id: 389,
        },
        round_number: 5,
        event_id: 49,
      },
      {
        partnerX: {
          id: 350,
        },
        partnerY: {
          id: 485,
        },
        round_number: 6,
        event_id: 49,
      },
      {
        partnerX: {
          id: 463,
        },
        partnerY: {
          id: 476,
        },
        round_number: 6,
        event_id: 49,
      },
      {
        partnerX: {
          id: 457,
        },
        partnerY: {
          id: 52,
        },
        round_number: 6,
        event_id: 49,
      },
      {
        partnerX: {
          id: 254,
        },
        partnerY: {
          id: 474,
        },
        round_number: 6,
        event_id: 49,
      },
      {
        partnerX: {
          id: 371,
        },
        partnerY: {
          id: 498,
        },
        round_number: 6,
        event_id: 49,
      },
      {
        partnerX: {
          id: 115,
        },
        partnerY: {
          id: 468,
        },
        round_number: 6,
        event_id: 49,
      },
      {
        partnerX: {
          id: 484,
        },
        partnerY: {
          id: 506,
        },
        round_number: 6,
        event_id: 49,
      },
      {
        partnerX: {
          id: 335,
        },
        partnerY: {
          id: 472,
        },
        round_number: 6,
        event_id: 49,
      },
      {
        partnerX: {
          id: 128,
        },
        partnerY: {
          id: 297,
        },
        round_number: 6,
        event_id: 49,
      },
      {
        partnerX: {
          id: 458,
        },
        partnerY: {
          id: 516,
        },
        round_number: 6,
        event_id: 49,
      },
      {
        partnerX: {
          id: 379,
        },
        partnerY: {
          id: 488,
        },
        round_number: 6,
        event_id: 49,
      },
      {
        partnerX: {
          id: 364,
        },
        partnerY: {
          id: 391,
        },
        round_number: 6,
        event_id: 49,
      },
      {
        partnerX: {
          id: 397,
        },
        partnerY: {
          id: 458,
        },
        round_number: 7,
        event_id: 49,
      },
      {
        partnerX: {
          id: 225,
        },
        partnerY: {
          id: 353,
        },
        round_number: 6,
        event_id: 49,
      },
      {
        partnerX: {
          id: 413,
        },
        partnerY: {
          id: 8,
        },
        round_number: 6,
        event_id: 49,
      },
      {
        partnerX: {
          id: 492,
        },
        partnerY: {
          id: 503,
        },
        round_number: 6,
        event_id: 49,
      },
      {
        partnerX: {
          id: 335,
        },
        partnerY: {
          id: 495,
        },
        round_number: 7,
        event_id: 49,
      },
      {
        partnerX: {
          id: 297,
        },
        partnerY: {
          id: 468,
        },
        round_number: 7,
        event_id: 49,
      },
      {
        partnerX: {
          id: 348,
        },
        partnerY: {
          id: 488,
        },
        round_number: 7,
        event_id: 49,
      },
      {
        partnerX: {
          id: 500,
        },
        partnerY: {
          id: 503,
        },
        round_number: 7,
        event_id: 49,
      },
      {
        partnerX: {
          id: 509,
        },
        partnerY: {
          id: 8,
        },
        round_number: 7,
        event_id: 49,
      },
      {
        partnerX: {
          id: 391,
        },
        partnerY: {
          id: 463,
        },
        round_number: 7,
        event_id: 49,
      },
      {
        partnerX: {
          id: 354,
        },
        partnerY: {
          id: 52,
        },
        round_number: 7,
        event_id: 49,
      },
      {
        partnerX: {
          id: 476,
        },
        partnerY: {
          id: 485,
        },
        round_number: 7,
        event_id: 49,
      },
      {
        partnerX: {
          id: 371,
        },
        partnerY: {
          id: 520,
        },
        round_number: 7,
        event_id: 49,
      },
      {
        partnerX: {
          id: 416,
        },
        partnerY: {
          id: 457,
        },
        round_number: 7,
        event_id: 49,
      },
      {
        partnerX: {
          id: 413,
        },
        partnerY: {
          id: 470,
        },
        round_number: 7,
        event_id: 49,
      },
      {
        partnerX: {
          id: 362,
        },
        partnerY: {
          id: 389,
        },
        round_number: 7,
        event_id: 49,
      },
      {
        partnerX: {
          id: 34,
        },
        partnerY: {
          id: 457,
        },
        round_number: 10,
        event_id: 49,
      },
      {
        partnerX: {
          id: 362,
        },
        partnerY: {
          id: 468,
        },
        round_number: 10,
        event_id: 49,
      },
      {
        partnerX: {
          id: 12,
        },
        partnerY: {
          id: 350,
        },
        round_number: 7,
        event_id: 49,
      },
      {
        partnerX: {
          id: 225,
        },
        partnerY: {
          id: 364,
        },
        round_number: 7,
        event_id: 49,
      },
      {
        partnerX: {
          id: 465,
        },
        partnerY: {
          id: 516,
        },
        round_number: 7,
        event_id: 49,
      },
      {
        partnerX: {
          id: 115,
        },
        partnerY: {
          id: 481,
        },
        round_number: 7,
        event_id: 49,
      },
      {
        partnerX: {
          id: 353,
        },
        partnerY: {
          id: 515,
        },
        round_number: 7,
        event_id: 49,
      },
      {
        partnerX: {
          id: 389,
        },
        partnerY: {
          id: 457,
        },
        round_number: 9,
        event_id: 49,
      },
      {
        partnerX: {
          id: 371,
        },
        partnerY: {
          id: 514,
        },
        round_number: 8,
        event_id: 49,
      },
      {
        partnerX: {
          id: 364,
        },
        partnerY: {
          id: 463,
        },
        round_number: 10,
        event_id: 49,
      },
      {
        partnerX: {
          id: 335,
        },
        partnerY: {
          id: 458,
        },
        round_number: 8,
        event_id: 49,
      },
      {
        partnerX: {
          id: 348,
        },
        partnerY: {
          id: 391,
        },
        round_number: 9,
        event_id: 49,
      },
      {
        partnerX: {
          id: 476,
        },
        partnerY: {
          id: 514,
        },
        round_number: 9,
        event_id: 49,
      },
      {
        partnerX: {
          id: 488,
        },
        partnerY: {
          id: 504,
        },
        round_number: 10,
        event_id: 49,
      },
      {
        partnerX: {
          id: 348,
        },
        partnerY: {
          id: 476,
        },
        round_number: 8,
        event_id: 49,
      },
      {
        partnerX: {
          id: 354,
        },
        partnerY: {
          id: 458,
        },
        round_number: 10,
        event_id: 49,
      },
      {
        partnerX: {
          id: 225,
        },
        partnerY: {
          id: 389,
        },
        round_number: 10,
        event_id: 49,
      },
      {
        partnerX: {
          id: 474,
        },
        partnerY: {
          id: 500,
        },
        round_number: 9,
        event_id: 49,
      },
      {
        partnerX: {
          id: 34,
        },
        partnerY: {
          id: 470,
        },
        round_number: 9,
        event_id: 49,
      },
      {
        partnerX: {
          id: 362,
        },
        partnerY: {
          id: 516,
        },
        round_number: 8,
        event_id: 49,
      },
      {
        partnerX: {
          id: 364,
        },
        partnerY: {
          id: 495,
        },
        round_number: 8,
        event_id: 49,
      },
      {
        partnerX: {
          id: 350,
        },
        partnerY: {
          id: 481,
        },
        round_number: 8,
        event_id: 49,
      },
      {
        partnerX: {
          id: 353,
        },
        partnerY: {
          id: 457,
        },
        round_number: 8,
        event_id: 49,
      },
      {
        partnerX: {
          id: 12,
        },
        partnerY: {
          id: 463,
        },
        round_number: 8,
        event_id: 49,
      },
      {
        partnerX: {
          id: 416,
        },
        partnerY: {
          id: 516,
        },
        round_number: 9,
        event_id: 49,
      },
      {
        partnerX: {
          id: 397,
        },
        partnerY: {
          id: 474,
        },
        round_number: 8,
        event_id: 49,
      },
      {
        partnerX: {
          id: 350,
        },
        partnerY: {
          id: 468,
        },
        round_number: 9,
        event_id: 49,
      },
      {
        partnerX: {
          id: 297,
        },
        partnerY: {
          id: 52,
        },
        round_number: 8,
        event_id: 49,
      },
      {
        partnerX: {
          id: 12,
        },
        partnerY: {
          id: 506,
        },
        round_number: 9,
        event_id: 49,
      },
      {
        partnerX: {
          id: 34,
        },
        partnerY: {
          id: 506,
        },
        round_number: 8,
        event_id: 49,
      },
      {
        partnerX: {
          id: 504,
        },
        partnerY: {
          id: 8,
        },
        round_number: 8,
        event_id: 49,
      },
      {
        partnerX: {
          id: 413,
        },
        partnerY: {
          id: 515,
        },
        round_number: 8,
        event_id: 49,
      },
      {
        partnerX: {
          id: 225,
        },
        partnerY: {
          id: 509,
        },
        round_number: 8,
        event_id: 49,
      },
      {
        partnerX: {
          id: 115,
        },
        partnerY: {
          id: 389,
        },
        round_number: 8,
        event_id: 49,
      },
      {
        partnerX: {
          id: 498,
        },
        partnerY: {
          id: 520,
        },
        round_number: 8,
        event_id: 49,
      },
      {
        partnerX: {
          id: 508,
        },
        partnerY: {
          id: 533,
        },
        round_number: 1,
        event_id: 16,
      },
      {
        partnerX: {
          id: 514,
        },
        partnerY: {
          id: 52,
        },
        round_number: 10,
        event_id: 49,
      },
      {
        partnerX: {
          id: 342,
        },
        partnerY: {
          id: 532,
        },
        round_number: 1,
        event_id: 16,
      },
      {
        partnerX: {
          id: 335,
        },
        partnerY: {
          id: 348,
        },
        round_number: 10,
        event_id: 49,
      },
      {
        partnerX: {
          id: 353,
        },
        partnerY: {
          id: 488,
        },
        round_number: 9,
        event_id: 49,
      },
      {
        partnerX: {
          id: 472,
        },
        partnerY: {
          id: 504,
        },
        round_number: 9,
        event_id: 49,
      },
      {
        partnerX: {
          id: 371,
        },
        partnerY: {
          id: 8,
        },
        round_number: 9,
        event_id: 49,
      },
      {
        partnerX: {
          id: 115,
        },
        partnerY: {
          id: 515,
        },
        round_number: 9,
        event_id: 49,
      },
      {
        partnerX: {
          id: 52,
        },
        partnerY: {
          id: 520,
        },
        round_number: 9,
        event_id: 49,
      },
      {
        partnerX: {
          id: 335,
        },
        partnerY: {
          id: 364,
        },
        round_number: 9,
        event_id: 49,
      },
      {
        partnerX: {
          id: 379,
        },
        partnerY: {
          id: 458,
        },
        round_number: 9,
        event_id: 49,
      },
      {
        partnerX: {
          id: 362,
        },
        partnerY: {
          id: 481,
        },
        round_number: 9,
        event_id: 49,
      },
      {
        partnerX: {
          id: 503,
        },
        partnerY: {
          id: 8,
        },
        round_number: 10,
        event_id: 49,
      },
      {
        partnerX: {
          id: 297,
        },
        partnerY: {
          id: 520,
        },
        round_number: 10,
        event_id: 49,
      },
      {
        partnerX: {
          id: 286,
        },
        partnerY: {
          id: 381,
        },
        round_number: 1,
        event_id: 16,
      },
      {
        partnerX: {
          id: 350,
        },
        partnerY: {
          id: 470,
        },
        round_number: 10,
        event_id: 49,
      },
      {
        partnerX: {
          id: 371,
        },
        partnerY: {
          id: 472,
        },
        round_number: 10,
        event_id: 49,
      },
      {
        partnerX: {
          id: 254,
        },
        partnerY: {
          id: 397,
        },
        round_number: 10,
        event_id: 49,
      },
      {
        partnerX: {
          id: 506,
        },
        partnerY: {
          id: 516,
        },
        round_number: 10,
        event_id: 49,
      },
      {
        partnerX: {
          id: 12,
        },
        partnerY: {
          id: 379,
        },
        round_number: 10,
        event_id: 49,
      },
      {
        partnerX: {
          id: 481,
        },
        partnerY: {
          id: 500,
        },
        round_number: 10,
        event_id: 49,
      },
      {
        partnerX: {
          id: 476,
        },
        partnerY: {
          id: 509,
        },
        round_number: 10,
        event_id: 49,
      },
      {
        partnerX: {
          id: 495,
        },
        partnerY: {
          id: 515,
        },
        round_number: 10,
        event_id: 49,
      },
      {
        partnerX: {
          id: 391,
        },
        partnerY: {
          id: 474,
        },
        round_number: 10,
        event_id: 49,
      },
      {
        partnerX: {
          id: 532,
        },
        partnerY: {
          id: 534,
        },
        round_number: 2,
        event_id: 16,
      },
      {
        partnerX: {
          id: 508,
        },
        partnerY: {
          id: 70,
        },
        round_number: 2,
        event_id: 16,
      },
      {
        partnerX: {
          id: 497,
        },
        partnerY: {
          id: 533,
        },
        round_number: 2,
        event_id: 16,
      },
      {
        partnerX: {
          id: 380,
        },
        partnerY: {
          id: 531,
        },
        round_number: 3,
        event_id: 16,
      },
      {
        partnerX: {
          id: 292,
        },
        partnerY: {
          id: 497,
        },
        round_number: 3,
        event_id: 16,
      },
      {
        partnerX: {
          id: 142,
        },
        partnerY: {
          id: 534,
        },
        round_number: 3,
        event_id: 16,
      },
      {
        partnerX: {
          id: 370,
        },
        partnerY: {
          id: 533,
        },
        round_number: 3,
        event_id: 16,
      },
      {
        partnerX: {
          id: 137,
        },
        partnerY: {
          id: 508,
        },
        round_number: 3,
        event_id: 16,
      },
      {
        partnerX: {
          id: 292,
        },
        partnerY: {
          id: 70,
        },
        round_number: 4,
        event_id: 16,
      },
      {
        partnerX: {
          id: 380,
        },
        partnerY: {
          id: 508,
        },
        round_number: 4,
        event_id: 16,
      },
      {
        partnerX: {
          id: 286,
        },
        partnerY: {
          id: 417,
        },
        round_number: 4,
        event_id: 16,
      },
      {
        partnerX: {
          id: 497,
        },
        partnerY: {
          id: 531,
        },
        round_number: 4,
        event_id: 16,
      },
      {
        partnerX: {
          id: 292,
        },
        partnerY: {
          id: 533,
        },
        round_number: 11,
        event_id: 16,
      },
      {
        partnerX: {
          id: 342,
        },
        partnerY: {
          id: 531,
        },
        round_number: 11,
        event_id: 16,
      },
      {
        partnerX: {
          id: 292,
        },
        partnerY: {
          id: 530,
        },
        round_number: 8,
        event_id: 16,
      },
      {
        partnerX: {
          id: 286,
        },
        partnerY: {
          id: 531,
        },
        round_number: 5,
        event_id: 16,
      },
      {
        partnerX: {
          id: 292,
        },
        partnerY: {
          id: 369,
        },
        round_number: 10,
        event_id: 16,
      },
      {
        partnerX: {
          id: 533,
        },
        partnerY: {
          id: 70,
        },
        round_number: 5,
        event_id: 16,
      },
      {
        partnerX: {
          id: 380,
        },
        partnerY: {
          id: 417,
        },
        round_number: 5,
        event_id: 16,
      },
      {
        partnerX: {
          id: 137,
        },
        partnerY: {
          id: 399,
        },
        round_number: 5,
        event_id: 16,
      },
      {
        partnerX: {
          id: 142,
        },
        partnerY: {
          id: 508,
        },
        round_number: 8,
        event_id: 16,
      },
      {
        partnerX: {
          id: 370,
        },
        partnerY: {
          id: 497,
        },
        round_number: 5,
        event_id: 16,
      },
      {
        partnerX: {
          id: 292,
        },
        partnerY: {
          id: 532,
        },
        round_number: 5,
        event_id: 16,
      },
      {
        partnerX: {
          id: 142,
        },
        partnerY: {
          id: 369,
        },
        round_number: 5,
        event_id: 16,
      },
      {
        partnerX: {
          id: 532,
        },
        partnerY: {
          id: 536,
        },
        round_number: 8,
        event_id: 16,
      },
      {
        partnerX: {
          id: 342,
        },
        partnerY: {
          id: 70,
        },
        round_number: 8,
        event_id: 16,
      },
      {
        partnerX: {
          id: 531,
        },
        partnerY: {
          id: 533,
        },
        round_number: 6,
        event_id: 16,
      },
      {
        partnerX: {
          id: 534,
        },
        partnerY: {
          id: 70,
        },
        round_number: 6,
        event_id: 16,
      },
      {
        partnerX: {
          id: 342,
        },
        partnerY: {
          id: 381,
        },
        round_number: 6,
        event_id: 16,
      },
      {
        partnerX: {
          id: 137,
        },
        partnerY: {
          id: 286,
        },
        round_number: 6,
        event_id: 16,
      },
      {
        partnerX: {
          id: 292,
        },
        partnerY: {
          id: 380,
        },
        round_number: 6,
        event_id: 16,
      },
      {
        partnerX: {
          id: 142,
        },
        partnerY: {
          id: 530,
        },
        round_number: 6,
        event_id: 16,
      },
      {
        partnerX: {
          id: 417,
        },
        partnerY: {
          id: 508,
        },
        round_number: 6,
        event_id: 16,
      },
      {
        partnerX: {
          id: 531,
        },
        partnerY: {
          id: 534,
        },
        round_number: 7,
        event_id: 16,
      },
      {
        partnerX: {
          id: 137,
        },
        partnerY: {
          id: 536,
        },
        round_number: 7,
        event_id: 16,
      },
      {
        partnerX: {
          id: 286,
        },
        partnerY: {
          id: 532,
        },
        round_number: 7,
        event_id: 16,
      },
      {
        partnerX: {
          id: 292,
        },
        partnerY: {
          id: 381,
        },
        round_number: 7,
        event_id: 16,
      },
      {
        partnerX: {
          id: 380,
        },
        partnerY: {
          id: 497,
        },
        round_number: 7,
        event_id: 16,
      },
      {
        partnerX: {
          id: 508,
        },
        partnerY: {
          id: 530,
        },
        round_number: 7,
        event_id: 16,
      },
      {
        partnerX: {
          id: 381,
        },
        partnerY: {
          id: 70,
        },
        round_number: 10,
        event_id: 16,
      },
      {
        partnerX: {
          id: 381,
        },
        partnerY: {
          id: 534,
        },
        round_number: 11,
        event_id: 16,
      },
      {
        partnerX: {
          id: 142,
        },
        partnerY: {
          id: 380,
        },
        round_number: 10,
        event_id: 16,
      },
      {
        partnerX: {
          id: 137,
        },
        partnerY: {
          id: 531,
        },
        round_number: 10,
        event_id: 16,
      },
      {
        partnerX: {
          id: 531,
        },
        partnerY: {
          id: 532,
        },
        round_number: 9,
        event_id: 16,
      },
      {
        partnerX: {
          id: 286,
        },
        partnerY: {
          id: 534,
        },
        round_number: 10,
        event_id: 16,
      },
      {
        partnerX: {
          id: 497,
        },
        partnerY: {
          id: 508,
        },
        round_number: 10,
        event_id: 16,
      },
      {
        partnerX: {
          id: 370,
        },
        partnerY: {
          id: 70,
        },
        round_number: 9,
        event_id: 16,
      },
      {
        partnerX: {
          id: 292,
        },
        partnerY: {
          id: 534,
        },
        round_number: 9,
        event_id: 16,
      },
      {
        partnerX: {
          id: 380,
        },
        partnerY: {
          id: 536,
        },
        round_number: 9,
        event_id: 16,
      },
      {
        partnerX: {
          id: 399,
        },
        partnerY: {
          id: 508,
        },
        round_number: 9,
        event_id: 16,
      },
      {
        partnerX: {
          id: 286,
        },
        partnerY: {
          id: 530,
        },
        round_number: 9,
        event_id: 16,
      },
      {
        partnerX: {
          id: 142,
        },
        partnerY: {
          id: 533,
        },
        round_number: 9,
        event_id: 16,
      },
      {
        partnerX: {
          id: 142,
        },
        partnerY: {
          id: 536,
        },
        round_number: 11,
        event_id: 16,
      },
      {
        partnerX: {
          id: 292,
        },
        partnerY: {
          id: 531,
        },
        round_number: 12,
        event_id: 16,
      },
      {
        partnerX: {
          id: 399,
        },
        partnerY: {
          id: 532,
        },
        round_number: 11,
        event_id: 16,
      },
      {
        partnerX: {
          id: 370,
        },
        partnerY: {
          id: 508,
        },
        round_number: 11,
        event_id: 16,
      },
      {
        partnerX: {
          id: 381,
        },
        partnerY: {
          id: 533,
        },
        round_number: 12,
        event_id: 16,
      },
      {
        partnerX: {
          id: 142,
        },
        partnerY: {
          id: 497,
        },
        round_number: 12,
        event_id: 16,
      },
      {
        partnerX: {
          id: 530,
        },
        partnerY: {
          id: 531,
        },
        round_number: 13,
        event_id: 16,
      },
      {
        partnerX: {
          id: 142,
        },
        partnerY: {
          id: 292,
        },
        round_number: 13,
        event_id: 16,
      },
      {
        partnerX: {
          id: 380,
        },
        partnerY: {
          id: 70,
        },
        round_number: 13,
        event_id: 16,
      },
      {
        partnerX: {
          id: 142,
        },
        partnerY: {
          id: 70,
        },
        round_number: 14,
        event_id: 16,
      },
      {
        partnerX: {
          id: 530,
        },
        partnerY: {
          id: 532,
        },
        round_number: 14,
        event_id: 16,
      },
      {
        partnerX: {
          id: 342,
        },
        partnerY: {
          id: 399,
        },
        round_number: 14,
        event_id: 16,
      },
      {
        partnerX: {
          id: 286,
        },
        partnerY: {
          id: 380,
        },
        round_number: 14,
        event_id: 16,
      },
      {
        partnerX: {
          id: 381,
        },
        partnerY: {
          id: 508,
        },
        round_number: 19,
        event_id: 16,
      },
      {
        partnerX: {
          id: 137,
        },
        partnerY: {
          id: 70,
        },
        round_number: 15,
        event_id: 16,
      },
      {
        partnerX: {
          id: 530,
        },
        partnerY: {
          id: 70,
        },
        round_number: 19,
        event_id: 16,
      },
      {
        partnerX: {
          id: 286,
        },
        partnerY: {
          id: 536,
        },
        round_number: 19,
        event_id: 16,
      },
      {
        partnerX: {
          id: 142,
        },
        partnerY: {
          id: 532,
        },
        round_number: 15,
        event_id: 16,
      },
      {
        partnerX: {
          id: 380,
        },
        partnerY: {
          id: 530,
        },
        round_number: 15,
        event_id: 16,
      },
      {
        partnerX: {
          id: 531,
        },
        partnerY: {
          id: 536,
        },
        round_number: 15,
        event_id: 16,
      },
      {
        partnerX: {
          id: 399,
        },
        partnerY: {
          id: 536,
        },
        round_number: 16,
        event_id: 16,
      },
      {
        partnerX: {
          id: 137,
        },
        partnerY: {
          id: 292,
        },
        round_number: 16,
        event_id: 16,
      },
      {
        partnerX: {
          id: 142,
        },
        partnerY: {
          id: 531,
        },
        round_number: 16,
        event_id: 16,
      },
      {
        partnerX: {
          id: 380,
        },
        partnerY: {
          id: 532,
        },
        round_number: 16,
        event_id: 16,
      },
      {
        partnerX: {
          id: 381,
        },
        partnerY: {
          id: 399,
        },
        round_number: 17,
        event_id: 16,
      },
      {
        partnerX: {
          id: 533,
        },
        partnerY: {
          id: 536,
        },
        round_number: 17,
        event_id: 16,
      },
      {
        partnerX: {
          id: 137,
        },
        partnerY: {
          id: 532,
        },
        round_number: 17,
        event_id: 16,
      },
      {
        partnerX: {
          id: 292,
        },
        partnerY: {
          id: 508,
        },
        round_number: 17,
        event_id: 16,
      },
      {
        partnerX: {
          id: 342,
        },
        partnerY: {
          id: 380,
        },
        round_number: 17,
        event_id: 16,
      },
      {
        partnerX: {
          id: 142,
        },
        partnerY: {
          id: 381,
        },
        round_number: 18,
        event_id: 16,
      },
      {
        partnerX: {
          id: 508,
        },
        partnerY: {
          id: 531,
        },
        round_number: 18,
        event_id: 16,
      },
      {
        partnerX: {
          id: 380,
        },
        partnerY: {
          id: 533,
        },
        round_number: 18,
        event_id: 16,
      },
      {
        partnerX: {
          id: 530,
        },
        partnerY: {
          id: 536,
        },
        round_number: 18,
        event_id: 16,
      },
      {
        partnerX: {
          id: 32,
        },
        partnerY: {
          id: 554,
        },
        round_number: 3,
        event_id: 31,
      },
      {
        partnerX: {
          id: 532,
        },
        partnerY: {
          id: 533,
        },
        round_number: 19,
        event_id: 16,
      },
      {
        partnerX: {
          id: 183,
        },
        partnerY: {
          id: 555,
        },
        round_number: 3,
        event_id: 31,
      },
      {
        partnerX: {
          id: 399,
        },
        partnerY: {
          id: 531,
        },
        round_number: 20,
        event_id: 16,
      },
      {
        partnerX: {
          id: 380,
        },
        partnerY: {
          id: 381,
        },
        round_number: 20,
        event_id: 16,
      },
      {
        partnerX: {
          id: 532,
        },
        partnerY: {
          id: 70,
        },
        round_number: 20,
        event_id: 16,
      },
      {
        partnerX: {
          id: 508,
        },
        partnerY: {
          id: 536,
        },
        round_number: 20,
        event_id: 16,
      },
      {
        partnerX: {
          id: 369,
        },
        partnerY: {
          id: 530,
        },
        round_number: 20,
        event_id: 16,
      },
      {
        partnerX: {
          id: 554,
        },
        partnerY: {
          id: 555,
        },
        round_number: 1,
        event_id: 31,
      },
      {
        partnerX: {
          id: 32,
        },
        partnerY: {
          id: 555,
        },
        round_number: 2,
        event_id: 31,
      },
      {
        partnerX: {
          id: 119,
        },
        partnerY: {
          id: 1769,
        },
        round_number: 3,
        event_id: 119,
      },
      {
        partnerX: {
          id: 12,
        },
        partnerY: {
          id: 591,
        },
        round_number: 7,
        event_id: 56,
      },
      {
        partnerX: {
          id: 119,
        },
        partnerY: {
          id: 598,
        },
        round_number: 7,
        event_id: 56,
      },
      {
        partnerX: {
          id: 1208,
        },
        partnerY: {
          id: 8,
        },
        round_number: 3,
        event_id: 119,
      },
      {
        partnerX: {
          id: 297,
        },
        partnerY: {
          id: 593,
        },
        round_number: 7,
        event_id: 56,
      },
      {
        partnerX: {
          id: 513,
        },
        partnerY: {
          id: 581,
        },
        round_number: 7,
        event_id: 56,
      },
      {
        partnerX: {
          id: 1208,
        },
        partnerY: {
          id: 1698,
        },
        round_number: 5,
        event_id: 119,
      },
      {
        partnerX: {
          id: 1071,
        },
        partnerY: {
          id: 1757,
        },
        round_number: 6,
        event_id: 119,
      },
      {
        partnerX: {
          id: 1769,
        },
        partnerY: {
          id: 1808,
        },
        round_number: 6,
        event_id: 119,
      },
      {
        partnerX: {
          id: 119,
        },
        partnerY: {
          id: 1698,
        },
        round_number: 6,
        event_id: 119,
      },
      {
        partnerX: {
          id: 12,
        },
        partnerY: {
          id: 1784,
        },
        round_number: 6,
        event_id: 119,
      },
      {
        partnerX: {
          id: 1805,
        },
        partnerY: {
          id: 8,
        },
        round_number: 6,
        event_id: 119,
      },
      {
        partnerX: {
          id: 1629,
        },
        partnerY: {
          id: 1759,
        },
        round_number: 6,
        event_id: 119,
      },
      {
        partnerX: {
          id: 1925,
        },
        partnerY: {
          id: 1958,
        },
        round_number: 8,
        event_id: 131,
      },
      {
        partnerX: {
          id: 1656,
        },
        partnerY: {
          id: 1837,
        },
        round_number: 8,
        event_id: 131,
      },
      {
        partnerX: {
          id: 12,
        },
        partnerY: {
          id: 1804,
        },
        round_number: 3,
        event_id: 119,
      },
      {
        partnerX: {
          id: 1071,
        },
        partnerY: {
          id: 1933,
        },
        round_number: 8,
        event_id: 131,
      },
      {
        partnerX: {
          id: 115,
        },
        partnerY: {
          id: 1910,
        },
        round_number: 8,
        event_id: 131,
      },
      {
        partnerX: {
          id: 1071,
        },
        partnerY: {
          id: 1784,
        },
        round_number: 3,
        event_id: 119,
      },
      {
        partnerX: {
          id: 568,
        },
        partnerY: {
          id: 598,
        },
        round_number: 4,
        event_id: 56,
      },
      {
        partnerX: {
          id: 225,
        },
        partnerY: {
          id: 579,
        },
        round_number: 1,
        event_id: 56,
      },
      {
        partnerX: {
          id: 546,
        },
        partnerY: {
          id: 591,
        },
        round_number: 4,
        event_id: 56,
      },
      {
        partnerX: {
          id: 586,
        },
        partnerY: {
          id: 598,
        },
        round_number: 1,
        event_id: 56,
      },
      {
        partnerX: {
          id: 542,
        },
        partnerY: {
          id: 590,
        },
        round_number: 1,
        event_id: 56,
      },
      {
        partnerX: {
          id: 548,
        },
        partnerY: {
          id: 8,
        },
        round_number: 1,
        event_id: 56,
      },
      {
        partnerX: {
          id: 12,
        },
        partnerY: {
          id: 596,
        },
        round_number: 1,
        event_id: 56,
      },
      {
        partnerX: {
          id: 591,
        },
        partnerY: {
          id: 598,
        },
        round_number: 2,
        event_id: 56,
      },
      {
        partnerX: {
          id: 12,
        },
        partnerY: {
          id: 586,
        },
        round_number: 4,
        event_id: 56,
      },
      {
        partnerX: {
          id: 542,
        },
        partnerY: {
          id: 579,
        },
        round_number: 4,
        event_id: 56,
      },
      {
        partnerX: {
          id: 579,
        },
        partnerY: {
          id: 590,
        },
        round_number: 2,
        event_id: 56,
      },
      {
        partnerX: {
          id: 12,
        },
        partnerY: {
          id: 8,
        },
        round_number: 2,
        event_id: 56,
      },
      {
        partnerX: {
          id: 587,
        },
        partnerY: {
          id: 593,
        },
        round_number: 2,
        event_id: 56,
      },
      {
        partnerX: {
          id: 319,
        },
        partnerY: {
          id: 581,
        },
        round_number: 2,
        event_id: 56,
      },
      {
        partnerX: {
          id: 588,
        },
        partnerY: {
          id: 597,
        },
        round_number: 1,
        event_id: 56,
      },
      {
        partnerX: {
          id: 539,
        },
        partnerY: {
          id: 596,
        },
        round_number: 2,
        event_id: 56,
      },
      {
        partnerX: {
          id: 319,
        },
        partnerY: {
          id: 597,
        },
        round_number: 4,
        event_id: 56,
      },
      {
        partnerX: {
          id: 297,
        },
        partnerY: {
          id: 596,
        },
        round_number: 4,
        event_id: 56,
      },
      {
        partnerX: {
          id: 587,
        },
        partnerY: {
          id: 590,
        },
        round_number: 4,
        event_id: 56,
      },
      {
        partnerX: {
          id: 593,
        },
        partnerY: {
          id: 595,
        },
        round_number: 4,
        event_id: 56,
      },
      {
        partnerX: {
          id: 119,
        },
        partnerY: {
          id: 8,
        },
        round_number: 4,
        event_id: 56,
      },
      {
        partnerX: {
          id: 586,
        },
        partnerY: {
          id: 590,
        },
        round_number: 3,
        event_id: 56,
      },
      {
        partnerX: {
          id: 597,
        },
        partnerY: {
          id: 8,
        },
        round_number: 3,
        event_id: 56,
      },
      {
        partnerX: {
          id: 557,
        },
        partnerY: {
          id: 579,
        },
        round_number: 3,
        event_id: 56,
      },
      {
        partnerX: {
          id: 119,
        },
        partnerY: {
          id: 319,
        },
        round_number: 3,
        event_id: 56,
      },
      {
        partnerX: {
          id: 587,
        },
        partnerY: {
          id: 591,
        },
        round_number: 3,
        event_id: 56,
      },
      {
        partnerX: {
          id: 12,
        },
        partnerY: {
          id: 593,
        },
        round_number: 3,
        event_id: 56,
      },
      {
        partnerX: {
          id: 557,
        },
        partnerY: {
          id: 588,
        },
        round_number: 4,
        event_id: 56,
      },
      {
        partnerX: {
          id: 568,
        },
        partnerY: {
          id: 595,
        },
        round_number: 3,
        event_id: 56,
      },
      {
        partnerX: {
          id: 1600,
        },
        partnerY: {
          id: 1826,
        },
        round_number: 3,
        event_id: 123,
      },
      {
        partnerX: {
          id: 539,
        },
        partnerY: {
          id: 586,
        },
        round_number: 7,
        event_id: 56,
      },
      {
        partnerX: {
          id: 590,
        },
        partnerY: {
          id: 596,
        },
        round_number: 7,
        event_id: 56,
      },
      {
        partnerX: {
          id: 546,
        },
        partnerY: {
          id: 595,
        },
        round_number: 7,
        event_id: 56,
      },
      {
        partnerX: {
          id: 119,
        },
        partnerY: {
          id: 593,
        },
        round_number: 8,
        event_id: 56,
      },
      {
        partnerX: {
          id: 581,
        },
        partnerY: {
          id: 597,
        },
        round_number: 8,
        event_id: 56,
      },
      {
        partnerX: {
          id: 1901,
        },
        partnerY: {
          id: 8,
        },
        round_number: 8,
        event_id: 131,
      },
      {
        partnerX: {
          id: 1686,
        },
        partnerY: {
          id: 1700,
        },
        round_number: 3,
        event_id: 123,
      },
      {
        partnerX: {
          id: 1071,
        },
        partnerY: {
          id: 12,
        },
        round_number: 4,
        event_id: 119,
      },
      {
        partnerX: {
          id: 579,
        },
        partnerY: {
          id: 591,
        },
        round_number: 9,
        event_id: 56,
      },
      {
        partnerX: {
          id: 1769,
        },
        partnerY: {
          id: 1804,
        },
        round_number: 4,
        event_id: 119,
      },
      {
        partnerX: {
          id: 1757,
        },
        partnerY: {
          id: 8,
        },
        round_number: 4,
        event_id: 119,
      },
      {
        partnerX: {
          id: 119,
        },
        partnerY: {
          id: 542,
        },
        round_number: 9,
        event_id: 56,
      },
      {
        partnerX: {
          id: 593,
        },
        partnerY: {
          id: 596,
        },
        round_number: 9,
        event_id: 56,
      },
      {
        partnerX: {
          id: 297,
        },
        partnerY: {
          id: 539,
        },
        round_number: 9,
        event_id: 56,
      },
      {
        partnerX: {
          id: 546,
        },
        partnerY: {
          id: 586,
        },
        round_number: 9,
        event_id: 56,
      },
      {
        partnerX: {
          id: 119,
        },
        partnerY: {
          id: 1759,
        },
        round_number: 4,
        event_id: 119,
      },
      {
        partnerX: {
          id: 557,
        },
        partnerY: {
          id: 8,
        },
        round_number: 9,
        event_id: 56,
      },
      {
        partnerX: {
          id: 1208,
        },
        partnerY: {
          id: 1629,
        },
        round_number: 4,
        event_id: 119,
      },
      {
        partnerX: {
          id: 568,
        },
        partnerY: {
          id: 581,
        },
        round_number: 9,
        event_id: 56,
      },
      {
        partnerX: {
          id: 12,
        },
        partnerY: {
          id: 598,
        },
        round_number: 9,
        event_id: 56,
      },
      {
        partnerX: {
          id: 587,
        },
        partnerY: {
          id: 588,
        },
        round_number: 9,
        event_id: 56,
      },
      {
        partnerX: {
          id: 319,
        },
        partnerY: {
          id: 590,
        },
        round_number: 9,
        event_id: 56,
      },
      {
        partnerX: {
          id: 513,
        },
        partnerY: {
          id: 600,
        },
        round_number: 9,
        event_id: 56,
      },
      {
        partnerX: {
          id: 595,
        },
        partnerY: {
          id: 597,
        },
        round_number: 9,
        event_id: 56,
      },
      {
        partnerX: {
          id: 1808,
        },
        partnerY: {
          id: 8,
        },
        round_number: 5,
        event_id: 119,
      },
      {
        partnerX: {
          id: 1071,
        },
        partnerY: {
          id: 1769,
        },
        round_number: 5,
        event_id: 119,
      },
      {
        partnerX: {
          id: 119,
        },
        partnerY: {
          id: 12,
        },
        round_number: 5,
        event_id: 119,
      },
      {
        partnerX: {
          id: 1655,
        },
        partnerY: {
          id: 1831,
        },
        round_number: 3,
        event_id: 123,
      },
      {
        partnerX: {
          id: 1682,
        },
        partnerY: {
          id: 1830,
        },
        round_number: 3,
        event_id: 123,
      },
      {
        partnerX: {
          id: 1681,
        },
        partnerY: {
          id: 1827,
        },
        round_number: 3,
        event_id: 123,
      },
      {
        partnerX: {
          id: 1905,
        },
        partnerY: {
          id: 550,
        },
        round_number: 8,
        event_id: 131,
      },
      {
        partnerX: {
          id: 1532,
        },
        partnerY: {
          id: 1901,
        },
        round_number: 9,
        event_id: 131,
      },
      {
        partnerX: {
          id: 115,
        },
        partnerY: {
          id: 1929,
        },
        round_number: 4,
        event_id: 129,
      },
      {
        partnerX: {
          id: 1656,
        },
        partnerY: {
          id: 1958,
        },
        round_number: 9,
        event_id: 131,
      },
      {
        partnerX: {
          id: 1629,
        },
        partnerY: {
          id: 1862,
        },
        round_number: 4,
        event_id: 129,
      },
      {
        partnerX: {
          id: 12,
        },
        partnerY: {
          id: 1910,
        },
        round_number: 9,
        event_id: 131,
      },
      {
        partnerX: {
          id: 1905,
        },
        partnerY: {
          id: 8,
        },
        round_number: 9,
        event_id: 131,
      },
      {
        partnerX: {
          id: 115,
        },
        partnerY: {
          id: 1933,
        },
        round_number: 9,
        event_id: 131,
      },
      {
        partnerX: {
          id: 1071,
        },
        partnerY: {
          id: 550,
        },
        round_number: 9,
        event_id: 131,
      },
      {
        partnerX: {
          id: 1837,
        },
        partnerY: {
          id: 1906,
        },
        round_number: 9,
        event_id: 131,
      },
      {
        partnerX: {
          id: 1628,
        },
        partnerY: {
          id: 513,
        },
        round_number: 4,
        event_id: 129,
      },
      {
        partnerX: {
          id: 1937,
        },
        partnerY: {
          id: 595,
        },
        round_number: 4,
        event_id: 129,
      },
      {
        partnerX: {
          id: 1725,
        },
        partnerY: {
          id: 8,
        },
        round_number: 4,
        event_id: 129,
      },
      {
        partnerX: {
          id: 1853,
        },
        partnerY: {
          id: 1939,
        },
        round_number: 4,
        event_id: 129,
      },
      {
        partnerX: {
          id: 1816,
        },
        partnerY: {
          id: 1857,
        },
        round_number: 4,
        event_id: 129,
      },
      {
        partnerX: {
          id: 34,
        },
        partnerY: {
          id: 385,
        },
        round_number: 4,
        event_id: 129,
      },
      {
        partnerX: {
          id: 319,
        },
        partnerY: {
          id: 586,
        },
        round_number: 10,
        event_id: 56,
      },
      {
        partnerX: {
          id: 1018,
        },
        partnerY: {
          id: 8,
        },
        round_number: 8,
        event_id: 102,
      },
      {
        partnerX: {
          id: 568,
        },
        partnerY: {
          id: 596,
        },
        round_number: 10,
        event_id: 56,
      },
      {
        partnerX: {
          id: 115,
        },
        partnerY: {
          id: 595,
        },
        round_number: 10,
        event_id: 102,
      },
      {
        partnerX: {
          id: 1024,
        },
        partnerY: {
          id: 986,
        },
        round_number: 8,
        event_id: 102,
      },
      {
        partnerX: {
          id: 936,
        },
        partnerY: {
          id: 956,
        },
        round_number: 1,
        event_id: 102,
      },
      {
        partnerX: {
          id: 297,
        },
        partnerY: {
          id: 542,
        },
        round_number: 10,
        event_id: 56,
      },
      {
        partnerX: {
          id: 1024,
        },
        partnerY: {
          id: 936,
        },
        round_number: 5,
        event_id: 102,
      },
      {
        partnerX: {
          id: 590,
        },
        partnerY: {
          id: 593,
        },
        round_number: 10,
        event_id: 56,
      },
      {
        partnerX: {
          id: 591,
        },
        partnerY: {
          id: 8,
        },
        round_number: 10,
        event_id: 56,
      },
      {
        partnerX: {
          id: 12,
        },
        partnerY: {
          id: 579,
        },
        round_number: 10,
        event_id: 56,
      },
      {
        partnerX: {
          id: 557,
        },
        partnerY: {
          id: 587,
        },
        round_number: 10,
        event_id: 56,
      },
      {
        partnerX: {
          id: 581,
        },
        partnerY: {
          id: 600,
        },
        round_number: 10,
        event_id: 56,
      },
      {
        partnerX: {
          id: 539,
        },
        partnerY: {
          id: 602,
        },
        round_number: 10,
        event_id: 56,
      },
      {
        partnerX: {
          id: 1208,
        },
        partnerY: {
          id: 34,
        },
        round_number: 1,
        event_id: 102,
      },
      {
        partnerX: {
          id: 12,
        },
        partnerY: {
          id: 8,
        },
        round_number: 1,
        event_id: 102,
      },
      {
        partnerX: {
          id: 1118,
        },
        partnerY: {
          id: 994,
        },
        round_number: 1,
        event_id: 102,
      },
      {
        partnerX: {
          id: 1210,
        },
        partnerY: {
          id: 975,
        },
        round_number: 1,
        event_id: 102,
      },
      {
        partnerX: {
          id: 1118,
        },
        partnerY: {
          id: 1208,
        },
        round_number: 7,
        event_id: 102,
      },
      {
        partnerX: {
          id: 1018,
        },
        partnerY: {
          id: 115,
        },
        round_number: 7,
        event_id: 102,
      },
      {
        partnerX: {
          id: 1027,
        },
        partnerY: {
          id: 1210,
        },
        round_number: 5,
        event_id: 102,
      },
      {
        partnerX: {
          id: 1018,
        },
        partnerY: {
          id: 1027,
        },
        round_number: 2,
        event_id: 102,
      },
      {
        partnerX: {
          id: 1208,
        },
        partnerY: {
          id: 617,
        },
        round_number: 5,
        event_id: 102,
      },
      {
        partnerX: {
          id: 115,
        },
        partnerY: {
          id: 956,
        },
        round_number: 2,
        event_id: 102,
      },
      {
        partnerX: {
          id: 12,
        },
        partnerY: {
          id: 34,
        },
        round_number: 2,
        event_id: 102,
      },
      {
        partnerX: {
          id: 8,
        },
        partnerY: {
          id: 994,
        },
        round_number: 2,
        event_id: 102,
      },
      {
        partnerX: {
          id: 1118,
        },
        partnerY: {
          id: 115,
        },
        round_number: 5,
        event_id: 102,
      },
      {
        partnerX: {
          id: 1118,
        },
        partnerY: {
          id: 610,
        },
        round_number: 2,
        event_id: 102,
      },
      {
        partnerX: {
          id: 612,
        },
        partnerY: {
          id: 936,
        },
        round_number: 2,
        event_id: 102,
      },
      {
        partnerX: {
          id: 1024,
        },
        partnerY: {
          id: 1210,
        },
        round_number: 2,
        event_id: 102,
      },
      {
        partnerX: {
          id: 1018,
        },
        partnerY: {
          id: 12,
        },
        round_number: 5,
        event_id: 102,
      },
      {
        partnerX: {
          id: 34,
        },
        partnerY: {
          id: 612,
        },
        round_number: 5,
        event_id: 102,
      },
      {
        partnerX: {
          id: 956,
        },
        partnerY: {
          id: 994,
        },
        round_number: 3,
        event_id: 102,
      },
      {
        partnerX: {
          id: 1027,
        },
        partnerY: {
          id: 12,
        },
        round_number: 3,
        event_id: 102,
      },
      {
        partnerX: {
          id: 115,
        },
        partnerY: {
          id: 1210,
        },
        round_number: 3,
        event_id: 102,
      },
      {
        partnerX: {
          id: 617,
        },
        partnerY: {
          id: 8,
        },
        round_number: 3,
        event_id: 102,
      },
      {
        partnerX: {
          id: 936,
        },
        partnerY: {
          id: 975,
        },
        round_number: 3,
        event_id: 102,
      },
      {
        partnerX: {
          id: 1024,
        },
        partnerY: {
          id: 612,
        },
        round_number: 3,
        event_id: 102,
      },
      {
        partnerX: {
          id: 12,
        },
        partnerY: {
          id: 617,
        },
        round_number: 4,
        event_id: 102,
      },
      {
        partnerX: {
          id: 1024,
        },
        partnerY: {
          id: 975,
        },
        round_number: 4,
        event_id: 102,
      },
      {
        partnerX: {
          id: 115,
        },
        partnerY: {
          id: 612,
        },
        round_number: 4,
        event_id: 102,
      },
      {
        partnerX: {
          id: 1027,
        },
        partnerY: {
          id: 34,
        },
        round_number: 4,
        event_id: 102,
      },
      {
        partnerX: {
          id: 12,
        },
        partnerY: {
          id: 612,
        },
        round_number: 7,
        event_id: 102,
      },
      {
        partnerX: {
          id: 115,
        },
        partnerY: {
          id: 1208,
        },
        round_number: 8,
        event_id: 102,
      },
      {
        partnerX: {
          id: 1210,
        },
        partnerY: {
          id: 936,
        },
        round_number: 7,
        event_id: 102,
      },
      {
        partnerX: {
          id: 1118,
        },
        partnerY: {
          id: 986,
        },
        round_number: 6,
        event_id: 102,
      },
      {
        partnerX: {
          id: 1210,
        },
        partnerY: {
          id: 8,
        },
        round_number: 6,
        event_id: 102,
      },
      {
        partnerX: {
          id: 1024,
        },
        partnerY: {
          id: 8,
        },
        round_number: 7,
        event_id: 102,
      },
      {
        partnerX: {
          id: 1018,
        },
        partnerY: {
          id: 34,
        },
        round_number: 10,
        event_id: 102,
      },
      {
        partnerX: {
          id: 34,
        },
        partnerY: {
          id: 617,
        },
        round_number: 6,
        event_id: 102,
      },
      {
        partnerX: {
          id: 115,
        },
        partnerY: {
          id: 975,
        },
        round_number: 6,
        event_id: 102,
      },
      {
        partnerX: {
          id: 1208,
        },
        partnerY: {
          id: 936,
        },
        round_number: 6,
        event_id: 102,
      },
      {
        partnerX: {
          id: 1024,
        },
        partnerY: {
          id: 610,
        },
        round_number: 6,
        event_id: 102,
      },
      {
        partnerX: {
          id: 12,
        },
        partnerY: {
          id: 956,
        },
        round_number: 6,
        event_id: 102,
      },
      {
        partnerX: {
          id: 1027,
        },
        partnerY: {
          id: 956,
        },
        round_number: 7,
        event_id: 102,
      },
      {
        partnerX: {
          id: 595,
        },
        partnerY: {
          id: 975,
        },
        round_number: 7,
        event_id: 102,
      },
      {
        partnerX: {
          id: 1210,
        },
        partnerY: {
          id: 617,
        },
        round_number: 8,
        event_id: 102,
      },
      {
        partnerX: {
          id: 12,
        },
        partnerY: {
          id: 936,
        },
        round_number: 8,
        event_id: 102,
      },
      {
        partnerX: {
          id: 1027,
        },
        partnerY: {
          id: 1118,
        },
        round_number: 8,
        event_id: 102,
      },
      {
        partnerX: {
          id: 595,
        },
        partnerY: {
          id: 956,
        },
        round_number: 8,
        event_id: 102,
      },
      {
        partnerX: {
          id: 34,
        },
        partnerY: {
          id: 975,
        },
        round_number: 8,
        event_id: 102,
      },
      {
        partnerX: {
          id: 1118,
        },
        partnerY: {
          id: 617,
        },
        round_number: 9,
        event_id: 102,
      },
      {
        partnerX: {
          id: 1027,
        },
        partnerY: {
          id: 610,
        },
        round_number: 9,
        event_id: 102,
      },
      {
        partnerX: {
          id: 1024,
        },
        partnerY: {
          id: 1208,
        },
        round_number: 10,
        event_id: 102,
      },
      {
        partnerX: {
          id: 1024,
        },
        partnerY: {
          id: 595,
        },
        round_number: 9,
        event_id: 102,
      },
      {
        partnerX: {
          id: 1208,
        },
        partnerY: {
          id: 8,
        },
        round_number: 9,
        event_id: 102,
      },
      {
        partnerX: {
          id: 1018,
        },
        partnerY: {
          id: 936,
        },
        round_number: 9,
        event_id: 102,
      },
      {
        partnerX: {
          id: 1210,
        },
        partnerY: {
          id: 956,
        },
        round_number: 9,
        event_id: 102,
      },
      {
        partnerX: {
          id: 612,
        },
        partnerY: {
          id: 975,
        },
        round_number: 9,
        event_id: 102,
      },
      {
        partnerX: {
          id: 12,
        },
        partnerY: {
          id: 986,
        },
        round_number: 9,
        event_id: 102,
      },
      {
        partnerX: {
          id: 612,
        },
        partnerY: {
          id: 956,
        },
        round_number: 10,
        event_id: 102,
      },
      {
        partnerX: {
          id: 12,
        },
        partnerY: {
          id: 1210,
        },
        round_number: 10,
        event_id: 102,
      },
      {
        partnerX: {
          id: 610,
        },
        partnerY: {
          id: 936,
        },
        round_number: 10,
        event_id: 102,
      },
      {
        partnerX: {
          id: 1027,
        },
        partnerY: {
          id: 8,
        },
        round_number: 10,
        event_id: 102,
      },
      {
        partnerX: {
          id: 1118,
        },
        partnerY: {
          id: 975,
        },
        round_number: 10,
        event_id: 102,
      },
      {
        partnerX: {
          id: 617,
        },
        partnerY: {
          id: 986,
        },
        round_number: 10,
        event_id: 102,
      },
      {
        partnerX: {
          id: 1192,
        },
        partnerY: {
          id: 297,
        },
        round_number: 1,
        event_id: 96,
      },
      {
        partnerX: {
          id: 1072,
        },
        partnerY: {
          id: 1079,
        },
        round_number: 1,
        event_id: 96,
      },
      {
        partnerX: {
          id: 1258,
        },
        partnerY: {
          id: 690,
        },
        round_number: 1,
        event_id: 96,
      },
      {
        partnerX: {
          id: 1029,
        },
        partnerY: {
          id: 588,
        },
        round_number: 8,
        event_id: 96,
      },
      {
        partnerX: {
          id: 1072,
        },
        partnerY: {
          id: 34,
        },
        round_number: 8,
        event_id: 96,
      },
      {
        partnerX: {
          id: 1029,
        },
        partnerY: {
          id: 1208,
        },
        round_number: 1,
        event_id: 96,
      },
      {
        partnerX: {
          id: 12,
        },
        partnerY: {
          id: 579,
        },
        round_number: 1,
        event_id: 96,
      },
      {
        partnerX: {
          id: 1030,
        },
        partnerY: {
          id: 588,
        },
        round_number: 1,
        event_id: 96,
      },
      {
        partnerX: {
          id: 1108,
        },
        partnerY: {
          id: 8,
        },
        round_number: 1,
        event_id: 96,
      },
      {
        partnerX: {
          id: 1030,
        },
        partnerY: {
          id: 1220,
        },
        round_number: 2,
        event_id: 96,
      },
      {
        partnerX: {
          id: 1071,
        },
        partnerY: {
          id: 12,
        },
        round_number: 8,
        event_id: 96,
      },
      {
        partnerX: {
          id: 1072,
        },
        partnerY: {
          id: 8,
        },
        round_number: 5,
        event_id: 96,
      },
      {
        partnerX: {
          id: 1079,
        },
        partnerY: {
          id: 371,
        },
        round_number: 2,
        event_id: 96,
      },
      {
        partnerX: {
          id: 1108,
        },
        partnerY: {
          id: 579,
        },
        round_number: 2,
        event_id: 96,
      },
      {
        partnerX: {
          id: 1029,
        },
        partnerY: {
          id: 690,
        },
        round_number: 2,
        event_id: 96,
      },
      {
        partnerX: {
          id: 297,
        },
        partnerY: {
          id: 539,
        },
        round_number: 2,
        event_id: 96,
      },
      {
        partnerX: {
          id: 34,
        },
        partnerY: {
          id: 8,
        },
        round_number: 2,
        event_id: 96,
      },
      {
        partnerX: {
          id: 1220,
        },
        partnerY: {
          id: 579,
        },
        round_number: 5,
        event_id: 96,
      },
      {
        partnerX: {
          id: 1079,
        },
        partnerY: {
          id: 1108,
        },
        round_number: 7,
        event_id: 96,
      },
      {
        partnerX: {
          id: 297,
        },
        partnerY: {
          id: 690,
        },
        round_number: 5,
        event_id: 96,
      },
      {
        partnerX: {
          id: 1208,
        },
        partnerY: {
          id: 371,
        },
        round_number: 5,
        event_id: 96,
      },
      {
        partnerX: {
          id: 1030,
        },
        partnerY: {
          id: 12,
        },
        round_number: 5,
        event_id: 96,
      },
      {
        partnerX: {
          id: 1208,
        },
        partnerY: {
          id: 34,
        },
        round_number: 3,
        event_id: 96,
      },
      {
        partnerX: {
          id: 1108,
        },
        partnerY: {
          id: 34,
        },
        round_number: 5,
        event_id: 96,
      },
      {
        partnerX: {
          id: 579,
        },
        partnerY: {
          id: 8,
        },
        round_number: 3,
        event_id: 96,
      },
      {
        partnerX: {
          id: 371,
        },
        partnerY: {
          id: 690,
        },
        round_number: 3,
        event_id: 96,
      },
      {
        partnerX: {
          id: 1071,
        },
        partnerY: {
          id: 1079,
        },
        round_number: 3,
        event_id: 96,
      },
      {
        partnerX: {
          id: 319,
        },
        partnerY: {
          id: 588,
        },
        round_number: 3,
        event_id: 96,
      },
      {
        partnerX: {
          id: 1072,
        },
        partnerY: {
          id: 1220,
        },
        round_number: 3,
        event_id: 96,
      },
      {
        partnerX: {
          id: 1031,
        },
        partnerY: {
          id: 1108,
        },
        round_number: 3,
        event_id: 96,
      },
      {
        partnerX: {
          id: 12,
        },
        partnerY: {
          id: 297,
        },
        round_number: 3,
        event_id: 96,
      },
      {
        partnerX: {
          id: 1031,
        },
        partnerY: {
          id: 588,
        },
        round_number: 5,
        event_id: 96,
      },
      {
        partnerX: {
          id: 1208,
        },
        partnerY: {
          id: 8,
        },
        round_number: 4,
        event_id: 96,
      },
      {
        partnerX: {
          id: 1071,
        },
        partnerY: {
          id: 1258,
        },
        round_number: 4,
        event_id: 96,
      },
      {
        partnerX: {
          id: 1192,
        },
        partnerY: {
          id: 34,
        },
        round_number: 4,
        event_id: 96,
      },
      {
        partnerX: {
          id: 1030,
        },
        partnerY: {
          id: 371,
        },
        round_number: 4,
        event_id: 96,
      },
      {
        partnerX: {
          id: 579,
        },
        partnerY: {
          id: 588,
        },
        round_number: 4,
        event_id: 96,
      },
      {
        partnerX: {
          id: 1108,
        },
        partnerY: {
          id: 12,
        },
        round_number: 4,
        event_id: 96,
      },
      {
        partnerX: {
          id: 1220,
        },
        partnerY: {
          id: 297,
        },
        round_number: 4,
        event_id: 96,
      },
      {
        partnerX: {
          id: 1108,
        },
        partnerY: {
          id: 1220,
        },
        round_number: 8,
        event_id: 96,
      },
      {
        partnerX: {
          id: 297,
        },
        partnerY: {
          id: 371,
        },
        round_number: 8,
        event_id: 96,
      },
      {
        partnerX: {
          id: 1629,
        },
        partnerY: {
          id: 1804,
        },
        round_number: 5,
        event_id: 119,
      },
      {
        partnerX: {
          id: 1072,
        },
        partnerY: {
          id: 690,
        },
        round_number: 7,
        event_id: 96,
      },
      {
        partnerX: {
          id: 1030,
        },
        partnerY: {
          id: 690,
        },
        round_number: 8,
        event_id: 96,
      },
      {
        partnerX: {
          id: 1208,
        },
        partnerY: {
          id: 690,
        },
        round_number: 6,
        event_id: 96,
      },
      {
        partnerX: {
          id: 1029,
        },
        partnerY: {
          id: 297,
        },
        round_number: 6,
        event_id: 96,
      },
      {
        partnerX: {
          id: 1079,
        },
        partnerY: {
          id: 539,
        },
        round_number: 6,
        event_id: 96,
      },
      {
        partnerX: {
          id: 1220,
        },
        partnerY: {
          id: 8,
        },
        round_number: 7,
        event_id: 96,
      },
      {
        partnerX: {
          id: 1071,
        },
        partnerY: {
          id: 579,
        },
        round_number: 6,
        event_id: 96,
      },
      {
        partnerX: {
          id: 319,
        },
        partnerY: {
          id: 579,
        },
        round_number: 7,
        event_id: 96,
      },
      {
        partnerX: {
          id: 12,
        },
        partnerY: {
          id: 1258,
        },
        round_number: 6,
        event_id: 96,
      },
      {
        partnerX: {
          id: 1220,
        },
        partnerY: {
          id: 34,
        },
        round_number: 6,
        event_id: 96,
      },
      {
        partnerX: {
          id: 1072,
        },
        partnerY: {
          id: 1108,
        },
        round_number: 6,
        event_id: 96,
      },
      {
        partnerX: {
          id: 468,
        },
        partnerY: {
          id: 588,
        },
        round_number: 7,
        event_id: 96,
      },
      {
        partnerX: {
          id: 1030,
        },
        partnerY: {
          id: 1192,
        },
        round_number: 7,
        event_id: 96,
      },
      {
        partnerX: {
          id: 1208,
        },
        partnerY: {
          id: 539,
        },
        round_number: 7,
        event_id: 96,
      },
      {
        partnerX: {
          id: 1015,
        },
        partnerY: {
          id: 297,
        },
        round_number: 7,
        event_id: 96,
      },
      {
        partnerX: {
          id: 34,
        },
        partnerY: {
          id: 371,
        },
        round_number: 7,
        event_id: 96,
      },
      {
        partnerX: {
          id: 1015,
        },
        partnerY: {
          id: 1208,
        },
        round_number: 8,
        event_id: 96,
      },
      {
        partnerX: {
          id: 1079,
        },
        partnerY: {
          id: 1192,
        },
        round_number: 8,
        event_id: 96,
      },
      {
        partnerX: {
          id: 1258,
        },
        partnerY: {
          id: 579,
        },
        round_number: 8,
        event_id: 96,
      },
      {
        partnerX: {
          id: 1312,
        },
        partnerY: {
          id: 1313,
        },
        round_number: 2,
        event_id: 103,
      },
      {
        partnerX: {
          id: 1293,
        },
        partnerY: {
          id: 1313,
        },
        round_number: 1,
        event_id: 103,
      },
      {
        partnerX: {
          id: 12,
        },
        partnerY: {
          id: 1312,
        },
        round_number: 1,
        event_id: 103,
      },
      {
        partnerX: {
          id: 1293,
        },
        partnerY: {
          id: 1312,
        },
        round_number: 3,
        event_id: 103,
      },
      {
        partnerX: {
          id: 12,
        },
        partnerY: {
          id: 1293,
        },
        round_number: 2,
        event_id: 103,
      },
      {
        partnerX: {
          id: 12,
        },
        partnerY: {
          id: 1313,
        },
        round_number: 3,
        event_id: 103,
      },
      {
        partnerX: {
          id: 12,
        },
        partnerY: {
          id: 1308,
        },
        round_number: 1,
        event_id: 97,
      },
      {
        partnerX: {
          id: 1115,
        },
        partnerY: {
          id: 1304,
        },
        round_number: 1,
        event_id: 97,
      },
      {
        partnerX: {
          id: 1188,
        },
        partnerY: {
          id: 981,
        },
        round_number: 1,
        event_id: 97,
      },
      {
        partnerX: {
          id: 1188,
        },
        partnerY: {
          id: 983,
        },
        round_number: 2,
        event_id: 97,
      },
      {
        partnerX: {
          id: 1304,
        },
        partnerY: {
          id: 1307,
        },
        round_number: 2,
        event_id: 97,
      },
      {
        partnerX: {
          id: 1115,
        },
        partnerY: {
          id: 12,
        },
        round_number: 2,
        event_id: 97,
      },
      {
        partnerX: {
          id: 1189,
        },
        partnerY: {
          id: 1308,
        },
        round_number: 2,
        event_id: 97,
      },
      {
        partnerX: {
          id: 1115,
        },
        partnerY: {
          id: 1320,
        },
        round_number: 3,
        event_id: 97,
      },
      {
        partnerX: {
          id: 12,
        },
        partnerY: {
          id: 1304,
        },
        round_number: 3,
        event_id: 97,
      },
      {
        partnerX: {
          id: 1188,
        },
        partnerY: {
          id: 249,
        },
        round_number: 3,
        event_id: 97,
      },
      {
        partnerX: {
          id: 1010,
        },
        partnerY: {
          id: 981,
        },
        round_number: 3,
        event_id: 97,
      },
      {
        partnerX: {
          id: 1307,
        },
        partnerY: {
          id: 1308,
        },
        round_number: 3,
        event_id: 97,
      },
      {
        partnerX: {
          id: 1010,
        },
        partnerY: {
          id: 1308,
        },
        round_number: 4,
        event_id: 97,
      },
      {
        partnerX: {
          id: 1115,
        },
        partnerY: {
          id: 999,
        },
        round_number: 8,
        event_id: 97,
      },
      {
        partnerX: {
          id: 1304,
        },
        partnerY: {
          id: 1379,
        },
        round_number: 4,
        event_id: 97,
      },
      {
        partnerX: {
          id: 1308,
        },
        partnerY: {
          id: 1318,
        },
        round_number: 8,
        event_id: 97,
      },
      {
        partnerX: {
          id: 1305,
        },
        partnerY: {
          id: 249,
        },
        round_number: 4,
        event_id: 97,
      },
      {
        partnerX: {
          id: 1188,
        },
        partnerY: {
          id: 999,
        },
        round_number: 4,
        event_id: 97,
      },
      {
        partnerX: {
          id: 1305,
        },
        partnerY: {
          id: 1379,
        },
        round_number: 8,
        event_id: 97,
      },
      {
        partnerX: {
          id: 1304,
        },
        partnerY: {
          id: 981,
        },
        round_number: 8,
        event_id: 97,
      },
      {
        partnerX: {
          id: 1010,
        },
        partnerY: {
          id: 249,
        },
        round_number: 5,
        event_id: 97,
      },
      {
        partnerX: {
          id: 1304,
        },
        partnerY: {
          id: 1308,
        },
        round_number: 5,
        event_id: 97,
      },
      {
        partnerX: {
          id: 1189,
        },
        partnerY: {
          id: 981,
        },
        round_number: 5,
        event_id: 97,
      },
      {
        partnerX: {
          id: 1188,
        },
        partnerY: {
          id: 1307,
        },
        round_number: 5,
        event_id: 97,
      },
      {
        partnerX: {
          id: 1115,
        },
        partnerY: {
          id: 1379,
        },
        round_number: 5,
        event_id: 97,
      },
      {
        partnerX: {
          id: 12,
        },
        partnerY: {
          id: 1318,
        },
        round_number: 5,
        event_id: 97,
      },
      {
        partnerX: {
          id: 12,
        },
        partnerY: {
          id: 999,
        },
        round_number: 6,
        event_id: 97,
      },
      {
        partnerX: {
          id: 1385,
        },
        partnerY: {
          id: 366,
        },
        round_number: 4,
        event_id: 57,
      },
      {
        partnerX: {
          id: 1304,
        },
        partnerY: {
          id: 1318,
        },
        round_number: 6,
        event_id: 97,
      },
      {
        partnerX: {
          id: 1188,
        },
        partnerY: {
          id: 1189,
        },
        round_number: 6,
        event_id: 97,
      },
      {
        partnerX: {
          id: 1307,
        },
        partnerY: {
          id: 1379,
        },
        round_number: 6,
        event_id: 97,
      },
      {
        partnerX: {
          id: 1305,
        },
        partnerY: {
          id: 1308,
        },
        round_number: 6,
        event_id: 97,
      },
      {
        partnerX: {
          id: 1248,
        },
        partnerY: {
          id: 1385,
        },
        round_number: 1,
        event_id: 57,
      },
      {
        partnerX: {
          id: 1396,
        },
        partnerY: {
          id: 1397,
        },
        round_number: 1,
        event_id: 57,
      },
      {
        partnerX: {
          id: 1394,
        },
        partnerY: {
          id: 365,
        },
        round_number: 1,
        event_id: 57,
      },
      {
        partnerX: {
          id: 1402,
        },
        partnerY: {
          id: 366,
        },
        round_number: 1,
        event_id: 57,
      },
      {
        partnerX: {
          id: 1115,
        },
        partnerY: {
          id: 1189,
        },
        round_number: 7,
        event_id: 97,
      },
      {
        partnerX: {
          id: 1320,
        },
        partnerY: {
          id: 249,
        },
        round_number: 7,
        event_id: 97,
      },
      {
        partnerX: {
          id: 1188,
        },
        partnerY: {
          id: 1304,
        },
        round_number: 7,
        event_id: 97,
      },
      {
        partnerX: {
          id: 12,
        },
        partnerY: {
          id: 1379,
        },
        round_number: 7,
        event_id: 97,
      },
      {
        partnerX: {
          id: 1396,
        },
        partnerY: {
          id: 1402,
        },
        round_number: 4,
        event_id: 57,
      },
      {
        partnerX: {
          id: 1404,
        },
        partnerY: {
          id: 1406,
        },
        round_number: 4,
        event_id: 57,
      },
      {
        partnerX: {
          id: 1189,
        },
        partnerY: {
          id: 249,
        },
        round_number: 8,
        event_id: 97,
      },
      {
        partnerX: {
          id: 12,
        },
        partnerY: {
          id: 1307,
        },
        round_number: 8,
        event_id: 97,
      },
      {
        partnerX: {
          id: 1404,
        },
        partnerY: {
          id: 366,
        },
        round_number: 2,
        event_id: 57,
      },
      {
        partnerX: {
          id: 1385,
        },
        partnerY: {
          id: 1397,
        },
        round_number: 2,
        event_id: 57,
      },
      {
        partnerX: {
          id: 1402,
        },
        partnerY: {
          id: 1406,
        },
        round_number: 2,
        event_id: 57,
      },
      {
        partnerX: {
          id: 365,
        },
        partnerY: {
          id: 51,
        },
        round_number: 2,
        event_id: 57,
      },
      {
        partnerX: {
          id: 1394,
        },
        partnerY: {
          id: 1396,
        },
        round_number: 2,
        event_id: 57,
      },
      {
        partnerX: {
          id: 1396,
        },
        partnerY: {
          id: 1406,
        },
        round_number: 3,
        event_id: 57,
      },
      {
        partnerX: {
          id: 1385,
        },
        partnerY: {
          id: 1404,
        },
        round_number: 3,
        event_id: 57,
      },
      {
        partnerX: {
          id: 1248,
        },
        partnerY: {
          id: 1402,
        },
        round_number: 3,
        event_id: 57,
      },
      {
        partnerX: {
          id: 1394,
        },
        partnerY: {
          id: 51,
        },
        round_number: 3,
        event_id: 57,
      },
      {
        partnerX: {
          id: 1396,
        },
        partnerY: {
          id: 366,
        },
        round_number: 6,
        event_id: 57,
      },
      {
        partnerX: {
          id: 1385,
        },
        partnerY: {
          id: 51,
        },
        round_number: 6,
        event_id: 57,
      },
      {
        partnerX: {
          id: 1071,
        },
        partnerY: {
          id: 1698,
        },
        round_number: 7,
        event_id: 119,
      },
      {
        partnerX: {
          id: 119,
        },
        partnerY: {
          id: 1784,
        },
        round_number: 7,
        event_id: 119,
      },
      {
        partnerX: {
          id: 1071,
        },
        partnerY: {
          id: 1824,
        },
        round_number: 3,
        event_id: 123,
      },
      {
        partnerX: {
          id: 629,
        },
        partnerY: {
          id: 893,
        },
        round_number: 1,
        event_id: 107,
      },
      {
        partnerX: {
          id: 1655,
        },
        partnerY: {
          id: 1823,
        },
        round_number: 4,
        event_id: 123,
      },
      {
        partnerX: {
          id: 1784,
        },
        partnerY: {
          id: 1808,
        },
        round_number: 8,
        event_id: 119,
      },
      {
        partnerX: {
          id: 119,
        },
        partnerY: {
          id: 1629,
        },
        round_number: 8,
        event_id: 119,
      },
      {
        partnerX: {
          id: 12,
        },
        partnerY: {
          id: 1757,
        },
        round_number: 8,
        event_id: 119,
      },
      {
        partnerX: {
          id: 1698,
        },
        partnerY: {
          id: 1769,
        },
        round_number: 8,
        event_id: 119,
      },
      {
        partnerX: {
          id: 1071,
        },
        partnerY: {
          id: 8,
        },
        round_number: 8,
        event_id: 119,
      },
      {
        partnerX: {
          id: 1685,
        },
        partnerY: {
          id: 1724,
        },
        round_number: 3,
        event_id: 123,
      },
      {
        partnerX: {
          id: 1653,
        },
        partnerY: {
          id: 1683,
        },
        round_number: 3,
        event_id: 123,
      },
      {
        partnerX: {
          id: 1724,
        },
        partnerY: {
          id: 1827,
        },
        round_number: 4,
        event_id: 123,
      },
      {
        partnerX: {
          id: 1685,
        },
        partnerY: {
          id: 1831,
        },
        round_number: 4,
        event_id: 123,
      },
      {
        partnerX: {
          id: 1682,
        },
        partnerY: {
          id: 1791,
        },
        round_number: 4,
        event_id: 123,
      },
      {
        partnerX: {
          id: 1157,
        },
        partnerY: {
          id: 1902,
        },
        round_number: 1,
        event_id: 136,
      },
      {
        partnerX: {
          id: 115,
        },
        partnerY: {
          id: 1628,
        },
        round_number: 1,
        event_id: 174,
      },
      {
        partnerX: {
          id: 1071,
        },
        partnerY: {
          id: 1599,
        },
        round_number: 4,
        event_id: 129,
      },
      {
        partnerX: {
          id: 1933,
        },
        partnerY: {
          id: 1963,
        },
        round_number: 4,
        event_id: 129,
      },
      {
        partnerX: {
          id: 1623,
        },
        partnerY: {
          id: 513,
        },
        round_number: 5,
        event_id: 129,
      },
      {
        partnerX: {
          id: 1578,
        },
        partnerY: {
          id: 385,
        },
        round_number: 5,
        event_id: 129,
      },
      {
        partnerX: {
          id: 1047,
        },
        partnerY: {
          id: 727,
        },
        round_number: 2,
        event_id: 107,
      },
      {
        partnerX: {
          id: 1362,
        },
        partnerY: {
          id: 1446,
        },
        round_number: 2,
        event_id: 107,
      },
      {
        partnerX: {
          id: 1391,
        },
        partnerY: {
          id: 1436,
        },
        round_number: 2,
        event_id: 107,
      },
      {
        partnerX: {
          id: 1377,
        },
        partnerY: {
          id: 1452,
        },
        round_number: 2,
        event_id: 107,
      },
      {
        partnerX: {
          id: 1111,
        },
        partnerY: {
          id: 931,
        },
        round_number: 2,
        event_id: 107,
      },
      {
        partnerX: {
          id: 1226,
        },
        partnerY: {
          id: 827,
        },
        round_number: 2,
        event_id: 107,
      },
      {
        partnerX: {
          id: 1063,
        },
        partnerY: {
          id: 948,
        },
        round_number: 2,
        event_id: 107,
      },
      {
        partnerX: {
          id: 751,
        },
        partnerY: {
          id: 946,
        },
        round_number: 2,
        event_id: 107,
      },
      {
        partnerX: {
          id: 614,
        },
        partnerY: {
          id: 659,
        },
        round_number: 2,
        event_id: 107,
      },
      {
        partnerX: {
          id: 722,
        },
        partnerY: {
          id: 816,
        },
        round_number: 2,
        event_id: 107,
      },
      {
        partnerX: {
          id: 1251,
        },
        partnerY: {
          id: 1263,
        },
        round_number: 2,
        event_id: 107,
      },
      {
        partnerX: {
          id: 1404,
        },
        partnerY: {
          id: 51,
        },
        round_number: 7,
        event_id: 57,
      },
      {
        partnerX: {
          id: 714,
        },
        partnerY: {
          id: 784,
        },
        round_number: 2,
        event_id: 107,
      },
      {
        partnerX: {
          id: 1071,
        },
        partnerY: {
          id: 969,
        },
        round_number: 2,
        event_id: 107,
      },
      {
        partnerX: {
          id: 632,
        },
        partnerY: {
          id: 791,
        },
        round_number: 2,
        event_id: 107,
      },
      {
        partnerX: {
          id: 1026,
        },
        partnerY: {
          id: 1133,
        },
        round_number: 2,
        event_id: 107,
      },
      {
        partnerX: {
          id: 854,
        },
        partnerY: {
          id: 947,
        },
        round_number: 2,
        event_id: 107,
      },
      {
        partnerX: {
          id: 1784,
        },
        partnerY: {
          id: 8,
        },
        round_number: 9,
        event_id: 119,
      },
      {
        partnerX: {
          id: 1071,
        },
        partnerY: {
          id: 1629,
        },
        round_number: 9,
        event_id: 119,
      },
      {
        partnerX: {
          id: 1681,
        },
        partnerY: {
          id: 1828,
        },
        round_number: 4,
        event_id: 123,
      },
      {
        partnerX: {
          id: 1902,
        },
        partnerY: {
          id: 1924,
        },
        round_number: 2,
        event_id: 136,
      },
      {
        partnerX: {
          id: 1914,
        },
        partnerY: {
          id: 1921,
        },
        round_number: 2,
        event_id: 136,
      },
      {
        partnerX: {
          id: 1086,
        },
        partnerY: {
          id: 1403,
        },
        round_number: 3,
        event_id: 107,
      },
      {
        partnerX: {
          id: 1221,
        },
        partnerY: {
          id: 967,
        },
        round_number: 3,
        event_id: 107,
      },
      {
        partnerX: {
          id: 1269,
        },
        partnerY: {
          id: 714,
        },
        round_number: 3,
        event_id: 107,
      },
      {
        partnerX: {
          id: 1286,
        },
        partnerY: {
          id: 902,
        },
        round_number: 3,
        event_id: 107,
      },
      {
        partnerX: {
          id: 12,
        },
        partnerY: {
          id: 1377,
        },
        round_number: 3,
        event_id: 107,
      },
      {
        partnerX: {
          id: 541,
        },
        partnerY: {
          id: 881,
        },
        round_number: 3,
        event_id: 107,
      },
      {
        partnerX: {
          id: 1358,
        },
        partnerY: {
          id: 614,
        },
        round_number: 3,
        event_id: 107,
      },
      {
        partnerX: {
          id: 1352,
        },
        partnerY: {
          id: 1436,
        },
        round_number: 3,
        event_id: 107,
      },
      {
        partnerX: {
          id: 1127,
        },
        partnerY: {
          id: 1449,
        },
        round_number: 3,
        event_id: 107,
      },
      {
        partnerX: {
          id: 1370,
        },
        partnerY: {
          id: 1447,
        },
        round_number: 3,
        event_id: 107,
      },
      {
        partnerX: {
          id: 1064,
        },
        partnerY: {
          id: 760,
        },
        round_number: 3,
        event_id: 107,
      },
      {
        partnerX: {
          id: 119,
        },
        partnerY: {
          id: 1808,
        },
        round_number: 9,
        event_id: 119,
      },
      {
        partnerX: {
          id: 1444,
        },
        partnerY: {
          id: 722,
        },
        round_number: 4,
        event_id: 107,
      },
      {
        partnerX: {
          id: 1251,
        },
        partnerY: {
          id: 894,
        },
        round_number: 4,
        event_id: 107,
      },
      {
        partnerX: {
          id: 1226,
        },
        partnerY: {
          id: 965,
        },
        round_number: 4,
        event_id: 107,
      },
      {
        partnerX: {
          id: 1194,
        },
        partnerY: {
          id: 783,
        },
        round_number: 4,
        event_id: 107,
      },
      {
        partnerX: {
          id: 1411,
        },
        partnerY: {
          id: 765,
        },
        round_number: 4,
        event_id: 107,
      },
      {
        partnerX: {
          id: 1082,
        },
        partnerY: {
          id: 831,
        },
        round_number: 4,
        event_id: 107,
      },
      {
        partnerX: {
          id: 1133,
        },
        partnerY: {
          id: 963,
        },
        round_number: 4,
        event_id: 107,
      },
      {
        partnerX: {
          id: 1415,
        },
        partnerY: {
          id: 1428,
        },
        round_number: 4,
        event_id: 107,
      },
      {
        partnerX: {
          id: 1108,
        },
        partnerY: {
          id: 647,
        },
        round_number: 4,
        event_id: 107,
      },
      {
        partnerX: {
          id: 1360,
        },
        partnerY: {
          id: 1426,
        },
        round_number: 4,
        event_id: 107,
      },
      {
        partnerX: {
          id: 1408,
        },
        partnerY: {
          id: 1457,
        },
        round_number: 4,
        event_id: 107,
      },
      {
        partnerX: {
          id: 1026,
        },
        partnerY: {
          id: 760,
        },
        round_number: 4,
        event_id: 107,
      },
      {
        partnerX: {
          id: 1396,
        },
        partnerY: {
          id: 51,
        },
        round_number: 9,
        event_id: 57,
      },
      {
        partnerX: {
          id: 12,
        },
        partnerY: {
          id: 1771,
        },
        round_number: 1,
        event_id: 126,
      },
      {
        partnerX: {
          id: 1397,
        },
        partnerY: {
          id: 1406,
        },
        round_number: 9,
        event_id: 57,
      },
      {
        partnerX: {
          id: 1385,
        },
        partnerY: {
          id: 1427,
        },
        round_number: 9,
        event_id: 57,
      },
      {
        partnerX: {
          id: 1064,
        },
        partnerY: {
          id: 816,
        },
        round_number: 4,
        event_id: 107,
      },
      {
        partnerX: {
          id: 931,
        },
        partnerY: {
          id: 946,
        },
        round_number: 4,
        event_id: 107,
      },
      {
        partnerX: {
          id: 1143,
        },
        partnerY: {
          id: 1417,
        },
        round_number: 4,
        event_id: 107,
      },
      {
        partnerX: {
          id: 1127,
        },
        partnerY: {
          id: 1172,
        },
        round_number: 4,
        event_id: 107,
      },
      {
        partnerX: {
          id: 1377,
        },
        partnerY: {
          id: 715,
        },
        round_number: 4,
        event_id: 107,
      },
      {
        partnerX: {
          id: 1298,
        },
        partnerY: {
          id: 1441,
        },
        round_number: 4,
        event_id: 107,
      },
      {
        partnerX: {
          id: 1063,
        },
        partnerY: {
          id: 738,
        },
        round_number: 4,
        event_id: 107,
      },
      {
        partnerX: {
          id: 812,
        },
        partnerY: {
          id: 881,
        },
        round_number: 4,
        event_id: 107,
      },
      {
        partnerX: {
          id: 1393,
        },
        partnerY: {
          id: 662,
        },
        round_number: 4,
        event_id: 107,
      },
      {
        partnerX: {
          id: 1221,
        },
        partnerY: {
          id: 969,
        },
        round_number: 4,
        event_id: 107,
      },
      {
        partnerX: {
          id: 1423,
        },
        partnerY: {
          id: 632,
        },
        round_number: 4,
        event_id: 107,
      },
      {
        partnerX: {
          id: 1042,
        },
        partnerY: {
          id: 1447,
        },
        round_number: 4,
        event_id: 107,
      },
      {
        partnerX: {
          id: 1939,
        },
        partnerY: {
          id: 34,
        },
        round_number: 5,
        event_id: 129,
      },
      {
        partnerX: {
          id: 1286,
        },
        partnerY: {
          id: 955,
        },
        round_number: 4,
        event_id: 107,
      },
      {
        partnerX: {
          id: 948,
        },
        partnerY: {
          id: 952,
        },
        round_number: 4,
        event_id: 107,
      },
      {
        partnerX: {
          id: 629,
        },
        partnerY: {
          id: 866,
        },
        round_number: 4,
        event_id: 107,
      },
      {
        partnerX: {
          id: 1771,
        },
        partnerY: {
          id: 1802,
        },
        round_number: 2,
        event_id: 126,
      },
      {
        partnerX: {
          id: 1071,
        },
        partnerY: {
          id: 12,
        },
        round_number: 2,
        event_id: 126,
      },
      {
        partnerX: {
          id: 1801,
        },
        partnerY: {
          id: 1826,
        },
        round_number: 4,
        event_id: 123,
      },
      {
        partnerX: {
          id: 1653,
        },
        partnerY: {
          id: 1824,
        },
        round_number: 4,
        event_id: 123,
      },
      {
        partnerX: {
          id: 1071,
        },
        partnerY: {
          id: 1830,
        },
        round_number: 4,
        event_id: 123,
      },
      {
        partnerX: {
          id: 1600,
        },
        partnerY: {
          id: 1686,
        },
        round_number: 4,
        event_id: 123,
      },
      {
        partnerX: {
          id: 12,
        },
        partnerY: {
          id: 513,
        },
        round_number: 1,
        event_id: 174,
      },
      {
        partnerX: {
          id: 12,
        },
        partnerY: {
          id: 1629,
        },
        round_number: 5,
        event_id: 129,
      },
      {
        partnerX: {
          id: 1937,
        },
        partnerY: {
          id: 8,
        },
        round_number: 5,
        event_id: 129,
      },
      {
        partnerX: {
          id: 115,
        },
        partnerY: {
          id: 12,
        },
        round_number: 2,
        event_id: 174,
      },
      {
        partnerX: {
          id: 1628,
        },
        partnerY: {
          id: 513,
        },
        round_number: 2,
        event_id: 174,
      },
      {
        partnerX: {
          id: 1599,
        },
        partnerY: {
          id: 1816,
        },
        round_number: 5,
        event_id: 129,
      },
      {
        partnerX: {
          id: 1857,
        },
        partnerY: {
          id: 595,
        },
        round_number: 5,
        event_id: 129,
      },
      {
        partnerX: {
          id: 115,
        },
        partnerY: {
          id: 1963,
        },
        round_number: 5,
        event_id: 129,
      },
      {
        partnerX: {
          id: 1536,
        },
        partnerY: {
          id: 1853,
        },
        round_number: 5,
        event_id: 129,
      },
      {
        partnerX: {
          id: 1441,
        },
        partnerY: {
          id: 969,
        },
        round_number: 5,
        event_id: 107,
      },
      {
        partnerX: {
          id: 1269,
        },
        partnerY: {
          id: 722,
        },
        round_number: 5,
        event_id: 107,
      },
      {
        partnerX: {
          id: 1130,
        },
        partnerY: {
          id: 1377,
        },
        round_number: 5,
        event_id: 107,
      },
      {
        partnerX: {
          id: 765,
        },
        partnerY: {
          id: 812,
        },
        round_number: 5,
        event_id: 107,
      },
      {
        partnerX: {
          id: 1208,
        },
        partnerY: {
          id: 1221,
        },
        round_number: 5,
        event_id: 107,
      },
      {
        partnerX: {
          id: 1101,
        },
        partnerY: {
          id: 738,
        },
        round_number: 5,
        event_id: 107,
      },
      {
        partnerX: {
          id: 115,
        },
        partnerY: {
          id: 939,
        },
        round_number: 5,
        event_id: 107,
      },
      {
        partnerX: {
          id: 1367,
        },
        partnerY: {
          id: 1436,
        },
        round_number: 5,
        event_id: 107,
      },
      {
        partnerX: {
          id: 1380,
        },
        partnerY: {
          id: 1390,
        },
        round_number: 5,
        event_id: 107,
      },
      {
        partnerX: {
          id: 1360,
        },
        partnerY: {
          id: 913,
        },
        round_number: 5,
        event_id: 107,
      },
      {
        partnerX: {
          id: 1141,
        },
        partnerY: {
          id: 1422,
        },
        round_number: 5,
        event_id: 107,
      },
      {
        partnerX: {
          id: 1127,
        },
        partnerY: {
          id: 1228,
        },
        round_number: 5,
        event_id: 107,
      },
      {
        partnerX: {
          id: 1133,
        },
        partnerY: {
          id: 1452,
        },
        round_number: 5,
        event_id: 107,
      },
      {
        partnerX: {
          id: 541,
        },
        partnerY: {
          id: 714,
        },
        round_number: 5,
        event_id: 107,
      },
      {
        partnerX: {
          id: 1339,
        },
        partnerY: {
          id: 876,
        },
        round_number: 5,
        event_id: 107,
      },
      {
        partnerX: {
          id: 1298,
        },
        partnerY: {
          id: 931,
        },
        round_number: 5,
        event_id: 107,
      },
      {
        partnerX: {
          id: 1430,
        },
        partnerY: {
          id: 1446,
        },
        round_number: 5,
        event_id: 107,
      },
      {
        partnerX: {
          id: 1416,
        },
        partnerY: {
          id: 1418,
        },
        round_number: 5,
        event_id: 107,
      },
      {
        partnerX: {
          id: 848,
        },
        partnerY: {
          id: 881,
        },
        round_number: 5,
        event_id: 107,
      },
      {
        partnerX: {
          id: 1071,
        },
        partnerY: {
          id: 1162,
        },
        round_number: 5,
        event_id: 107,
      },
      {
        partnerX: {
          id: 1286,
        },
        partnerY: {
          id: 827,
        },
        round_number: 5,
        event_id: 107,
      },
      {
        partnerX: {
          id: 1326,
        },
        partnerY: {
          id: 894,
        },
        round_number: 5,
        event_id: 107,
      },
      {
        partnerX: {
          id: 1401,
        },
        partnerY: {
          id: 632,
        },
        round_number: 5,
        event_id: 107,
      },
      {
        partnerX: {
          id: 1266,
        },
        partnerY: {
          id: 1393,
        },
        round_number: 5,
        event_id: 107,
      },
      {
        partnerX: {
          id: 866,
        },
        partnerY: {
          id: 967,
        },
        round_number: 5,
        event_id: 107,
      },
      {
        partnerX: {
          id: 1062,
        },
        partnerY: {
          id: 831,
        },
        round_number: 5,
        event_id: 107,
      },
      {
        partnerX: {
          id: 1044,
        },
        partnerY: {
          id: 1439,
        },
        round_number: 5,
        event_id: 107,
      },
      {
        partnerX: {
          id: 1082,
        },
        partnerY: {
          id: 1431,
        },
        round_number: 5,
        event_id: 107,
      },
      {
        partnerX: {
          id: 1047,
        },
        partnerY: {
          id: 1426,
        },
        round_number: 6,
        event_id: 107,
      },
      {
        partnerX: {
          id: 1421,
        },
        partnerY: {
          id: 751,
        },
        round_number: 6,
        event_id: 107,
      },
      {
        partnerX: {
          id: 1362,
        },
        partnerY: {
          id: 1436,
        },
        round_number: 6,
        event_id: 107,
      },
      {
        partnerX: {
          id: 1399,
        },
        partnerY: {
          id: 894,
        },
        round_number: 6,
        event_id: 107,
      },
      {
        partnerX: {
          id: 12,
        },
        partnerY: {
          id: 1709,
        },
        round_number: 3,
        event_id: 126,
      },
      {
        partnerX: {
          id: 1683,
        },
        partnerY: {
          id: 1700,
        },
        round_number: 4,
        event_id: 123,
      },
      {
        partnerX: {
          id: 1082,
        },
        partnerY: {
          id: 632,
        },
        round_number: 6,
        event_id: 107,
      },
      {
        partnerX: {
          id: 1451,
        },
        partnerY: {
          id: 848,
        },
        round_number: 6,
        event_id: 107,
      },
      {
        partnerX: {
          id: 1405,
        },
        partnerY: {
          id: 1433,
        },
        round_number: 6,
        event_id: 107,
      },
      {
        partnerX: {
          id: 115,
        },
        partnerY: {
          id: 967,
        },
        round_number: 6,
        event_id: 107,
      },
      {
        partnerX: {
          id: 1429,
        },
        partnerY: {
          id: 1457,
        },
        round_number: 6,
        event_id: 107,
      },
      {
        partnerX: {
          id: 1434,
        },
        partnerY: {
          id: 1449,
        },
        round_number: 6,
        event_id: 107,
      },
      {
        partnerX: {
          id: 1418,
        },
        partnerY: {
          id: 775,
        },
        round_number: 6,
        event_id: 107,
      },
      {
        partnerX: {
          id: 1127,
        },
        partnerY: {
          id: 769,
        },
        round_number: 6,
        event_id: 107,
      },
      {
        partnerX: {
          id: 1251,
        },
        partnerY: {
          id: 760,
        },
        round_number: 6,
        event_id: 107,
      },
      {
        partnerX: {
          id: 1681,
        },
        partnerY: {
          id: 1801,
        },
        round_number: 5,
        event_id: 123,
      },
      {
        partnerX: {
          id: 1293,
        },
        partnerY: {
          id: 1902,
        },
        round_number: 3,
        event_id: 136,
      },
      {
        partnerX: {
          id: 1071,
        },
        partnerY: {
          id: 1724,
        },
        round_number: 5,
        event_id: 123,
      },
      {
        partnerX: {
          id: 1157,
        },
        partnerY: {
          id: 1921,
        },
        round_number: 3,
        event_id: 136,
      },
      {
        partnerX: {
          id: 1682,
        },
        partnerY: {
          id: 1827,
        },
        round_number: 5,
        event_id: 123,
      },
      {
        partnerX: {
          id: 1700,
        },
        partnerY: {
          id: 1831,
        },
        round_number: 5,
        event_id: 123,
      },
      {
        partnerX: {
          id: 1653,
        },
        partnerY: {
          id: 1828,
        },
        round_number: 5,
        event_id: 123,
      },
      {
        partnerX: {
          id: 1791,
        },
        partnerY: {
          id: 1824,
        },
        round_number: 5,
        event_id: 123,
      },
      {
        partnerX: {
          id: 1923,
        },
        partnerY: {
          id: 1924,
        },
        round_number: 3,
        event_id: 136,
      },
      {
        partnerX: {
          id: 1600,
        },
        partnerY: {
          id: 1683,
        },
        round_number: 5,
        event_id: 123,
      },
      {
        partnerX: {
          id: 1655,
        },
        partnerY: {
          id: 1830,
        },
        round_number: 5,
        event_id: 123,
      },
      {
        partnerX: {
          id: 1823,
        },
        partnerY: {
          id: 1826,
        },
        round_number: 5,
        event_id: 123,
      },
      {
        partnerX: {
          id: 1258,
        },
        partnerY: {
          id: 1929,
        },
        round_number: 5,
        event_id: 129,
      },
      {
        partnerX: {
          id: 12,
        },
        partnerY: {
          id: 1624,
        },
        round_number: 3,
        event_id: 174,
      },
      {
        partnerX: {
          id: 1628,
        },
        partnerY: {
          id: 48,
        },
        round_number: 3,
        event_id: 174,
      },
      {
        partnerX: {
          id: 115,
        },
        partnerY: {
          id: 8,
        },
        round_number: 3,
        event_id: 174,
      },
      {
        partnerX: {
          id: 1864,
        },
        partnerY: {
          id: 1933,
        },
        round_number: 6,
        event_id: 130,
      },
      {
        partnerX: {
          id: 1646,
        },
        partnerY: {
          id: 947,
        },
        round_number: 6,
        event_id: 130,
      },
      {
        partnerX: {
          id: 1960,
        },
        partnerY: {
          id: 34,
        },
        round_number: 6,
        event_id: 130,
      },
      {
        partnerX: {
          id: 1690,
        },
        partnerY: {
          id: 1802,
        },
        round_number: 3,
        event_id: 126,
      },
      {
        partnerX: {
          id: 1071,
        },
        partnerY: {
          id: 1771,
        },
        round_number: 3,
        event_id: 126,
      },
      {
        partnerX: {
          id: 1083,
        },
        partnerY: {
          id: 1226,
        },
        round_number: 7,
        event_id: 107,
      },
      {
        partnerX: {
          id: 12,
        },
        partnerY: {
          id: 1679,
        },
        round_number: 4,
        event_id: 126,
      },
      {
        partnerX: {
          id: 1133,
        },
        partnerY: {
          id: 967,
        },
        round_number: 7,
        event_id: 107,
      },
      {
        partnerX: {
          id: 1417,
        },
        partnerY: {
          id: 760,
        },
        round_number: 7,
        event_id: 107,
      },
      {
        partnerX: {
          id: 1262,
        },
        partnerY: {
          id: 1415,
        },
        round_number: 7,
        event_id: 107,
      },
      {
        partnerX: {
          id: 1285,
        },
        partnerY: {
          id: 816,
        },
        round_number: 7,
        event_id: 107,
      },
      {
        partnerX: {
          id: 1269,
        },
        partnerY: {
          id: 963,
        },
        round_number: 7,
        event_id: 107,
      },
      {
        partnerX: {
          id: 1082,
        },
        partnerY: {
          id: 906,
        },
        round_number: 7,
        event_id: 107,
      },
      {
        partnerX: {
          id: 1266,
        },
        partnerY: {
          id: 1339,
        },
        round_number: 7,
        event_id: 107,
      },
      {
        partnerX: {
          id: 1071,
        },
        partnerY: {
          id: 1251,
        },
        round_number: 7,
        event_id: 107,
      },
      {
        partnerX: {
          id: 873,
        },
        partnerY: {
          id: 876,
        },
        round_number: 7,
        event_id: 107,
      },
      {
        partnerX: {
          id: 1428,
        },
        partnerY: {
          id: 1449,
        },
        round_number: 7,
        event_id: 107,
      },
      {
        partnerX: {
          id: 1244,
        },
        partnerY: {
          id: 1393,
        },
        round_number: 7,
        event_id: 107,
      },
      {
        partnerX: {
          id: 854,
        },
        partnerY: {
          id: 866,
        },
        round_number: 7,
        event_id: 107,
      },
      {
        partnerX: {
          id: 1221,
        },
        partnerY: {
          id: 1438,
        },
        round_number: 7,
        event_id: 107,
      },
      {
        partnerX: {
          id: 1208,
        },
        partnerY: {
          id: 651,
        },
        round_number: 7,
        event_id: 107,
      },
      {
        partnerX: {
          id: 541,
        },
        partnerY: {
          id: 654,
        },
        round_number: 7,
        event_id: 107,
      },
      {
        partnerX: {
          id: 1418,
        },
        partnerY: {
          id: 965,
        },
        round_number: 7,
        event_id: 107,
      },
      {
        partnerX: {
          id: 1047,
        },
        partnerY: {
          id: 783,
        },
        round_number: 7,
        event_id: 107,
      },
      {
        partnerX: {
          id: 1062,
        },
        partnerY: {
          id: 1360,
        },
        round_number: 7,
        event_id: 107,
      },
      {
        partnerX: {
          id: 1143,
        },
        partnerY: {
          id: 115,
        },
        round_number: 7,
        event_id: 107,
      },
      {
        partnerX: {
          id: 1172,
        },
        partnerY: {
          id: 637,
        },
        round_number: 7,
        event_id: 107,
      },
      {
        partnerX: {
          id: 1370,
        },
        partnerY: {
          id: 1390,
        },
        round_number: 7,
        event_id: 107,
      },
      {
        partnerX: {
          id: 1110,
        },
        partnerY: {
          id: 1199,
        },
        round_number: 7,
        event_id: 107,
      },
      {
        partnerX: {
          id: 12,
        },
        partnerY: {
          id: 1291,
        },
        round_number: 7,
        event_id: 107,
      },
      {
        partnerX: {
          id: 1449,
        },
        partnerY: {
          id: 927,
        },
        round_number: 8,
        event_id: 107,
      },
      {
        partnerX: {
          id: 1358,
        },
        partnerY: {
          id: 939,
        },
        round_number: 8,
        event_id: 107,
      },
      {
        partnerX: {
          id: 751,
        },
        partnerY: {
          id: 765,
        },
        round_number: 8,
        event_id: 107,
      },
      {
        partnerX: {
          id: 1172,
        },
        partnerY: {
          id: 1266,
        },
        round_number: 8,
        event_id: 107,
      },
      {
        partnerX: {
          id: 715,
        },
        partnerY: {
          id: 967,
        },
        round_number: 8,
        event_id: 107,
      },
      {
        partnerX: {
          id: 1391,
        },
        partnerY: {
          id: 632,
        },
        round_number: 8,
        event_id: 107,
      },
      {
        partnerX: {
          id: 1418,
        },
        partnerY: {
          id: 1430,
        },
        round_number: 8,
        event_id: 107,
      },
      {
        partnerX: {
          id: 1409,
        },
        partnerY: {
          id: 654,
        },
        round_number: 8,
        event_id: 107,
      },
      {
        partnerX: {
          id: 1162,
        },
        partnerY: {
          id: 812,
        },
        round_number: 8,
        event_id: 107,
      },
      {
        partnerX: {
          id: 1141,
        },
        partnerY: {
          id: 913,
        },
        round_number: 8,
        event_id: 107,
      },
      {
        partnerX: {
          id: 1127,
        },
        partnerY: {
          id: 738,
        },
        round_number: 8,
        event_id: 107,
      },
      {
        partnerX: {
          id: 1326,
        },
        partnerY: {
          id: 948,
        },
        round_number: 8,
        event_id: 107,
      },
      {
        partnerX: {
          id: 1709,
        },
        partnerY: {
          id: 1771,
        },
        round_number: 4,
        event_id: 126,
      },
      {
        partnerX: {
          id: 1682,
        },
        partnerY: {
          id: 1686,
        },
        round_number: 6,
        event_id: 123,
      },
      {
        partnerX: {
          id: 1681,
        },
        partnerY: {
          id: 1724,
        },
        round_number: 6,
        event_id: 123,
      },
      {
        partnerX: {
          id: 1098,
        },
        partnerY: {
          id: 1457,
        },
        round_number: 8,
        event_id: 107,
      },
      {
        partnerX: {
          id: 1071,
        },
        partnerY: {
          id: 1802,
        },
        round_number: 4,
        event_id: 126,
      },
      {
        partnerX: {
          id: 1226,
        },
        partnerY: {
          id: 1269,
        },
        round_number: 8,
        event_id: 107,
      },
      {
        partnerX: {
          id: 1140,
        },
        partnerY: {
          id: 1377,
        },
        round_number: 8,
        event_id: 107,
      },
      {
        partnerX: {
          id: 1063,
        },
        partnerY: {
          id: 760,
        },
        round_number: 8,
        event_id: 107,
      },
      {
        partnerX: {
          id: 1110,
        },
        partnerY: {
          id: 1428,
        },
        round_number: 8,
        event_id: 107,
      },
      {
        partnerX: {
          id: 1417,
        },
        partnerY: {
          id: 783,
        },
        round_number: 8,
        event_id: 107,
      },
      {
        partnerX: {
          id: 1421,
        },
        partnerY: {
          id: 955,
        },
        round_number: 8,
        event_id: 107,
      },
      {
        partnerX: {
          id: 1298,
        },
        partnerY: {
          id: 952,
        },
        round_number: 8,
        event_id: 107,
      },
      {
        partnerX: {
          id: 1143,
        },
        partnerY: {
          id: 1263,
        },
        round_number: 8,
        event_id: 107,
      },
      {
        partnerX: {
          id: 1683,
        },
        partnerY: {
          id: 1801,
        },
        round_number: 6,
        event_id: 123,
      },
      {
        partnerX: {
          id: 1653,
        },
        partnerY: {
          id: 1831,
        },
        round_number: 6,
        event_id: 123,
      },
      {
        partnerX: {
          id: 1685,
        },
        partnerY: {
          id: 1824,
        },
        round_number: 6,
        event_id: 123,
      },
      {
        partnerX: {
          id: 1791,
        },
        partnerY: {
          id: 1823,
        },
        round_number: 6,
        event_id: 123,
      },
      {
        partnerX: {
          id: 1827,
        },
        partnerY: {
          id: 1830,
        },
        round_number: 6,
        event_id: 123,
      },
      {
        partnerX: {
          id: 1655,
        },
        partnerY: {
          id: 1826,
        },
        round_number: 6,
        event_id: 123,
      },
      {
        partnerX: {
          id: 1683,
        },
        partnerY: {
          id: 1686,
        },
        round_number: 7,
        event_id: 123,
      },
      {
        partnerX: {
          id: 1925,
        },
        partnerY: {
          id: 550,
        },
        round_number: 1,
        event_id: 131,
      },
      {
        partnerX: {
          id: 1682,
        },
        partnerY: {
          id: 1801,
        },
        round_number: 7,
        event_id: 123,
      },
      {
        partnerX: {
          id: 1827,
        },
        partnerY: {
          id: 1828,
        },
        round_number: 7,
        event_id: 123,
      },
      {
        partnerX: {
          id: 1653,
        },
        partnerY: {
          id: 1655,
        },
        round_number: 7,
        event_id: 123,
      },
      {
        partnerX: {
          id: 1685,
        },
        partnerY: {
          id: 1830,
        },
        round_number: 7,
        event_id: 123,
      },
      {
        partnerX: {
          id: 1791,
        },
        partnerY: {
          id: 1831,
        },
        round_number: 7,
        event_id: 123,
      },
      {
        partnerX: {
          id: 1071,
        },
        partnerY: {
          id: 1826,
        },
        round_number: 7,
        event_id: 123,
      },
      {
        partnerX: {
          id: 1837,
        },
        partnerY: {
          id: 1933,
        },
        round_number: 1,
        event_id: 131,
      },
      {
        partnerX: {
          id: 1656,
        },
        partnerY: {
          id: 1901,
        },
        round_number: 1,
        event_id: 131,
      },
      {
        partnerX: {
          id: 1071,
        },
        partnerY: {
          id: 1905,
        },
        round_number: 1,
        event_id: 131,
      },
      {
        partnerX: {
          id: 1910,
        },
        partnerY: {
          id: 8,
        },
        round_number: 1,
        event_id: 131,
      },
      {
        partnerX: {
          id: 12,
        },
        partnerY: {
          id: 1848,
        },
        round_number: 1,
        event_id: 131,
      },
      {
        partnerX: {
          id: 1848,
        },
        partnerY: {
          id: 1958,
        },
        round_number: 3,
        event_id: 131,
      },
      {
        partnerX: {
          id: 1071,
        },
        partnerY: {
          id: 1901,
        },
        round_number: 3,
        event_id: 131,
      },
      {
        partnerX: {
          id: 1910,
        },
        partnerY: {
          id: 1933,
        },
        round_number: 3,
        event_id: 131,
      },
      {
        partnerX: {
          id: 751,
        },
        partnerY: {
          id: 906,
        },
        round_number: 9,
        event_id: 107,
      },
      {
        partnerX: {
          id: 1438,
        },
        partnerY: {
          id: 939,
        },
        round_number: 9,
        event_id: 107,
      },
      {
        partnerX: {
          id: 1403,
        },
        partnerY: {
          id: 812,
        },
        round_number: 9,
        event_id: 107,
      },
      {
        partnerX: {
          id: 816,
        },
        partnerY: {
          id: 876,
        },
        round_number: 9,
        event_id: 107,
      },
      {
        partnerX: {
          id: 1432,
        },
        partnerY: {
          id: 1434,
        },
        round_number: 9,
        event_id: 107,
      },
      {
        partnerX: {
          id: 1444,
        },
        partnerY: {
          id: 541,
        },
        round_number: 9,
        event_id: 107,
      },
      {
        partnerX: {
          id: 1111,
        },
        partnerY: {
          id: 1436,
        },
        round_number: 9,
        event_id: 107,
      },
      {
        partnerX: {
          id: 1399,
        },
        partnerY: {
          id: 8,
        },
        round_number: 9,
        event_id: 107,
      },
      {
        partnerX: {
          id: 1410,
        },
        partnerY: {
          id: 881,
        },
        round_number: 9,
        event_id: 107,
      },
      {
        partnerX: {
          id: 1269,
        },
        partnerY: {
          id: 947,
        },
        round_number: 9,
        event_id: 107,
      },
      {
        partnerX: {
          id: 12,
        },
        partnerY: {
          id: 1221,
        },
        round_number: 9,
        event_id: 107,
      },
      {
        partnerX: {
          id: 1064,
        },
        partnerY: {
          id: 1325,
        },
        round_number: 9,
        event_id: 107,
      },
      {
        partnerX: {
          id: 1405,
        },
        partnerY: {
          id: 1430,
        },
        round_number: 9,
        event_id: 107,
      },
      {
        partnerX: {
          id: 1098,
        },
        partnerY: {
          id: 967,
        },
        round_number: 9,
        event_id: 107,
      },
      {
        partnerX: {
          id: 1026,
        },
        partnerY: {
          id: 1451,
        },
        round_number: 9,
        event_id: 107,
      },
      {
        partnerX: {
          id: 1047,
        },
        partnerY: {
          id: 931,
        },
        round_number: 9,
        event_id: 107,
      },
      {
        partnerX: {
          id: 1082,
        },
        partnerY: {
          id: 1141,
        },
        round_number: 9,
        event_id: 107,
      },
      {
        partnerX: {
          id: 1367,
        },
        partnerY: {
          id: 632,
        },
        round_number: 9,
        event_id: 107,
      },
      {
        partnerX: {
          id: 1071,
        },
        partnerY: {
          id: 1446,
        },
        round_number: 9,
        event_id: 107,
      },
      {
        partnerX: {
          id: 1110,
        },
        partnerY: {
          id: 1433,
        },
        round_number: 9,
        event_id: 107,
      },
      {
        partnerX: {
          id: 1194,
        },
        partnerY: {
          id: 1271,
        },
        round_number: 9,
        event_id: 107,
      },
      {
        partnerX: {
          id: 913,
        },
        partnerY: {
          id: 963,
        },
        round_number: 9,
        event_id: 107,
      },
      {
        partnerX: {
          id: 715,
        },
        partnerY: {
          id: 827,
        },
        round_number: 9,
        event_id: 107,
      },
      {
        partnerX: {
          id: 1226,
        },
        partnerY: {
          id: 783,
        },
        round_number: 9,
        event_id: 107,
      },
      {
        partnerX: {
          id: 1044,
        },
        partnerY: {
          id: 1418,
        },
        round_number: 9,
        event_id: 107,
      },
      {
        partnerX: {
          id: 1377,
        },
        partnerY: {
          id: 1415,
        },
        round_number: 9,
        event_id: 107,
      },
      {
        partnerX: {
          id: 1423,
        },
        partnerY: {
          id: 784,
        },
        round_number: 9,
        event_id: 107,
      },
      {
        partnerX: {
          id: 738,
        },
        partnerY: {
          id: 942,
        },
        round_number: 9,
        event_id: 107,
      },
      {
        partnerX: {
          id: 1409,
        },
        partnerY: {
          id: 846,
        },
        round_number: 9,
        event_id: 107,
      },
      {
        partnerX: {
          id: 1042,
        },
        partnerY: {
          id: 1266,
        },
        round_number: 9,
        event_id: 107,
      },
      {
        partnerX: {
          id: 1441,
        },
        partnerY: {
          id: 722,
        },
        round_number: 9,
        event_id: 107,
      },
      {
        partnerX: {
          id: 1449,
        },
        partnerY: {
          id: 848,
        },
        round_number: 9,
        event_id: 107,
      },
      {
        partnerX: {
          id: 1426,
        },
        partnerY: {
          id: 319,
        },
        round_number: 9,
        event_id: 107,
      },
      {
        partnerX: {
          id: 1263,
        },
        partnerY: {
          id: 714,
        },
        round_number: 9,
        event_id: 107,
      },
      {
        partnerX: {
          id: 1071,
        },
        partnerY: {
          id: 1828,
        },
        round_number: 6,
        event_id: 123,
      },
      {
        partnerX: {
          id: 1600,
        },
        partnerY: {
          id: 1700,
        },
        round_number: 7,
        event_id: 123,
      },
      {
        partnerX: {
          id: 1681,
        },
        partnerY: {
          id: 1823,
        },
        round_number: 7,
        event_id: 123,
      },
      {
        partnerX: {
          id: 1933,
        },
        partnerY: {
          id: 34,
        },
        round_number: 1,
        event_id: 130,
      },
      {
        partnerX: {
          id: 1623,
        },
        partnerY: {
          id: 595,
        },
        round_number: 6,
        event_id: 129,
      },
      {
        partnerX: {
          id: 1933,
        },
        partnerY: {
          id: 1943,
        },
        round_number: 2,
        event_id: 132,
      },
      {
        partnerX: {
          id: 1864,
        },
        partnerY: {
          id: 947,
        },
        round_number: 1,
        event_id: 130,
      },
      {
        partnerX: {
          id: 1628,
        },
        partnerY: {
          id: 1937,
        },
        round_number: 6,
        event_id: 129,
      },
      {
        partnerX: {
          id: 12,
        },
        partnerY: {
          id: 1905,
        },
        round_number: 2,
        event_id: 131,
      },
      {
        partnerX: {
          id: 115,
        },
        partnerY: {
          id: 550,
        },
        round_number: 2,
        event_id: 131,
      },
      {
        partnerX: {
          id: 115,
        },
        partnerY: {
          id: 1962,
        },
        round_number: 1,
        event_id: 130,
      },
      {
        partnerX: {
          id: 1071,
        },
        partnerY: {
          id: 8,
        },
        round_number: 2,
        event_id: 131,
      },
      {
        partnerX: {
          id: 1837,
        },
        partnerY: {
          id: 1910,
        },
        round_number: 2,
        event_id: 131,
      },
      {
        partnerX: {
          id: 1901,
        },
        partnerY: {
          id: 1958,
        },
        round_number: 2,
        event_id: 131,
      },
      {
        partnerX: {
          id: 12,
        },
        partnerY: {
          id: 1628,
        },
        round_number: 4,
        event_id: 174,
      },
      {
        partnerX: {
          id: 1599,
        },
        partnerY: {
          id: 1853,
        },
        round_number: 6,
        event_id: 129,
      },
      {
        partnerX: {
          id: 115,
        },
        partnerY: {
          id: 513,
        },
        round_number: 4,
        event_id: 174,
      },
      {
        partnerX: {
          id: 48,
        },
        partnerY: {
          id: 8,
        },
        round_number: 4,
        event_id: 174,
      },
      {
        partnerX: {
          id: 1862,
        },
        partnerY: {
          id: 506,
        },
        round_number: 5,
        event_id: 129,
      },
      {
        partnerX: {
          id: 1082,
        },
        partnerY: {
          id: 760,
        },
        round_number: 10,
        event_id: 107,
      },
      {
        partnerX: {
          id: 1194,
        },
        partnerY: {
          id: 942,
        },
        round_number: 10,
        event_id: 107,
      },
      {
        partnerX: {
          id: 513,
        },
        partnerY: {
          id: 8,
        },
        round_number: 1,
        event_id: 130,
      },
      {
        partnerX: {
          id: 1536,
        },
        partnerY: {
          id: 513,
        },
        round_number: 6,
        event_id: 129,
      },
      {
        partnerX: {
          id: 1629,
        },
        partnerY: {
          id: 34,
        },
        round_number: 6,
        event_id: 129,
      },
      {
        partnerX: {
          id: 1362,
        },
        partnerY: {
          id: 1405,
        },
        round_number: 10,
        event_id: 107,
      },
      {
        partnerX: {
          id: 1857,
        },
        partnerY: {
          id: 1929,
        },
        round_number: 6,
        event_id: 129,
      },
      {
        partnerX: {
          id: 1266,
        },
        partnerY: {
          id: 751,
        },
        round_number: 10,
        event_id: 107,
      },
      {
        partnerX: {
          id: 1071,
        },
        partnerY: {
          id: 1862,
        },
        round_number: 6,
        event_id: 129,
      },
      {
        partnerX: {
          id: 1578,
        },
        partnerY: {
          id: 1933,
        },
        round_number: 6,
        event_id: 129,
      },
      {
        partnerX: {
          id: 385,
        },
        partnerY: {
          id: 8,
        },
        round_number: 6,
        event_id: 129,
      },
      {
        partnerX: {
          id: 115,
        },
        partnerY: {
          id: 506,
        },
        round_number: 6,
        event_id: 129,
      },
      {
        partnerX: {
          id: 1901,
        },
        partnerY: {
          id: 513,
        },
        round_number: 6,
        event_id: 130,
      },
      {
        partnerX: {
          id: 1071,
        },
        partnerY: {
          id: 8,
        },
        round_number: 6,
        event_id: 130,
      },
      {
        partnerX: {
          id: 12,
        },
        partnerY: {
          id: 513,
        },
        round_number: 7,
        event_id: 130,
      },
      {
        partnerX: {
          id: 1536,
        },
        partnerY: {
          id: 1992,
        },
        round_number: 2,
        event_id: 132,
      },
      {
        partnerX: {
          id: 1989,
        },
        partnerY: {
          id: 2017,
        },
        round_number: 2,
        event_id: 132,
      },
      {
        partnerX: {
          id: 1691,
        },
        partnerY: {
          id: 34,
        },
        round_number: 2,
        event_id: 132,
      },
      {
        partnerX: {
          id: 1152,
        },
        partnerY: {
          id: 513,
        },
        round_number: 2,
        event_id: 132,
      },
      {
        partnerX: {
          id: 1635,
        },
        partnerY: {
          id: 1918,
        },
        round_number: 2,
        event_id: 132,
      },
      {
        partnerX: {
          id: 1933,
        },
        partnerY: {
          id: 600,
        },
        round_number: 3,
        event_id: 132,
      },
      {
        partnerX: {
          id: 1992,
        },
        partnerY: {
          id: 513,
        },
        round_number: 3,
        event_id: 132,
      },
      {
        partnerX: {
          id: 1943,
        },
        partnerY: {
          id: 1989,
        },
        round_number: 3,
        event_id: 132,
      },
      {
        partnerX: {
          id: 1536,
        },
        partnerY: {
          id: 1578,
        },
        round_number: 3,
        event_id: 132,
      },
      {
        partnerX: {
          id: 1918,
        },
        partnerY: {
          id: 34,
        },
        round_number: 3,
        event_id: 132,
      },
      {
        partnerX: {
          id: 1974,
        },
        partnerY: {
          id: 2019,
        },
        round_number: 3,
        event_id: 132,
      },
      {
        partnerX: {
          id: 1152,
        },
        partnerY: {
          id: 34,
        },
        round_number: 7,
        event_id: 132,
      },
      {
        partnerX: {
          id: 1933,
        },
        partnerY: {
          id: 1989,
        },
        round_number: 7,
        event_id: 132,
      },
      {
        partnerX: {
          id: 12,
        },
        partnerY: {
          id: 1536,
        },
        round_number: 7,
        event_id: 132,
      },
      {
        partnerX: {
          id: 1410,
        },
        partnerY: {
          id: 812,
        },
        round_number: 10,
        event_id: 107,
      },
      {
        partnerX: {
          id: 1679,
        },
        partnerY: {
          id: 1771,
        },
        round_number: 5,
        event_id: 126,
      },
      {
        partnerX: {
          id: 1127,
        },
        partnerY: {
          id: 1409,
        },
        round_number: 10,
        event_id: 107,
      },
      {
        partnerX: {
          id: 1325,
        },
        partnerY: {
          id: 1452,
        },
        round_number: 10,
        event_id: 107,
      },
      {
        partnerX: {
          id: 1403,
        },
        partnerY: {
          id: 1441,
        },
        round_number: 10,
        event_id: 107,
      },
      {
        partnerX: {
          id: 1111,
        },
        partnerY: {
          id: 1143,
        },
        round_number: 10,
        event_id: 107,
      },
      {
        partnerX: {
          id: 1269,
        },
        partnerY: {
          id: 827,
        },
        round_number: 10,
        event_id: 107,
      },
      {
        partnerX: {
          id: 12,
        },
        partnerY: {
          id: 1690,
        },
        round_number: 5,
        event_id: 126,
      },
      {
        partnerX: {
          id: 1449,
        },
        partnerY: {
          id: 825,
        },
        round_number: 10,
        event_id: 107,
      },
      {
        partnerX: {
          id: 1408,
        },
        partnerY: {
          id: 1428,
        },
        round_number: 10,
        event_id: 107,
      },
      {
        partnerX: {
          id: 12,
        },
        partnerY: {
          id: 1401,
        },
        round_number: 10,
        event_id: 107,
      },
      {
        partnerX: {
          id: 1133,
        },
        partnerY: {
          id: 1451,
        },
        round_number: 10,
        event_id: 107,
      },
      {
        partnerX: {
          id: 1690,
        },
        partnerY: {
          id: 1771,
        },
        round_number: 6,
        event_id: 126,
      },
      {
        partnerX: {
          id: 1110,
        },
        partnerY: {
          id: 115,
        },
        round_number: 10,
        event_id: 107,
      },
      {
        partnerX: {
          id: 1339,
        },
        partnerY: {
          id: 1418,
        },
        round_number: 10,
        event_id: 107,
      },
      {
        partnerX: {
          id: 1098,
        },
        partnerY: {
          id: 335,
        },
        round_number: 10,
        event_id: 107,
      },
      {
        partnerX: {
          id: 654,
        },
        partnerY: {
          id: 955,
        },
        round_number: 10,
        event_id: 107,
      },
      {
        partnerX: {
          id: 1047,
        },
        partnerY: {
          id: 906,
        },
        round_number: 10,
        event_id: 107,
      },
      {
        partnerX: {
          id: 1399,
        },
        partnerY: {
          id: 722,
        },
        round_number: 10,
        event_id: 107,
      },
      {
        partnerX: {
          id: 1263,
        },
        partnerY: {
          id: 1377,
        },
        round_number: 10,
        event_id: 107,
      },
      {
        partnerX: {
          id: 1271,
        },
        partnerY: {
          id: 848,
        },
        round_number: 10,
        event_id: 107,
      },
      {
        partnerX: {
          id: 738,
        },
        partnerY: {
          id: 952,
        },
        round_number: 10,
        event_id: 107,
      },
      {
        partnerX: {
          id: 1140,
        },
        partnerY: {
          id: 831,
        },
        round_number: 10,
        event_id: 107,
      },
      {
        partnerX: {
          id: 1380,
        },
        partnerY: {
          id: 1415,
        },
        round_number: 10,
        event_id: 107,
      },
      {
        partnerX: {
          id: 1226,
        },
        partnerY: {
          id: 947,
        },
        round_number: 10,
        event_id: 107,
      },
      {
        partnerX: {
          id: 1358,
        },
        partnerY: {
          id: 1429,
        },
        round_number: 10,
        event_id: 107,
      },
      {
        partnerX: {
          id: 1430,
        },
        partnerY: {
          id: 816,
        },
        round_number: 10,
        event_id: 107,
      },
      {
        partnerX: {
          id: 1432,
        },
        partnerY: {
          id: 784,
        },
        round_number: 10,
        event_id: 107,
      },
      {
        partnerX: {
          id: 541,
        },
        partnerY: {
          id: 931,
        },
        round_number: 10,
        event_id: 107,
      },
      {
        partnerX: {
          id: 1199,
        },
        partnerY: {
          id: 632,
        },
        round_number: 10,
        event_id: 107,
      },
      {
        partnerX: {
          id: 1411,
        },
        partnerY: {
          id: 846,
        },
        round_number: 10,
        event_id: 107,
      },
      {
        partnerX: {
          id: 1434,
        },
        partnerY: {
          id: 913,
        },
        round_number: 10,
        event_id: 107,
      },
      {
        partnerX: {
          id: 1251,
        },
        partnerY: {
          id: 1421,
        },
        round_number: 10,
        event_id: 107,
      },
      {
        partnerX: {
          id: 1724,
        },
        partnerY: {
          id: 1826,
        },
        round_number: 8,
        event_id: 123,
      },
      {
        partnerX: {
          id: 1655,
        },
        partnerY: {
          id: 1700,
        },
        round_number: 8,
        event_id: 123,
      },
      {
        partnerX: {
          id: 1686,
        },
        partnerY: {
          id: 1830,
        },
        round_number: 8,
        event_id: 123,
      },
      {
        partnerX: {
          id: 1683,
        },
        partnerY: {
          id: 1824,
        },
        round_number: 8,
        event_id: 123,
      },
      {
        partnerX: {
          id: 12,
        },
        partnerY: {
          id: 1837,
        },
        round_number: 3,
        event_id: 131,
      },
      {
        partnerX: {
          id: 1600,
        },
        partnerY: {
          id: 1801,
        },
        round_number: 8,
        event_id: 123,
      },
      {
        partnerX: {
          id: 1653,
        },
        partnerY: {
          id: 1681,
        },
        round_number: 8,
        event_id: 123,
      },
      {
        partnerX: {
          id: 1682,
        },
        partnerY: {
          id: 1831,
        },
        round_number: 8,
        event_id: 123,
      },
      {
        partnerX: {
          id: 1071,
        },
        partnerY: {
          id: 1827,
        },
        round_number: 8,
        event_id: 123,
      },
      {
        partnerX: {
          id: 115,
        },
        partnerY: {
          id: 48,
        },
        round_number: 5,
        event_id: 174,
      },
      {
        partnerX: {
          id: 12,
        },
        partnerY: {
          id: 8,
        },
        round_number: 6,
        event_id: 174,
      },
      {
        partnerX: {
          id: 513,
        },
        partnerY: {
          id: 8,
        },
        round_number: 5,
        event_id: 174,
      },
      {
        partnerX: {
          id: 1624,
        },
        partnerY: {
          id: 1628,
        },
        round_number: 5,
        event_id: 174,
      },
      {
        partnerX: {
          id: 115,
        },
        partnerY: {
          id: 1624,
        },
        round_number: 6,
        event_id: 174,
      },
      {
        partnerX: {
          id: 1221,
        },
        partnerY: {
          id: 1433,
        },
        round_number: 10,
        event_id: 107,
      },
      {
        partnerX: {
          id: 8,
        },
        partnerY: {
          id: 965,
        },
        round_number: 10,
        event_id: 107,
      },
      {
        partnerX: {
          id: 1393,
        },
        partnerY: {
          id: 714,
        },
        round_number: 10,
        event_id: 107,
      },
      {
        partnerX: {
          id: 1064,
        },
        partnerY: {
          id: 614,
        },
        round_number: 10,
        event_id: 107,
      },
      {
        partnerX: {
          id: 1063,
        },
        partnerY: {
          id: 1446,
        },
        round_number: 10,
        event_id: 107,
      },
      {
        partnerX: {
          id: 1141,
        },
        partnerY: {
          id: 946,
        },
        round_number: 10,
        event_id: 107,
      },
      {
        partnerX: {
          id: 1042,
        },
        partnerY: {
          id: 1390,
        },
        round_number: 10,
        event_id: 107,
      },
      {
        partnerX: {
          id: 1550,
        },
        partnerY: {
          id: 1586,
        },
        round_number: 4,
        event_id: 114,
      },
      {
        partnerX: {
          id: 1508,
        },
        partnerY: {
          id: 1526,
        },
        round_number: 3,
        event_id: 114,
      },
      {
        partnerX: {
          id: 1472,
        },
        partnerY: {
          id: 1490,
        },
        round_number: 4,
        event_id: 114,
      },
      {
        partnerX: {
          id: 1522,
        },
        partnerY: {
          id: 1577,
        },
        round_number: 4,
        event_id: 114,
      },
      {
        partnerX: {
          id: 1490,
        },
        partnerY: {
          id: 55,
        },
        round_number: 1,
        event_id: 114,
      },
      {
        partnerX: {
          id: 1522,
        },
        partnerY: {
          id: 1586,
        },
        round_number: 3,
        event_id: 114,
      },
      {
        partnerX: {
          id: 1474,
        },
        partnerY: {
          id: 1601,
        },
        round_number: 3,
        event_id: 114,
      },
      {
        partnerX: {
          id: 1579,
        },
        partnerY: {
          id: 1586,
        },
        round_number: 1,
        event_id: 114,
      },
      {
        partnerX: {
          id: 1485,
        },
        partnerY: {
          id: 1556,
        },
        round_number: 1,
        event_id: 114,
      },
      {
        partnerX: {
          id: 1520,
        },
        partnerY: {
          id: 1522,
        },
        round_number: 1,
        event_id: 114,
      },
      {
        partnerX: {
          id: 12,
        },
        partnerY: {
          id: 1483,
        },
        round_number: 1,
        event_id: 114,
      },
      {
        partnerX: {
          id: 1550,
        },
        partnerY: {
          id: 1601,
        },
        round_number: 1,
        event_id: 114,
      },
      {
        partnerX: {
          id: 1485,
        },
        partnerY: {
          id: 1550,
        },
        round_number: 3,
        event_id: 114,
      },
      {
        partnerX: {
          id: 1459,
        },
        partnerY: {
          id: 1608,
        },
        round_number: 3,
        event_id: 114,
      },
      {
        partnerX: {
          id: 1556,
        },
        partnerY: {
          id: 1586,
        },
        round_number: 2,
        event_id: 114,
      },
      {
        partnerX: {
          id: 1485,
        },
        partnerY: {
          id: 55,
        },
        round_number: 2,
        event_id: 114,
      },
      {
        partnerX: {
          id: 1490,
        },
        partnerY: {
          id: 1603,
        },
        round_number: 2,
        event_id: 114,
      },
      {
        partnerX: {
          id: 1579,
        },
        partnerY: {
          id: 1601,
        },
        round_number: 2,
        event_id: 114,
      },
      {
        partnerX: {
          id: 1484,
        },
        partnerY: {
          id: 1508,
        },
        round_number: 2,
        event_id: 114,
      },
      {
        partnerX: {
          id: 1474,
        },
        partnerY: {
          id: 1522,
        },
        round_number: 2,
        event_id: 114,
      },
      {
        partnerX: {
          id: 1579,
        },
        partnerY: {
          id: 55,
        },
        round_number: 4,
        event_id: 114,
      },
      {
        partnerX: {
          id: 1490,
        },
        partnerY: {
          id: 1601,
        },
        round_number: 5,
        event_id: 114,
      },
      {
        partnerX: {
          id: 12,
        },
        partnerY: {
          id: 1603,
        },
        round_number: 3,
        event_id: 114,
      },
      {
        partnerX: {
          id: 1508,
        },
        partnerY: {
          id: 1608,
        },
        round_number: 4,
        event_id: 114,
      },
      {
        partnerX: {
          id: 1526,
        },
        partnerY: {
          id: 1604,
        },
        round_number: 4,
        event_id: 114,
      },
      {
        partnerX: {
          id: 1459,
        },
        partnerY: {
          id: 1483,
        },
        round_number: 4,
        event_id: 114,
      },
      {
        partnerX: {
          id: 1526,
        },
        partnerY: {
          id: 1579,
        },
        round_number: 5,
        event_id: 114,
      },
      {
        partnerX: {
          id: 1603,
        },
        partnerY: {
          id: 55,
        },
        round_number: 5,
        event_id: 114,
      },
      {
        partnerX: {
          id: 1485,
        },
        partnerY: {
          id: 1586,
        },
        round_number: 5,
        event_id: 114,
      },
      {
        partnerX: {
          id: 1508,
        },
        partnerY: {
          id: 1604,
        },
        round_number: 5,
        event_id: 114,
      },
      {
        partnerX: {
          id: 1483,
        },
        partnerY: {
          id: 1577,
        },
        round_number: 5,
        event_id: 114,
      },
      {
        partnerX: {
          id: 1474,
        },
        partnerY: {
          id: 1556,
        },
        round_number: 5,
        event_id: 114,
      },
      {
        partnerX: {
          id: 1522,
        },
        partnerY: {
          id: 1608,
        },
        round_number: 5,
        event_id: 114,
      },
      {
        partnerX: {
          id: 1545,
        },
        partnerY: {
          id: 1550,
        },
        round_number: 5,
        event_id: 114,
      },
      {
        partnerX: {
          id: 1472,
        },
        partnerY: {
          id: 1484,
        },
        round_number: 5,
        event_id: 114,
      },
      {
        partnerX: {
          id: 1472,
        },
        partnerY: {
          id: 1521,
        },
        round_number: 6,
        event_id: 114,
      },
      {
        partnerX: {
          id: 1556,
        },
        partnerY: {
          id: 1608,
        },
        round_number: 6,
        event_id: 114,
      },
      {
        partnerX: {
          id: 1483,
        },
        partnerY: {
          id: 1586,
        },
        round_number: 6,
        event_id: 114,
      },
      {
        partnerX: {
          id: 1489,
        },
        partnerY: {
          id: 1508,
        },
        round_number: 6,
        event_id: 114,
      },
      {
        partnerX: {
          id: 1522,
        },
        partnerY: {
          id: 1603,
        },
        round_number: 6,
        event_id: 114,
      },
      {
        partnerX: {
          id: 1474,
        },
        partnerY: {
          id: 1579,
        },
        round_number: 6,
        event_id: 114,
      },
      {
        partnerX: {
          id: 1545,
        },
        partnerY: {
          id: 1601,
        },
        round_number: 6,
        event_id: 114,
      },
      {
        partnerX: {
          id: 1526,
        },
        partnerY: {
          id: 1577,
        },
        round_number: 6,
        event_id: 114,
      },
      {
        partnerX: {
          id: 1484,
        },
        partnerY: {
          id: 1579,
        },
        round_number: 7,
        event_id: 114,
      },
      {
        partnerX: {
          id: 1472,
        },
        partnerY: {
          id: 1522,
        },
        round_number: 7,
        event_id: 114,
      },
      {
        partnerX: {
          id: 1474,
        },
        partnerY: {
          id: 1489,
        },
        round_number: 7,
        event_id: 114,
      },
      {
        partnerX: {
          id: 1526,
        },
        partnerY: {
          id: 1556,
        },
        round_number: 7,
        event_id: 114,
      },
      {
        partnerX: {
          id: 1545,
        },
        partnerY: {
          id: 1586,
        },
        round_number: 7,
        event_id: 114,
      },
      {
        partnerX: {
          id: 1601,
        },
        partnerY: {
          id: 55,
        },
        round_number: 7,
        event_id: 114,
      },
      {
        partnerX: {
          id: 12,
        },
        partnerY: {
          id: 1485,
        },
        round_number: 7,
        event_id: 114,
      },
      {
        partnerX: {
          id: 1962,
        },
        partnerY: {
          id: 947,
        },
        round_number: 2,
        event_id: 130,
      },
      {
        partnerX: {
          id: 1071,
        },
        partnerY: {
          id: 1679,
        },
        round_number: 6,
        event_id: 126,
      },
      {
        partnerX: {
          id: 115,
        },
        partnerY: {
          id: 2003,
        },
        round_number: 2,
        event_id: 130,
      },
      {
        partnerX: {
          id: 12,
        },
        partnerY: {
          id: 1802,
        },
        round_number: 6,
        event_id: 126,
      },
      {
        partnerX: {
          id: 1993,
        },
        partnerY: {
          id: 596,
        },
        round_number: 6,
        event_id: 130,
      },
      {
        partnerX: {
          id: 1962,
        },
        partnerY: {
          id: 2003,
        },
        round_number: 6,
        event_id: 130,
      },
      {
        partnerX: {
          id: 1653,
        },
        partnerY: {
          id: 1724,
        },
        round_number: 9,
        event_id: 123,
      },
      {
        partnerX: {
          id: 1683,
        },
        partnerY: {
          id: 1685,
        },
        round_number: 9,
        event_id: 123,
      },
      {
        partnerX: {
          id: 1071,
        },
        partnerY: {
          id: 1682,
        },
        round_number: 9,
        event_id: 123,
      },
      {
        partnerX: {
          id: 1791,
        },
        partnerY: {
          id: 1826,
        },
        round_number: 9,
        event_id: 123,
      },
      {
        partnerX: {
          id: 1681,
        },
        partnerY: {
          id: 1686,
        },
        round_number: 9,
        event_id: 123,
      },
      {
        partnerX: {
          id: 1960,
        },
        partnerY: {
          id: 1993,
        },
        round_number: 7,
        event_id: 130,
      },
      {
        partnerX: {
          id: 1700,
        },
        partnerY: {
          id: 1827,
        },
        round_number: 9,
        event_id: 123,
      },
      {
        partnerX: {
          id: 1830,
        },
        partnerY: {
          id: 1831,
        },
        round_number: 9,
        event_id: 123,
      },
      {
        partnerX: {
          id: 1933,
        },
        partnerY: {
          id: 1962,
        },
        round_number: 7,
        event_id: 130,
      },
      {
        partnerX: {
          id: 1906,
        },
        partnerY: {
          id: 1925,
        },
        round_number: 3,
        event_id: 131,
      },
      {
        partnerX: {
          id: 48,
        },
        partnerY: {
          id: 513,
        },
        round_number: 6,
        event_id: 174,
      },
      {
        partnerX: {
          id: 1071,
        },
        partnerY: {
          id: 1963,
        },
        round_number: 7,
        event_id: 129,
      },
      {
        partnerX: {
          id: 1258,
        },
        partnerY: {
          id: 1623,
        },
        round_number: 7,
        event_id: 129,
      },
      {
        partnerX: {
          id: 1943,
        },
        partnerY: {
          id: 1974,
        },
        round_number: 9,
        event_id: 132,
      },
      {
        partnerX: {
          id: 513,
        },
        partnerY: {
          id: 8,
        },
        round_number: 7,
        event_id: 129,
      },
      {
        partnerX: {
          id: 12,
        },
        partnerY: {
          id: 1628,
        },
        round_number: 7,
        event_id: 129,
      },
      {
        partnerX: {
          id: 1929,
        },
        partnerY: {
          id: 595,
        },
        round_number: 7,
        event_id: 129,
      },
      {
        partnerX: {
          id: 1857,
        },
        partnerY: {
          id: 1862,
        },
        round_number: 7,
        event_id: 129,
      },
      {
        partnerX: {
          id: 1599,
        },
        partnerY: {
          id: 506,
        },
        round_number: 7,
        event_id: 129,
      },
      {
        partnerX: {
          id: 1635,
        },
        partnerY: {
          id: 1933,
        },
        round_number: 9,
        event_id: 132,
      },
      {
        partnerX: {
          id: 1536,
        },
        partnerY: {
          id: 385,
        },
        round_number: 7,
        event_id: 129,
      },
      {
        partnerX: {
          id: 1853,
        },
        partnerY: {
          id: 1933,
        },
        round_number: 7,
        event_id: 129,
      },
      {
        partnerX: {
          id: 115,
        },
        partnerY: {
          id: 34,
        },
        round_number: 7,
        event_id: 129,
      },
      {
        partnerX: {
          id: 1937,
        },
        partnerY: {
          id: 1939,
        },
        round_number: 7,
        event_id: 129,
      },
      {
        partnerX: {
          id: 1600,
        },
        partnerY: {
          id: 1700,
        },
        round_number: 1,
        event_id: 134,
      },
      {
        partnerX: {
          id: 1801,
        },
        partnerY: {
          id: 2024,
        },
        round_number: 1,
        event_id: 134,
      },
      {
        partnerX: {
          id: 12,
        },
        partnerY: {
          id: 1840,
        },
        round_number: 2,
        event_id: 130,
      },
      {
        partnerX: {
          id: 1685,
        },
        partnerY: {
          id: 2025,
        },
        round_number: 1,
        event_id: 134,
      },
      {
        partnerX: {
          id: 1933,
        },
        partnerY: {
          id: 1960,
        },
        round_number: 2,
        event_id: 130,
      },
      {
        partnerX: {
          id: 1864,
        },
        partnerY: {
          id: 34,
        },
        round_number: 2,
        event_id: 130,
      },
      {
        partnerX: {
          id: 1071,
        },
        partnerY: {
          id: 596,
        },
        round_number: 2,
        event_id: 130,
      },
      {
        partnerX: {
          id: 1948,
        },
        partnerY: {
          id: 2015,
        },
        round_number: 1,
        event_id: 134,
      },
      {
        partnerX: {
          id: 1646,
        },
        partnerY: {
          id: 1901,
        },
        round_number: 2,
        event_id: 130,
      },
      {
        partnerX: {
          id: 1993,
        },
        partnerY: {
          id: 513,
        },
        round_number: 2,
        event_id: 130,
      },
      {
        partnerX: {
          id: 1578,
        },
        partnerY: {
          id: 1933,
        },
        round_number: 4,
        event_id: 132,
      },
      {
        partnerX: {
          id: 1729,
        },
        partnerY: {
          id: 2010,
        },
        round_number: 1,
        event_id: 134,
      },
      {
        partnerX: {
          id: 2000,
        },
        partnerY: {
          id: 34,
        },
        round_number: 4,
        event_id: 132,
      },
      {
        partnerX: {
          id: 1691,
        },
        partnerY: {
          id: 1992,
        },
        round_number: 4,
        event_id: 132,
      },
      {
        partnerX: {
          id: 1536,
        },
        partnerY: {
          id: 1974,
        },
        round_number: 4,
        event_id: 132,
      },
      {
        partnerX: {
          id: 1691,
        },
        partnerY: {
          id: 2019,
        },
        round_number: 7,
        event_id: 132,
      },
      {
        partnerX: {
          id: 1071,
        },
        partnerY: {
          id: 1985,
        },
        round_number: 2,
        event_id: 134,
      },
      {
        partnerX: {
          id: 1152,
        },
        partnerY: {
          id: 1691,
        },
        round_number: 9,
        event_id: 132,
      },
      {
        partnerX: {
          id: 1724,
        },
        partnerY: {
          id: 1729,
        },
        round_number: 3,
        event_id: 134,
      },
      {
        partnerX: {
          id: 1989,
        },
        partnerY: {
          id: 513,
        },
        round_number: 9,
        event_id: 132,
      },
      {
        partnerX: {
          id: 2010,
        },
        partnerY: {
          id: 2015,
        },
        round_number: 3,
        event_id: 134,
      },
      {
        partnerX: {
          id: 1801,
        },
        partnerY: {
          id: 2010,
        },
        round_number: 2,
        event_id: 134,
      },
      {
        partnerX: {
          id: 1948,
        },
        partnerY: {
          id: 1999,
        },
        round_number: 2,
        event_id: 134,
      },
      {
        partnerX: {
          id: 1655,
        },
        partnerY: {
          id: 1859,
        },
        round_number: 2,
        event_id: 134,
      },
      {
        partnerX: {
          id: 1826,
        },
        partnerY: {
          id: 2024,
        },
        round_number: 2,
        event_id: 134,
      },
      {
        partnerX: {
          id: 1821,
        },
        partnerY: {
          id: 2025,
        },
        round_number: 3,
        event_id: 134,
      },
      {
        partnerX: {
          id: 1655,
        },
        partnerY: {
          id: 506,
        },
        round_number: 3,
        event_id: 134,
      },
      {
        partnerX: {
          id: 1685,
        },
        partnerY: {
          id: 1948,
        },
        round_number: 3,
        event_id: 134,
      },
      {
        partnerX: {
          id: 1700,
        },
        partnerY: {
          id: 1801,
        },
        round_number: 3,
        event_id: 134,
      },
      {
        partnerX: {
          id: 1999,
        },
        partnerY: {
          id: 2024,
        },
        round_number: 3,
        event_id: 134,
      },
      {
        partnerX: {
          id: 1826,
        },
        partnerY: {
          id: 1901,
        },
        round_number: 3,
        event_id: 134,
      },
      {
        partnerX: {
          id: 1490,
        },
        partnerY: {
          id: 1508,
        },
        round_number: 7,
        event_id: 114,
      },
      {
        partnerX: {
          id: 1489,
        },
        partnerY: {
          id: 55,
        },
        round_number: 11,
        event_id: 114,
      },
      {
        partnerX: {
          id: 1508,
        },
        partnerY: {
          id: 1586,
        },
        round_number: 8,
        event_id: 114,
      },
      {
        partnerX: {
          id: 1208,
        },
        partnerY: {
          id: 8,
        },
        round_number: 2,
        event_id: 105,
      },
      {
        partnerX: {
          id: 12,
        },
        partnerY: {
          id: 1484,
        },
        round_number: 8,
        event_id: 114,
      },
      {
        partnerX: {
          id: 1522,
        },
        partnerY: {
          id: 1526,
        },
        round_number: 8,
        event_id: 114,
      },
      {
        partnerX: {
          id: 1577,
        },
        partnerY: {
          id: 55,
        },
        round_number: 8,
        event_id: 114,
      },
      {
        partnerX: {
          id: 121,
        },
        partnerY: {
          id: 1474,
        },
        round_number: 8,
        event_id: 114,
      },
      {
        partnerX: {
          id: 1523,
        },
        partnerY: {
          id: 1556,
        },
        round_number: 8,
        event_id: 114,
      },
      {
        partnerX: {
          id: 1490,
        },
        partnerY: {
          id: 1608,
        },
        round_number: 8,
        event_id: 114,
      },
      {
        partnerX: {
          id: 1485,
        },
        partnerY: {
          id: 1489,
        },
        round_number: 8,
        event_id: 114,
      },
      {
        partnerX: {
          id: 1474,
        },
        partnerY: {
          id: 1490,
        },
        round_number: 11,
        event_id: 114,
      },
      {
        partnerX: {
          id: 1556,
        },
        partnerY: {
          id: 1604,
        },
        round_number: 11,
        event_id: 114,
      },
      {
        partnerX: {
          id: 1485,
        },
        partnerY: {
          id: 1526,
        },
        round_number: 11,
        event_id: 114,
      },
      {
        partnerX: {
          id: 1577,
        },
        partnerY: {
          id: 1579,
        },
        round_number: 11,
        event_id: 114,
      },
      {
        partnerX: {
          id: 1523,
        },
        partnerY: {
          id: 1608,
        },
        round_number: 11,
        event_id: 114,
      },
      {
        partnerX: {
          id: 1483,
        },
        partnerY: {
          id: 1579,
        },
        round_number: 9,
        event_id: 114,
      },
      {
        partnerX: {
          id: 1472,
        },
        partnerY: {
          id: 1601,
        },
        round_number: 11,
        event_id: 114,
      },
      {
        partnerX: {
          id: 1489,
        },
        partnerY: {
          id: 1577,
        },
        round_number: 9,
        event_id: 114,
      },
      {
        partnerX: {
          id: 1474,
        },
        partnerY: {
          id: 1485,
        },
        round_number: 9,
        event_id: 114,
      },
      {
        partnerX: {
          id: 12,
        },
        partnerY: {
          id: 1556,
        },
        round_number: 9,
        event_id: 114,
      },
      {
        partnerX: {
          id: 1550,
        },
        partnerY: {
          id: 55,
        },
        round_number: 9,
        event_id: 114,
      },
      {
        partnerX: {
          id: 1523,
        },
        partnerY: {
          id: 1586,
        },
        round_number: 9,
        event_id: 114,
      },
      {
        partnerX: {
          id: 1490,
        },
        partnerY: {
          id: 1522,
        },
        round_number: 9,
        event_id: 114,
      },
      {
        partnerX: {
          id: 1526,
        },
        partnerY: {
          id: 1601,
        },
        round_number: 9,
        event_id: 114,
      },
      {
        partnerX: {
          id: 1484,
        },
        partnerY: {
          id: 1547,
        },
        round_number: 9,
        event_id: 114,
      },
      {
        partnerX: {
          id: 12,
        },
        partnerY: {
          id: 1547,
        },
        round_number: 11,
        event_id: 114,
      },
      {
        partnerX: {
          id: 1556,
        },
        partnerY: {
          id: 1601,
        },
        round_number: 10,
        event_id: 114,
      },
      {
        partnerX: {
          id: 1526,
        },
        partnerY: {
          id: 1608,
        },
        round_number: 10,
        event_id: 114,
      },
      {
        partnerX: {
          id: 1485,
        },
        partnerY: {
          id: 1508,
        },
        round_number: 10,
        event_id: 114,
      },
      {
        partnerX: {
          id: 1523,
        },
        partnerY: {
          id: 1550,
        },
        round_number: 10,
        event_id: 114,
      },
      {
        partnerX: {
          id: 1490,
        },
        partnerY: {
          id: 1577,
        },
        round_number: 10,
        event_id: 114,
      },
      {
        partnerX: {
          id: 1579,
        },
        partnerY: {
          id: 1603,
        },
        round_number: 10,
        event_id: 114,
      },
      {
        partnerX: {
          id: 1472,
        },
        partnerY: {
          id: 1547,
        },
        round_number: 10,
        event_id: 114,
      },
      {
        partnerX: {
          id: 115,
        },
        partnerY: {
          id: 476,
        },
        round_number: 1,
        event_id: 105,
      },
      {
        partnerX: {
          id: 595,
        },
        partnerY: {
          id: 965,
        },
        round_number: 1,
        event_id: 105,
      },
      {
        partnerX: {
          id: 1489,
        },
        partnerY: {
          id: 1523,
        },
        round_number: 12,
        event_id: 114,
      },
      {
        partnerX: {
          id: 1572,
        },
        partnerY: {
          id: 8,
        },
        round_number: 1,
        event_id: 105,
      },
      {
        partnerX: {
          id: 1522,
        },
        partnerY: {
          id: 55,
        },
        round_number: 12,
        event_id: 114,
      },
      {
        partnerX: {
          id: 1550,
        },
        partnerY: {
          id: 1577,
        },
        round_number: 12,
        event_id: 114,
      },
      {
        partnerX: {
          id: 1490,
        },
        partnerY: {
          id: 1556,
        },
        round_number: 12,
        event_id: 114,
      },
      {
        partnerX: {
          id: 1372,
        },
        partnerY: {
          id: 52,
        },
        round_number: 1,
        event_id: 105,
      },
      {
        partnerX: {
          id: 1536,
        },
        partnerY: {
          id: 612,
        },
        round_number: 1,
        event_id: 105,
      },
      {
        partnerX: {
          id: 1372,
        },
        partnerY: {
          id: 379,
        },
        round_number: 2,
        event_id: 105,
      },
      {
        partnerX: {
          id: 1208,
        },
        partnerY: {
          id: 34,
        },
        round_number: 1,
        event_id: 105,
      },
      {
        partnerX: {
          id: 12,
        },
        partnerY: {
          id: 474,
        },
        round_number: 1,
        event_id: 105,
      },
      {
        partnerX: {
          id: 1578,
        },
        partnerY: {
          id: 1594,
        },
        round_number: 1,
        event_id: 105,
      },
      {
        partnerX: {
          id: 1572,
        },
        partnerY: {
          id: 1614,
        },
        round_number: 2,
        event_id: 105,
      },
      {
        partnerX: {
          id: 1071,
        },
        partnerY: {
          id: 34,
        },
        round_number: 2,
        event_id: 105,
      },
      {
        partnerX: {
          id: 1531,
        },
        partnerY: {
          id: 605,
        },
        round_number: 2,
        event_id: 105,
      },
      {
        partnerX: {
          id: 115,
        },
        partnerY: {
          id: 1615,
        },
        round_number: 2,
        event_id: 105,
      },
      {
        partnerX: {
          id: 1533,
        },
        partnerY: {
          id: 52,
        },
        round_number: 2,
        event_id: 105,
      },
      {
        partnerX: {
          id: 1536,
        },
        partnerY: {
          id: 1587,
        },
        round_number: 2,
        event_id: 105,
      },
      {
        partnerX: {
          id: 474,
        },
        partnerY: {
          id: 965,
        },
        round_number: 2,
        event_id: 105,
      },
      {
        partnerX: {
          id: 1258,
        },
        partnerY: {
          id: 52,
        },
        round_number: 4,
        event_id: 105,
      },
      {
        partnerX: {
          id: 1531,
        },
        partnerY: {
          id: 1615,
        },
        round_number: 3,
        event_id: 105,
      },
      {
        partnerX: {
          id: 1071,
        },
        partnerY: {
          id: 8,
        },
        round_number: 3,
        event_id: 105,
      },
      {
        partnerX: {
          id: 115,
        },
        partnerY: {
          id: 379,
        },
        round_number: 3,
        event_id: 105,
      },
      {
        partnerX: {
          id: 1578,
        },
        partnerY: {
          id: 52,
        },
        round_number: 3,
        event_id: 105,
      },
      {
        partnerX: {
          id: 1533,
        },
        partnerY: {
          id: 476,
        },
        round_number: 3,
        event_id: 105,
      },
      {
        partnerX: {
          id: 12,
        },
        partnerY: {
          id: 1372,
        },
        round_number: 3,
        event_id: 105,
      },
      {
        partnerX: {
          id: 1272,
        },
        partnerY: {
          id: 34,
        },
        round_number: 3,
        event_id: 105,
      },
      {
        partnerX: {
          id: 1531,
        },
        partnerY: {
          id: 476,
        },
        round_number: 4,
        event_id: 105,
      },
      {
        partnerX: {
          id: 379,
        },
        partnerY: {
          id: 965,
        },
        round_number: 4,
        event_id: 105,
      },
      {
        partnerX: {
          id: 1372,
        },
        partnerY: {
          id: 1572,
        },
        round_number: 4,
        event_id: 105,
      },
      {
        partnerX: {
          id: 1594,
        },
        partnerY: {
          id: 1614,
        },
        round_number: 4,
        event_id: 105,
      },
      {
        partnerX: {
          id: 34,
        },
        partnerY: {
          id: 605,
        },
        round_number: 4,
        event_id: 105,
      },
      {
        partnerX: {
          id: 115,
        },
        partnerY: {
          id: 12,
        },
        round_number: 8,
        event_id: 129,
      },
      {
        partnerX: {
          id: 514,
        },
        partnerY: {
          id: 595,
        },
        round_number: 4,
        event_id: 105,
      },
      {
        partnerX: {
          id: 12,
        },
        partnerY: {
          id: 1588,
        },
        round_number: 4,
        event_id: 105,
      },
      {
        partnerX: {
          id: 1208,
        },
        partnerY: {
          id: 1587,
        },
        round_number: 4,
        event_id: 105,
      },
      {
        partnerX: {
          id: 12,
        },
        partnerY: {
          id: 1208,
        },
        round_number: 1,
        event_id: 120,
      },
      {
        partnerX: {
          id: 1678,
        },
        partnerY: {
          id: 1786,
        },
        round_number: 1,
        event_id: 120,
      },
      {
        partnerX: {
          id: 1734,
        },
        partnerY: {
          id: 1739,
        },
        round_number: 1,
        event_id: 120,
      },
      {
        partnerX: {
          id: 1071,
        },
        partnerY: {
          id: 1578,
        },
        round_number: 8,
        event_id: 129,
      },
      {
        partnerX: {
          id: 1682,
        },
        partnerY: {
          id: 1683,
        },
        round_number: 10,
        event_id: 123,
      },
      {
        partnerX: {
          id: 1600,
        },
        partnerY: {
          id: 1685,
        },
        round_number: 10,
        event_id: 123,
      },
      {
        partnerX: {
          id: 1655,
        },
        partnerY: {
          id: 1724,
        },
        round_number: 10,
        event_id: 123,
      },
      {
        partnerX: {
          id: 1536,
        },
        partnerY: {
          id: 1933,
        },
        round_number: 8,
        event_id: 129,
      },
      {
        partnerX: {
          id: 1071,
        },
        partnerY: {
          id: 1791,
        },
        round_number: 10,
        event_id: 123,
      },
      {
        partnerX: {
          id: 1681,
        },
        partnerY: {
          id: 1830,
        },
        round_number: 10,
        event_id: 123,
      },
      {
        partnerX: {
          id: 1700,
        },
        partnerY: {
          id: 1801,
        },
        round_number: 10,
        event_id: 123,
      },
      {
        partnerX: {
          id: 1653,
        },
        partnerY: {
          id: 1826,
        },
        round_number: 10,
        event_id: 123,
      },
      {
        partnerX: {
          id: 1623,
        },
        partnerY: {
          id: 1929,
        },
        round_number: 8,
        event_id: 129,
      },
      {
        partnerX: {
          id: 1848,
        },
        partnerY: {
          id: 1933,
        },
        round_number: 4,
        event_id: 131,
      },
      {
        partnerX: {
          id: 1925,
        },
        partnerY: {
          id: 8,
        },
        round_number: 4,
        event_id: 131,
      },
      {
        partnerX: {
          id: 1837,
        },
        partnerY: {
          id: 1958,
        },
        round_number: 4,
        event_id: 131,
      },
      {
        partnerX: {
          id: 1071,
        },
        partnerY: {
          id: 115,
        },
        round_number: 4,
        event_id: 131,
      },
      {
        partnerX: {
          id: 1901,
        },
        partnerY: {
          id: 1906,
        },
        round_number: 4,
        event_id: 131,
      },
      {
        partnerX: {
          id: 1862,
        },
        partnerY: {
          id: 8,
        },
        round_number: 8,
        event_id: 129,
      },
      {
        partnerX: {
          id: 1816,
        },
        partnerY: {
          id: 595,
        },
        round_number: 8,
        event_id: 129,
      },
      {
        partnerX: {
          id: 1857,
        },
        partnerY: {
          id: 34,
        },
        round_number: 8,
        event_id: 129,
      },
      {
        partnerX: {
          id: 385,
        },
        partnerY: {
          id: 506,
        },
        round_number: 8,
        event_id: 129,
      },
      {
        partnerX: {
          id: 1862,
        },
        partnerY: {
          id: 1937,
        },
        round_number: 1,
        event_id: 129,
      },
      {
        partnerX: {
          id: 12,
        },
        partnerY: {
          id: 506,
        },
        round_number: 1,
        event_id: 129,
      },
      {
        partnerX: {
          id: 1599,
        },
        partnerY: {
          id: 1937,
        },
        round_number: 8,
        event_id: 129,
      },
      {
        partnerX: {
          id: 1725,
        },
        partnerY: {
          id: 1853,
        },
        round_number: 1,
        event_id: 129,
      },
      {
        partnerX: {
          id: 1629,
        },
        partnerY: {
          id: 1929,
        },
        round_number: 1,
        event_id: 129,
      },
      {
        partnerX: {
          id: 1599,
        },
        partnerY: {
          id: 1857,
        },
        round_number: 1,
        event_id: 129,
      },
      {
        partnerX: {
          id: 1816,
        },
        partnerY: {
          id: 1933,
        },
        round_number: 1,
        event_id: 129,
      },
      {
        partnerX: {
          id: 319,
        },
        partnerY: {
          id: 947,
        },
        round_number: 3,
        event_id: 130,
      },
      {
        partnerX: {
          id: 1536,
        },
        partnerY: {
          id: 1691,
        },
        round_number: 8,
        event_id: 132,
      },
      {
        partnerX: {
          id: 1691,
        },
        partnerY: {
          id: 513,
        },
        round_number: 5,
        event_id: 132,
      },
      {
        partnerX: {
          id: 1933,
        },
        partnerY: {
          id: 1993,
        },
        round_number: 3,
        event_id: 130,
      },
      {
        partnerX: {
          id: 1071,
        },
        partnerY: {
          id: 34,
        },
        round_number: 3,
        event_id: 130,
      },
      {
        partnerX: {
          id: 2003,
        },
        partnerY: {
          id: 596,
        },
        round_number: 3,
        event_id: 130,
      },
      {
        partnerX: {
          id: 1864,
        },
        partnerY: {
          id: 1962,
        },
        round_number: 3,
        event_id: 130,
      },
      {
        partnerX: {
          id: 1635,
        },
        partnerY: {
          id: 1974,
        },
        round_number: 8,
        event_id: 132,
      },
      {
        partnerX: {
          id: 1840,
        },
        partnerY: {
          id: 1901,
        },
        round_number: 3,
        event_id: 130,
      },
      {
        partnerX: {
          id: 1989,
        },
        partnerY: {
          id: 34,
        },
        round_number: 5,
        event_id: 132,
      },
      {
        partnerX: {
          id: 1536,
        },
        partnerY: {
          id: 1918,
        },
        round_number: 5,
        event_id: 132,
      },
      {
        partnerX: {
          id: 1152,
        },
        partnerY: {
          id: 12,
        },
        round_number: 5,
        event_id: 132,
      },
      {
        partnerX: {
          id: 1933,
        },
        partnerY: {
          id: 2019,
        },
        round_number: 5,
        event_id: 132,
      },
      {
        partnerX: {
          id: 1578,
        },
        partnerY: {
          id: 34,
        },
        round_number: 8,
        event_id: 132,
      },
      {
        partnerX: {
          id: 12,
        },
        partnerY: {
          id: 513,
        },
        round_number: 8,
        event_id: 132,
      },
      {
        partnerX: {
          id: 1152,
        },
        partnerY: {
          id: 1989,
        },
        round_number: 8,
        event_id: 132,
      },
      {
        partnerX: {
          id: 1071,
        },
        partnerY: {
          id: 1821,
        },
        round_number: 1,
        event_id: 134,
      },
      {
        partnerX: {
          id: 1901,
        },
        partnerY: {
          id: 1985,
        },
        round_number: 1,
        event_id: 134,
      },
      {
        partnerX: {
          id: 1600,
        },
        partnerY: {
          id: 1821,
        },
        round_number: 2,
        event_id: 134,
      },
      {
        partnerX: {
          id: 1685,
        },
        partnerY: {
          id: 506,
        },
        round_number: 2,
        event_id: 134,
      },
      {
        partnerX: {
          id: 1901,
        },
        partnerY: {
          id: 2015,
        },
        round_number: 2,
        event_id: 134,
      },
      {
        partnerX: {
          id: 1536,
        },
        partnerY: {
          id: 605,
        },
        round_number: 3,
        event_id: 105,
      },
      {
        partnerX: {
          id: 1617,
        },
        partnerY: {
          id: 1629,
        },
        round_number: 2,
        event_id: 106,
      },
      {
        partnerX: {
          id: 1208,
        },
        partnerY: {
          id: 605,
        },
        round_number: 5,
        event_id: 105,
      },
      {
        partnerX: {
          id: 1258,
        },
        partnerY: {
          id: 514,
        },
        round_number: 5,
        event_id: 105,
      },
      {
        partnerX: {
          id: 1071,
        },
        partnerY: {
          id: 595,
        },
        round_number: 8,
        event_id: 105,
      },
      {
        partnerX: {
          id: 115,
        },
        partnerY: {
          id: 588,
        },
        round_number: 8,
        event_id: 105,
      },
      {
        partnerX: {
          id: 1565,
        },
        partnerY: {
          id: 1569,
        },
        round_number: 2,
        event_id: 106,
      },
      {
        partnerX: {
          id: 1071,
        },
        partnerY: {
          id: 379,
        },
        round_number: 5,
        event_id: 105,
      },
      {
        partnerX: {
          id: 115,
        },
        partnerY: {
          id: 1372,
        },
        round_number: 5,
        event_id: 105,
      },
      {
        partnerX: {
          id: 1572,
        },
        partnerY: {
          id: 965,
        },
        round_number: 5,
        event_id: 105,
      },
      {
        partnerX: {
          id: 476,
        },
        partnerY: {
          id: 965,
        },
        round_number: 8,
        event_id: 105,
      },
      {
        partnerX: {
          id: 1546,
        },
        partnerY: {
          id: 319,
        },
        round_number: 2,
        event_id: 106,
      },
      {
        partnerX: {
          id: 1531,
        },
        partnerY: {
          id: 474,
        },
        round_number: 5,
        event_id: 105,
      },
      {
        partnerX: {
          id: 12,
        },
        partnerY: {
          id: 1208,
        },
        round_number: 8,
        event_id: 105,
      },
      {
        partnerX: {
          id: 1588,
        },
        partnerY: {
          id: 612,
        },
        round_number: 5,
        event_id: 105,
      },
      {
        partnerX: {
          id: 1533,
        },
        partnerY: {
          id: 595,
        },
        round_number: 5,
        event_id: 105,
      },
      {
        partnerX: {
          id: 1614,
        },
        partnerY: {
          id: 52,
        },
        round_number: 5,
        event_id: 105,
      },
      {
        partnerX: {
          id: 34,
        },
        partnerY: {
          id: 476,
        },
        round_number: 5,
        event_id: 105,
      },
      {
        partnerX: {
          id: 1488,
        },
        partnerY: {
          id: 8,
        },
        round_number: 5,
        event_id: 105,
      },
      {
        partnerX: {
          id: 1588,
        },
        partnerY: {
          id: 8,
        },
        round_number: 8,
        event_id: 105,
      },
      {
        partnerX: {
          id: 1548,
        },
        partnerY: {
          id: 1628,
        },
        round_number: 2,
        event_id: 106,
      },
      {
        partnerX: {
          id: 1570,
        },
        partnerY: {
          id: 1610,
        },
        round_number: 2,
        event_id: 106,
      },
      {
        partnerX: {
          id: 1572,
        },
        partnerY: {
          id: 605,
        },
        round_number: 8,
        event_id: 105,
      },
      {
        partnerX: {
          id: 379,
        },
        partnerY: {
          id: 612,
        },
        round_number: 8,
        event_id: 105,
      },
      {
        partnerX: {
          id: 115,
        },
        partnerY: {
          id: 1533,
        },
        round_number: 6,
        event_id: 105,
      },
      {
        partnerX: {
          id: 1208,
        },
        partnerY: {
          id: 1618,
        },
        round_number: 2,
        event_id: 106,
      },
      {
        partnerX: {
          id: 1108,
        },
        partnerY: {
          id: 1614,
        },
        round_number: 8,
        event_id: 105,
      },
      {
        partnerX: {
          id: 1372,
        },
        partnerY: {
          id: 476,
        },
        round_number: 6,
        event_id: 105,
      },
      {
        partnerX: {
          id: 1071,
        },
        partnerY: {
          id: 1208,
        },
        round_number: 6,
        event_id: 105,
      },
      {
        partnerX: {
          id: 1614,
        },
        partnerY: {
          id: 8,
        },
        round_number: 6,
        event_id: 105,
      },
      {
        partnerX: {
          id: 1488,
        },
        partnerY: {
          id: 605,
        },
        round_number: 6,
        event_id: 105,
      },
      {
        partnerX: {
          id: 1572,
        },
        partnerY: {
          id: 1578,
        },
        round_number: 6,
        event_id: 105,
      },
      {
        partnerX: {
          id: 1587,
        },
        partnerY: {
          id: 965,
        },
        round_number: 6,
        event_id: 105,
      },
      {
        partnerX: {
          id: 1531,
        },
        partnerY: {
          id: 514,
        },
        round_number: 6,
        event_id: 105,
      },
      {
        partnerX: {
          id: 1488,
        },
        partnerY: {
          id: 514,
        },
        round_number: 8,
        event_id: 105,
      },
      {
        partnerX: {
          id: 34,
        },
        partnerY: {
          id: 612,
        },
        round_number: 6,
        event_id: 105,
      },
      {
        partnerX: {
          id: 1272,
        },
        partnerY: {
          id: 595,
        },
        round_number: 6,
        event_id: 105,
      },
      {
        partnerX: {
          id: 379,
        },
        partnerY: {
          id: 52,
        },
        round_number: 6,
        event_id: 105,
      },
      {
        partnerX: {
          id: 1208,
        },
        partnerY: {
          id: 1533,
        },
        round_number: 7,
        event_id: 105,
      },
      {
        partnerX: {
          id: 115,
        },
        partnerY: {
          id: 8,
        },
        round_number: 1,
        event_id: 121,
      },
      {
        partnerX: {
          id: 12,
        },
        partnerY: {
          id: 1572,
        },
        round_number: 7,
        event_id: 105,
      },
      {
        partnerX: {
          id: 115,
        },
        partnerY: {
          id: 595,
        },
        round_number: 7,
        event_id: 105,
      },
      {
        partnerX: {
          id: 1678,
        },
        partnerY: {
          id: 1739,
        },
        round_number: 3,
        event_id: 120,
      },
      {
        partnerX: {
          id: 1372,
        },
        partnerY: {
          id: 588,
        },
        round_number: 7,
        event_id: 105,
      },
      {
        partnerX: {
          id: 115,
        },
        partnerY: {
          id: 1624,
        },
        round_number: 2,
        event_id: 121,
      },
      {
        partnerX: {
          id: 1587,
        },
        partnerY: {
          id: 476,
        },
        round_number: 7,
        event_id: 105,
      },
      {
        partnerX: {
          id: 1071,
        },
        partnerY: {
          id: 605,
        },
        round_number: 7,
        event_id: 105,
      },
      {
        partnerX: {
          id: 34,
        },
        partnerY: {
          id: 8,
        },
        round_number: 7,
        event_id: 105,
      },
      {
        partnerX: {
          id: 514,
        },
        partnerY: {
          id: 52,
        },
        round_number: 7,
        event_id: 105,
      },
      {
        partnerX: {
          id: 1071,
        },
        partnerY: {
          id: 8,
        },
        round_number: 2,
        event_id: 106,
      },
      {
        partnerX: {
          id: 1619,
        },
        partnerY: {
          id: 34,
        },
        round_number: 2,
        event_id: 106,
      },
      {
        partnerX: {
          id: 1631,
        },
        partnerY: {
          id: 913,
        },
        round_number: 2,
        event_id: 106,
      },
      {
        partnerX: {
          id: 1617,
        },
        partnerY: {
          id: 1620,
        },
        round_number: 3,
        event_id: 106,
      },
      {
        partnerX: {
          id: 1620,
        },
        partnerY: {
          id: 1622,
        },
        round_number: 2,
        event_id: 106,
      },
      {
        partnerX: {
          id: 1566,
        },
        partnerY: {
          id: 1567,
        },
        round_number: 2,
        event_id: 106,
      },
      {
        partnerX: {
          id: 1208,
        },
        partnerY: {
          id: 1739,
        },
        round_number: 2,
        event_id: 120,
      },
      {
        partnerX: {
          id: 12,
        },
        partnerY: {
          id: 1678,
        },
        round_number: 2,
        event_id: 120,
      },
      {
        partnerX: {
          id: 1824,
        },
        partnerY: {
          id: 1831,
        },
        round_number: 10,
        event_id: 123,
      },
      {
        partnerX: {
          id: 1208,
        },
        partnerY: {
          id: 1600,
        },
        round_number: 3,
        event_id: 106,
      },
      {
        partnerX: {
          id: 1681,
        },
        partnerY: {
          id: 1682,
        },
        round_number: 11,
        event_id: 123,
      },
      {
        partnerX: {
          id: 1653,
        },
        partnerY: {
          id: 1827,
        },
        round_number: 11,
        event_id: 123,
      },
      {
        partnerX: {
          id: 1683,
        },
        partnerY: {
          id: 1791,
        },
        round_number: 11,
        event_id: 123,
      },
      {
        partnerX: {
          id: 1600,
        },
        partnerY: {
          id: 1824,
        },
        round_number: 11,
        event_id: 123,
      },
      {
        partnerX: {
          id: 1655,
        },
        partnerY: {
          id: 1801,
        },
        round_number: 11,
        event_id: 123,
      },
      {
        partnerX: {
          id: 1724,
        },
        partnerY: {
          id: 1830,
        },
        round_number: 11,
        event_id: 123,
      },
      {
        partnerX: {
          id: 1686,
        },
        partnerY: {
          id: 1826,
        },
        round_number: 11,
        event_id: 123,
      },
      {
        partnerX: {
          id: 1700,
        },
        partnerY: {
          id: 1823,
        },
        round_number: 11,
        event_id: 123,
      },
      {
        partnerX: {
          id: 1681,
        },
        partnerY: {
          id: 1824,
        },
        round_number: 12,
        event_id: 123,
      },
      {
        partnerX: {
          id: 1686,
        },
        partnerY: {
          id: 1801,
        },
        round_number: 12,
        event_id: 123,
      },
      {
        partnerX: {
          id: 1700,
        },
        partnerY: {
          id: 1830,
        },
        round_number: 12,
        event_id: 123,
      },
      {
        partnerX: {
          id: 1629,
        },
        partnerY: {
          id: 34,
        },
        round_number: 3,
        event_id: 106,
      },
      {
        partnerX: {
          id: 1619,
        },
        partnerY: {
          id: 1630,
        },
        round_number: 3,
        event_id: 106,
      },
      {
        partnerX: {
          id: 1566,
        },
        partnerY: {
          id: 8,
        },
        round_number: 3,
        event_id: 106,
      },
      {
        partnerX: {
          id: 1071,
        },
        partnerY: {
          id: 1628,
        },
        round_number: 3,
        event_id: 106,
      },
      {
        partnerX: {
          id: 1570,
        },
        partnerY: {
          id: 1584,
        },
        round_number: 3,
        event_id: 106,
      },
      {
        partnerX: {
          id: 1401,
        },
        partnerY: {
          id: 913,
        },
        round_number: 3,
        event_id: 106,
      },
      {
        partnerX: {
          id: 1565,
        },
        partnerY: {
          id: 1631,
        },
        round_number: 3,
        event_id: 106,
      },
      {
        partnerX: {
          id: 1581,
        },
        partnerY: {
          id: 1599,
        },
        round_number: 3,
        event_id: 106,
      },
      {
        partnerX: {
          id: 1619,
        },
        partnerY: {
          id: 319,
        },
        round_number: 7,
        event_id: 106,
      },
      {
        partnerX: {
          id: 1610,
        },
        partnerY: {
          id: 1630,
        },
        round_number: 7,
        event_id: 106,
      },
      {
        partnerX: {
          id: 1610,
        },
        partnerY: {
          id: 1620,
        },
        round_number: 6,
        event_id: 106,
      },
      {
        partnerX: {
          id: 1618,
        },
        partnerY: {
          id: 577,
        },
        round_number: 7,
        event_id: 106,
      },
      {
        partnerX: {
          id: 1637,
        },
        partnerY: {
          id: 82,
        },
        round_number: 2,
        event_id: 116,
      },
      {
        partnerX: {
          id: 577,
        },
        partnerY: {
          id: 8,
        },
        round_number: 4,
        event_id: 106,
      },
      {
        partnerX: {
          id: 12,
        },
        partnerY: {
          id: 1599,
        },
        round_number: 4,
        event_id: 106,
      },
      {
        partnerX: {
          id: 1551,
        },
        partnerY: {
          id: 1584,
        },
        round_number: 4,
        event_id: 106,
      },
      {
        partnerX: {
          id: 1622,
        },
        partnerY: {
          id: 319,
        },
        round_number: 4,
        event_id: 106,
      },
      {
        partnerX: {
          id: 1581,
        },
        partnerY: {
          id: 577,
        },
        round_number: 6,
        event_id: 106,
      },
      {
        partnerX: {
          id: 1567,
        },
        partnerY: {
          id: 1620,
        },
        round_number: 7,
        event_id: 106,
      },
      {
        partnerX: {
          id: 1071,
        },
        partnerY: {
          id: 1581,
        },
        round_number: 4,
        event_id: 106,
      },
      {
        partnerX: {
          id: 1618,
        },
        partnerY: {
          id: 1619,
        },
        round_number: 4,
        event_id: 106,
      },
      {
        partnerX: {
          id: 1567,
        },
        partnerY: {
          id: 1631,
        },
        round_number: 4,
        event_id: 106,
      },
      {
        partnerX: {
          id: 1548,
        },
        partnerY: {
          id: 1630,
        },
        round_number: 4,
        event_id: 106,
      },
      {
        partnerX: {
          id: 1620,
        },
        partnerY: {
          id: 34,
        },
        round_number: 4,
        event_id: 106,
      },
      {
        partnerX: {
          id: 1610,
        },
        partnerY: {
          id: 1629,
        },
        round_number: 4,
        event_id: 106,
      },
      {
        partnerX: {
          id: 1570,
        },
        partnerY: {
          id: 1600,
        },
        round_number: 4,
        event_id: 106,
      },
      {
        partnerX: {
          id: 1071,
        },
        partnerY: {
          id: 1631,
        },
        round_number: 6,
        event_id: 106,
      },
      {
        partnerX: {
          id: 1570,
        },
        partnerY: {
          id: 1581,
        },
        round_number: 7,
        event_id: 106,
      },
      {
        partnerX: {
          id: 1208,
        },
        partnerY: {
          id: 1619,
        },
        round_number: 6,
        event_id: 106,
      },
      {
        partnerX: {
          id: 1584,
        },
        partnerY: {
          id: 1630,
        },
        round_number: 6,
        event_id: 106,
      },
      {
        partnerX: {
          id: 1600,
        },
        partnerY: {
          id: 34,
        },
        round_number: 7,
        event_id: 106,
      },
      {
        partnerX: {
          id: 1599,
        },
        partnerY: {
          id: 1617,
        },
        round_number: 5,
        event_id: 106,
      },
      {
        partnerX: {
          id: 1548,
        },
        partnerY: {
          id: 1566,
        },
        round_number: 5,
        event_id: 106,
      },
      {
        partnerX: {
          id: 1566,
        },
        partnerY: {
          id: 1629,
        },
        round_number: 6,
        event_id: 106,
      },
      {
        partnerX: {
          id: 1567,
        },
        partnerY: {
          id: 1622,
        },
        round_number: 6,
        event_id: 106,
      },
      {
        partnerX: {
          id: 1628,
        },
        partnerY: {
          id: 8,
        },
        round_number: 5,
        event_id: 106,
      },
      {
        partnerX: {
          id: 12,
        },
        partnerY: {
          id: 8,
        },
        round_number: 6,
        event_id: 106,
      },
      {
        partnerX: {
          id: 1208,
        },
        partnerY: {
          id: 1622,
        },
        round_number: 5,
        event_id: 106,
      },
      {
        partnerX: {
          id: 1624,
        },
        partnerY: {
          id: 1630,
        },
        round_number: 5,
        event_id: 106,
      },
      {
        partnerX: {
          id: 1628,
        },
        partnerY: {
          id: 913,
        },
        round_number: 6,
        event_id: 106,
      },
      {
        partnerX: {
          id: 1600,
        },
        partnerY: {
          id: 1631,
        },
        round_number: 5,
        event_id: 106,
      },
      {
        partnerX: {
          id: 1569,
        },
        partnerY: {
          id: 1584,
        },
        round_number: 5,
        event_id: 106,
      },
      {
        partnerX: {
          id: 12,
        },
        partnerY: {
          id: 577,
        },
        round_number: 5,
        event_id: 106,
      },
      {
        partnerX: {
          id: 1071,
        },
        partnerY: {
          id: 913,
        },
        round_number: 5,
        event_id: 106,
      },
      {
        partnerX: {
          id: 1569,
        },
        partnerY: {
          id: 34,
        },
        round_number: 6,
        event_id: 106,
      },
      {
        partnerX: {
          id: 1570,
        },
        partnerY: {
          id: 1619,
        },
        round_number: 5,
        event_id: 106,
      },
      {
        partnerX: {
          id: 1567,
        },
        partnerY: {
          id: 34,
        },
        round_number: 5,
        event_id: 106,
      },
      {
        partnerX: {
          id: 12,
        },
        partnerY: {
          id: 1401,
        },
        round_number: 7,
        event_id: 106,
      },
      {
        partnerX: {
          id: 1600,
        },
        partnerY: {
          id: 319,
        },
        round_number: 6,
        event_id: 106,
      },
      {
        partnerX: {
          id: 1570,
        },
        partnerY: {
          id: 8,
        },
        round_number: 8,
        event_id: 106,
      },
      {
        partnerX: {
          id: 1618,
        },
        partnerY: {
          id: 1628,
        },
        round_number: 8,
        event_id: 106,
      },
      {
        partnerX: {
          id: 1629,
        },
        partnerY: {
          id: 8,
        },
        round_number: 7,
        event_id: 106,
      },
      {
        partnerX: {
          id: 1566,
        },
        partnerY: {
          id: 319,
        },
        round_number: 8,
        event_id: 106,
      },
      {
        partnerX: {
          id: 1599,
        },
        partnerY: {
          id: 1622,
        },
        round_number: 7,
        event_id: 106,
      },
      {
        partnerX: {
          id: 1208,
        },
        partnerY: {
          id: 1628,
        },
        round_number: 7,
        event_id: 106,
      },
      {
        partnerX: {
          id: 1208,
        },
        partnerY: {
          id: 1629,
        },
        round_number: 8,
        event_id: 106,
      },
      {
        partnerX: {
          id: 1566,
        },
        partnerY: {
          id: 1631,
        },
        round_number: 7,
        event_id: 106,
      },
      {
        partnerX: {
          id: 12,
        },
        partnerY: {
          id: 1640,
        },
        round_number: 2,
        event_id: 116,
      },
      {
        partnerX: {
          id: 1208,
        },
        partnerY: {
          id: 1607,
        },
        round_number: 1,
        event_id: 116,
      },
      {
        partnerX: {
          id: 1157,
        },
        partnerY: {
          id: 1640,
        },
        round_number: 3,
        event_id: 116,
      },
      {
        partnerX: {
          id: 34,
        },
        partnerY: {
          id: 913,
        },
        round_number: 8,
        event_id: 106,
      },
      {
        partnerX: {
          id: 1569,
        },
        partnerY: {
          id: 1610,
        },
        round_number: 8,
        event_id: 106,
      },
      {
        partnerX: {
          id: 1157,
        },
        partnerY: {
          id: 1636,
        },
        round_number: 1,
        event_id: 116,
      },
      {
        partnerX: {
          id: 1620,
        },
        partnerY: {
          id: 1630,
        },
        round_number: 8,
        event_id: 106,
      },
      {
        partnerX: {
          id: 1619,
        },
        partnerY: {
          id: 577,
        },
        round_number: 8,
        event_id: 106,
      },
      {
        partnerX: {
          id: 1071,
        },
        partnerY: {
          id: 1567,
        },
        round_number: 8,
        event_id: 106,
      },
      {
        partnerX: {
          id: 1625,
        },
        partnerY: {
          id: 1637,
        },
        round_number: 1,
        event_id: 116,
      },
      {
        partnerX: {
          id: 1591,
        },
        partnerY: {
          id: 82,
        },
        round_number: 1,
        event_id: 116,
      },
      {
        partnerX: {
          id: 1591,
        },
        partnerY: {
          id: 1636,
        },
        round_number: 2,
        event_id: 116,
      },
      {
        partnerX: {
          id: 1157,
        },
        partnerY: {
          id: 1592,
        },
        round_number: 2,
        event_id: 116,
      },
      {
        partnerX: {
          id: 1152,
        },
        partnerY: {
          id: 1635,
        },
        round_number: 2,
        event_id: 116,
      },
      {
        partnerX: {
          id: 1597,
        },
        partnerY: {
          id: 1625,
        },
        round_number: 2,
        event_id: 116,
      },
      {
        partnerX: {
          id: 1625,
        },
        partnerY: {
          id: 82,
        },
        round_number: 3,
        event_id: 116,
      },
      {
        partnerX: {
          id: 1208,
        },
        partnerY: {
          id: 1592,
        },
        round_number: 3,
        event_id: 116,
      },
      {
        partnerX: {
          id: 12,
        },
        partnerY: {
          id: 1591,
        },
        round_number: 3,
        event_id: 116,
      },
      {
        partnerX: {
          id: 1635,
        },
        partnerY: {
          id: 34,
        },
        round_number: 3,
        event_id: 116,
      },
      {
        partnerX: {
          id: 1152,
        },
        partnerY: {
          id: 1636,
        },
        round_number: 3,
        event_id: 116,
      },
      {
        partnerX: {
          id: 1636,
        },
        partnerY: {
          id: 82,
        },
        round_number: 4,
        event_id: 116,
      },
      {
        partnerX: {
          id: 1152,
        },
        partnerY: {
          id: 1157,
        },
        round_number: 4,
        event_id: 116,
      },
      {
        partnerX: {
          id: 1591,
        },
        partnerY: {
          id: 1597,
        },
        round_number: 4,
        event_id: 116,
      },
      {
        partnerX: {
          id: 1592,
        },
        partnerY: {
          id: 34,
        },
        round_number: 4,
        event_id: 116,
      },
      {
        partnerX: {
          id: 12,
        },
        partnerY: {
          id: 1208,
        },
        round_number: 4,
        event_id: 116,
      },
      {
        partnerX: {
          id: 1933,
        },
        partnerY: {
          id: 34,
        },
        round_number: 2,
        event_id: 129,
      },
      {
        partnerX: {
          id: 12,
        },
        partnerY: {
          id: 1734,
        },
        round_number: 3,
        event_id: 120,
      },
      {
        partnerX: {
          id: 1597,
        },
        partnerY: {
          id: 34,
        },
        round_number: 5,
        event_id: 116,
      },
      {
        partnerX: {
          id: 1592,
        },
        partnerY: {
          id: 1635,
        },
        round_number: 5,
        event_id: 116,
      },
      {
        partnerX: {
          id: 12,
        },
        partnerY: {
          id: 1625,
        },
        round_number: 5,
        event_id: 116,
      },
      {
        partnerX: {
          id: 1152,
        },
        partnerY: {
          id: 1208,
        },
        round_number: 5,
        event_id: 116,
      },
      {
        partnerX: {
          id: 1542,
        },
        partnerY: {
          id: 1636,
        },
        round_number: 5,
        event_id: 116,
      },
      {
        partnerX: {
          id: 1591,
        },
        partnerY: {
          id: 1637,
        },
        round_number: 5,
        event_id: 116,
      },
      {
        partnerX: {
          id: 1208,
        },
        partnerY: {
          id: 82,
        },
        round_number: 6,
        event_id: 116,
      },
      {
        partnerX: {
          id: 1678,
        },
        partnerY: {
          id: 1734,
        },
        round_number: 4,
        event_id: 120,
      },
      {
        partnerX: {
          id: 1597,
        },
        partnerY: {
          id: 1607,
        },
        round_number: 6,
        event_id: 116,
      },
      {
        partnerX: {
          id: 1636,
        },
        partnerY: {
          id: 1640,
        },
        round_number: 6,
        event_id: 116,
      },
      {
        partnerX: {
          id: 1157,
        },
        partnerY: {
          id: 1591,
        },
        round_number: 6,
        event_id: 116,
      },
      {
        partnerX: {
          id: 1152,
        },
        partnerY: {
          id: 12,
        },
        round_number: 6,
        event_id: 116,
      },
      {
        partnerX: {
          id: 1592,
        },
        partnerY: {
          id: 1637,
        },
        round_number: 6,
        event_id: 116,
      },
      {
        partnerX: {
          id: 1816,
        },
        partnerY: {
          id: 1937,
        },
        round_number: 2,
        event_id: 129,
      },
      {
        partnerX: {
          id: 1208,
        },
        partnerY: {
          id: 1734,
        },
        round_number: 5,
        event_id: 120,
      },
      {
        partnerX: {
          id: 12,
        },
        partnerY: {
          id: 1739,
        },
        round_number: 5,
        event_id: 120,
      },
      {
        partnerX: {
          id: 1939,
        },
        partnerY: {
          id: 595,
        },
        round_number: 2,
        event_id: 129,
      },
      {
        partnerX: {
          id: 1071,
        },
        partnerY: {
          id: 1653,
        },
        round_number: 12,
        event_id: 123,
      },
      {
        partnerX: {
          id: 1857,
        },
        partnerY: {
          id: 8,
        },
        round_number: 2,
        event_id: 129,
      },
      {
        partnerX: {
          id: 1988,
        },
        partnerY: {
          id: 513,
        },
        round_number: 2,
        event_id: 129,
      },
      {
        partnerX: {
          id: 1600,
        },
        partnerY: {
          id: 1791,
        },
        round_number: 12,
        event_id: 123,
      },
      {
        partnerX: {
          id: 1685,
        },
        partnerY: {
          id: 1826,
        },
        round_number: 12,
        event_id: 123,
      },
      {
        partnerX: {
          id: 1682,
        },
        partnerY: {
          id: 1823,
        },
        round_number: 12,
        event_id: 123,
      },
      {
        partnerX: {
          id: 1827,
        },
        partnerY: {
          id: 1831,
        },
        round_number: 12,
        event_id: 123,
      },
      {
        partnerX: {
          id: 1906,
        },
        partnerY: {
          id: 1910,
        },
        round_number: 5,
        event_id: 131,
      },
      {
        partnerX: {
          id: 1933,
        },
        partnerY: {
          id: 8,
        },
        round_number: 5,
        event_id: 131,
      },
      {
        partnerX: {
          id: 115,
        },
        partnerY: {
          id: 1693,
        },
        round_number: 5,
        event_id: 131,
      },
      {
        partnerX: {
          id: 12,
        },
        partnerY: {
          id: 1958,
        },
        round_number: 5,
        event_id: 131,
      },
      {
        partnerX: {
          id: 1901,
        },
        partnerY: {
          id: 1925,
        },
        round_number: 5,
        event_id: 131,
      },
      {
        partnerX: {
          id: 1933,
        },
        partnerY: {
          id: 385,
        },
        round_number: 9,
        event_id: 129,
      },
      {
        partnerX: {
          id: 1628,
        },
        partnerY: {
          id: 1816,
        },
        round_number: 9,
        event_id: 129,
      },
      {
        partnerX: {
          id: 12,
        },
        partnerY: {
          id: 1862,
        },
        round_number: 9,
        event_id: 129,
      },
      {
        partnerX: {
          id: 1623,
        },
        partnerY: {
          id: 1629,
        },
        round_number: 9,
        event_id: 129,
      },
      {
        partnerX: {
          id: 1071,
        },
        partnerY: {
          id: 506,
        },
        round_number: 9,
        event_id: 129,
      },
      {
        partnerX: {
          id: 12,
        },
        partnerY: {
          id: 385,
        },
        round_number: 2,
        event_id: 129,
      },
      {
        partnerX: {
          id: 1578,
        },
        partnerY: {
          id: 595,
        },
        round_number: 9,
        event_id: 129,
      },
      {
        partnerX: {
          id: 1258,
        },
        partnerY: {
          id: 8,
        },
        round_number: 9,
        event_id: 129,
      },
      {
        partnerX: {
          id: 115,
        },
        partnerY: {
          id: 1258,
        },
        round_number: 2,
        event_id: 129,
      },
      {
        partnerX: {
          id: 1578,
        },
        partnerY: {
          id: 1862,
        },
        round_number: 2,
        event_id: 129,
      },
      {
        partnerX: {
          id: 1725,
        },
        partnerY: {
          id: 1929,
        },
        round_number: 2,
        event_id: 129,
      },
      {
        partnerX: {
          id: 1071,
        },
        partnerY: {
          id: 1536,
        },
        round_number: 2,
        event_id: 129,
      },
      {
        partnerX: {
          id: 1599,
        },
        partnerY: {
          id: 1963,
        },
        round_number: 2,
        event_id: 129,
      },
      {
        partnerX: {
          id: 1864,
        },
        partnerY: {
          id: 1901,
        },
        round_number: 4,
        event_id: 130,
      },
      {
        partnerX: {
          id: 1840,
        },
        partnerY: {
          id: 1933,
        },
        round_number: 4,
        event_id: 130,
      },
      {
        partnerX: {
          id: 1857,
        },
        partnerY: {
          id: 1937,
        },
        round_number: 9,
        event_id: 129,
      },
      {
        partnerX: {
          id: 115,
        },
        partnerY: {
          id: 1536,
        },
        round_number: 9,
        event_id: 129,
      },
      {
        partnerX: {
          id: 1071,
        },
        partnerY: {
          id: 2003,
        },
        round_number: 4,
        event_id: 130,
      },
      {
        partnerX: {
          id: 513,
        },
        partnerY: {
          id: 596,
        },
        round_number: 4,
        event_id: 130,
      },
      {
        partnerX: {
          id: 1646,
        },
        partnerY: {
          id: 8,
        },
        round_number: 4,
        event_id: 130,
      },
      {
        partnerX: {
          id: 115,
        },
        partnerY: {
          id: 1864,
        },
        round_number: 7,
        event_id: 130,
      },
      {
        partnerX: {
          id: 1646,
        },
        partnerY: {
          id: 2003,
        },
        round_number: 7,
        event_id: 130,
      },
      {
        partnerX: {
          id: 1152,
        },
        partnerY: {
          id: 2019,
        },
        round_number: 6,
        event_id: 132,
      },
      {
        partnerX: {
          id: 1974,
        },
        partnerY: {
          id: 34,
        },
        round_number: 1,
        event_id: 132,
      },
      {
        partnerX: {
          id: 513,
        },
        partnerY: {
          id: 600,
        },
        round_number: 1,
        event_id: 132,
      },
      {
        partnerX: {
          id: 1578,
        },
        partnerY: {
          id: 2017,
        },
        round_number: 1,
        event_id: 132,
      },
      {
        partnerX: {
          id: 1152,
        },
        partnerY: {
          id: 1536,
        },
        round_number: 1,
        event_id: 132,
      },
      {
        partnerX: {
          id: 12,
        },
        partnerY: {
          id: 1691,
        },
        round_number: 1,
        event_id: 132,
      },
      {
        partnerX: {
          id: 1989,
        },
        partnerY: {
          id: 1992,
        },
        round_number: 1,
        event_id: 132,
      },
      {
        partnerX: {
          id: 1536,
        },
        partnerY: {
          id: 513,
        },
        round_number: 6,
        event_id: 132,
      },
      {
        partnerX: {
          id: 12,
        },
        partnerY: {
          id: 1578,
        },
        round_number: 6,
        event_id: 132,
      },
      {
        partnerX: {
          id: 1635,
        },
        partnerY: {
          id: 1691,
        },
        round_number: 6,
        event_id: 132,
      },
      {
        partnerX: {
          id: 1750,
        },
        partnerY: {
          id: 8,
        },
        round_number: 2,
        event_id: 128,
      },
      {
        partnerX: {
          id: 1715,
        },
        partnerY: {
          id: 82,
        },
        round_number: 5,
        event_id: 115,
      },
      {
        partnerX: {
          id: 1208,
        },
        partnerY: {
          id: 1625,
        },
        round_number: 7,
        event_id: 116,
      },
      {
        partnerX: {
          id: 115,
        },
        partnerY: {
          id: 225,
        },
        round_number: 2,
        event_id: 128,
      },
      {
        partnerX: {
          id: 1542,
        },
        partnerY: {
          id: 1592,
        },
        round_number: 7,
        event_id: 116,
      },
      {
        partnerX: {
          id: 1597,
        },
        partnerY: {
          id: 1637,
        },
        round_number: 7,
        event_id: 116,
      },
      {
        partnerX: {
          id: 1029,
        },
        partnerY: {
          id: 1694,
        },
        round_number: 5,
        event_id: 115,
      },
      {
        partnerX: {
          id: 12,
        },
        partnerY: {
          id: 1607,
        },
        round_number: 7,
        event_id: 116,
      },
      {
        partnerX: {
          id: 1591,
        },
        partnerY: {
          id: 1640,
        },
        round_number: 7,
        event_id: 116,
      },
      {
        partnerX: {
          id: 1687,
        },
        partnerY: {
          id: 1746,
        },
        round_number: 5,
        event_id: 115,
      },
      {
        partnerX: {
          id: 1590,
        },
        partnerY: {
          id: 1636,
        },
        round_number: 7,
        event_id: 116,
      },
      {
        partnerX: {
          id: 1152,
        },
        partnerY: {
          id: 34,
        },
        round_number: 7,
        event_id: 116,
      },
      {
        partnerX: {
          id: 1640,
        },
        partnerY: {
          id: 82,
        },
        round_number: 8,
        event_id: 116,
      },
      {
        partnerX: {
          id: 1592,
        },
        partnerY: {
          id: 1625,
        },
        round_number: 8,
        event_id: 116,
      },
      {
        partnerX: {
          id: 1208,
        },
        partnerY: {
          id: 1635,
        },
        round_number: 8,
        event_id: 116,
      },
      {
        partnerX: {
          id: 1157,
        },
        partnerY: {
          id: 34,
        },
        round_number: 8,
        event_id: 116,
      },
      {
        partnerX: {
          id: 12,
        },
        partnerY: {
          id: 1542,
        },
        round_number: 8,
        event_id: 116,
      },
      {
        partnerX: {
          id: 1674,
        },
        partnerY: {
          id: 1721,
        },
        round_number: 1,
        event_id: 118,
      },
      {
        partnerX: {
          id: 1590,
        },
        partnerY: {
          id: 1591,
        },
        round_number: 8,
        event_id: 116,
      },
      {
        partnerX: {
          id: 1607,
        },
        partnerY: {
          id: 1636,
        },
        round_number: 8,
        event_id: 116,
      },
      {
        partnerX: {
          id: 1152,
        },
        partnerY: {
          id: 1637,
        },
        round_number: 8,
        event_id: 116,
      },
      {
        partnerX: {
          id: 1029,
        },
        partnerY: {
          id: 82,
        },
        round_number: 6,
        event_id: 115,
      },
      {
        partnerX: {
          id: 1687,
        },
        partnerY: {
          id: 1715,
        },
        round_number: 6,
        event_id: 115,
      },
      {
        partnerX: {
          id: 1702,
        },
        partnerY: {
          id: 82,
        },
        round_number: 1,
        event_id: 115,
      },
      {
        partnerX: {
          id: 12,
        },
        partnerY: {
          id: 1665,
        },
        round_number: 1,
        event_id: 115,
      },
      {
        partnerX: {
          id: 12,
        },
        partnerY: {
          id: 1715,
        },
        round_number: 2,
        event_id: 115,
      },
      {
        partnerX: {
          id: 1665,
        },
        partnerY: {
          id: 1694,
        },
        round_number: 2,
        event_id: 115,
      },
      {
        partnerX: {
          id: 1744,
        },
        partnerY: {
          id: 82,
        },
        round_number: 2,
        event_id: 115,
      },
      {
        partnerX: {
          id: 12,
        },
        partnerY: {
          id: 1646,
        },
        round_number: 1,
        event_id: 118,
      },
      {
        partnerX: {
          id: 1750,
        },
        partnerY: {
          id: 225,
        },
        round_number: 3,
        event_id: 128,
      },
      {
        partnerX: {
          id: 1694,
        },
        partnerY: {
          id: 82,
        },
        round_number: 3,
        event_id: 115,
      },
      {
        partnerX: {
          id: 1029,
        },
        partnerY: {
          id: 1687,
        },
        round_number: 7,
        event_id: 115,
      },
      {
        partnerX: {
          id: 1702,
        },
        partnerY: {
          id: 1715,
        },
        round_number: 3,
        event_id: 115,
      },
      {
        partnerX: {
          id: 12,
        },
        partnerY: {
          id: 1687,
        },
        round_number: 3,
        event_id: 115,
      },
      {
        partnerX: {
          id: 1029,
        },
        partnerY: {
          id: 1665,
        },
        round_number: 3,
        event_id: 115,
      },
      {
        partnerX: {
          id: 1694,
        },
        partnerY: {
          id: 1702,
        },
        round_number: 7,
        event_id: 115,
      },
      {
        partnerX: {
          id: 115,
        },
        partnerY: {
          id: 8,
        },
        round_number: 3,
        event_id: 128,
      },
      {
        partnerX: {
          id: 1746,
        },
        partnerY: {
          id: 82,
        },
        round_number: 4,
        event_id: 115,
      },
      {
        partnerX: {
          id: 1694,
        },
        partnerY: {
          id: 1715,
        },
        round_number: 4,
        event_id: 115,
      },
      {
        partnerX: {
          id: 12,
        },
        partnerY: {
          id: 82,
        },
        round_number: 7,
        event_id: 115,
      },
      {
        partnerX: {
          id: 1687,
        },
        partnerY: {
          id: 82,
        },
        round_number: 8,
        event_id: 115,
      },
      {
        partnerX: {
          id: 12,
        },
        partnerY: {
          id: 1694,
        },
        round_number: 9,
        event_id: 115,
      },
      {
        partnerX: {
          id: 1687,
        },
        partnerY: {
          id: 1740,
        },
        round_number: 9,
        event_id: 115,
      },
      {
        partnerX: {
          id: 225,
        },
        partnerY: {
          id: 8,
        },
        round_number: 1,
        event_id: 128,
      },
      {
        partnerX: {
          id: 115,
        },
        partnerY: {
          id: 1750,
        },
        round_number: 1,
        event_id: 128,
      },
      {
        partnerX: {
          id: 115,
        },
        partnerY: {
          id: 1736,
        },
        round_number: 3,
        event_id: 118,
      },
      {
        partnerX: {
          id: 1208,
        },
        partnerY: {
          id: 1736,
        },
        round_number: 1,
        event_id: 118,
      },
      {
        partnerX: {
          id: 1258,
        },
        partnerY: {
          id: 1578,
        },
        round_number: 1,
        event_id: 118,
      },
      {
        partnerX: {
          id: 1567,
        },
        partnerY: {
          id: 526,
        },
        round_number: 1,
        event_id: 118,
      },
      {
        partnerX: {
          id: 1647,
        },
        partnerY: {
          id: 1752,
        },
        round_number: 1,
        event_id: 118,
      },
      {
        partnerX: {
          id: 1721,
        },
        partnerY: {
          id: 1736,
        },
        round_number: 2,
        event_id: 118,
      },
      {
        partnerX: {
          id: 1071,
        },
        partnerY: {
          id: 1656,
        },
        round_number: 1,
        event_id: 118,
      },
      {
        partnerX: {
          id: 1645,
        },
        partnerY: {
          id: 8,
        },
        round_number: 1,
        event_id: 118,
      },
      {
        partnerX: {
          id: 115,
        },
        partnerY: {
          id: 1677,
        },
        round_number: 1,
        event_id: 118,
      },
      {
        partnerX: {
          id: 1721,
        },
        partnerY: {
          id: 526,
        },
        round_number: 3,
        event_id: 118,
      },
      {
        partnerX: {
          id: 115,
        },
        partnerY: {
          id: 1647,
        },
        round_number: 2,
        event_id: 118,
      },
      {
        partnerX: {
          id: 1645,
        },
        partnerY: {
          id: 1673,
        },
        round_number: 2,
        event_id: 118,
      },
      {
        partnerX: {
          id: 12,
        },
        partnerY: {
          id: 1789,
        },
        round_number: 2,
        event_id: 118,
      },
      {
        partnerX: {
          id: 1567,
        },
        partnerY: {
          id: 1578,
        },
        round_number: 2,
        event_id: 118,
      },
      {
        partnerX: {
          id: 1645,
        },
        partnerY: {
          id: 1674,
        },
        round_number: 3,
        event_id: 118,
      },
      {
        partnerX: {
          id: 1567,
        },
        partnerY: {
          id: 1646,
        },
        round_number: 3,
        event_id: 118,
      },
      {
        partnerX: {
          id: 12,
        },
        partnerY: {
          id: 1752,
        },
        round_number: 3,
        event_id: 118,
      },
      {
        partnerX: {
          id: 1578,
        },
        partnerY: {
          id: 8,
        },
        round_number: 3,
        event_id: 118,
      },
      {
        partnerX: {
          id: 1656,
        },
        partnerY: {
          id: 1789,
        },
        round_number: 3,
        event_id: 118,
      },
      {
        partnerX: {
          id: 1071,
        },
        partnerY: {
          id: 1673,
        },
        round_number: 3,
        event_id: 118,
      },
      {
        partnerX: {
          id: 1208,
        },
        partnerY: {
          id: 1258,
        },
        round_number: 3,
        event_id: 118,
      },
      {
        partnerX: {
          id: 1647,
        },
        partnerY: {
          id: 1677,
        },
        round_number: 3,
        event_id: 118,
      },
      {
        partnerX: {
          id: 1645,
        },
        partnerY: {
          id: 1721,
        },
        round_number: 4,
        event_id: 118,
      },
      {
        partnerX: {
          id: 1071,
        },
        partnerY: {
          id: 1674,
        },
        round_number: 4,
        event_id: 118,
      },
      {
        partnerX: {
          id: 12,
        },
        partnerY: {
          id: 1567,
        },
        round_number: 4,
        event_id: 118,
      },
      {
        partnerX: {
          id: 115,
        },
        partnerY: {
          id: 1789,
        },
        round_number: 4,
        event_id: 118,
      },
      {
        partnerX: {
          id: 1208,
        },
        partnerY: {
          id: 1656,
        },
        round_number: 4,
        event_id: 118,
      },
      {
        partnerX: {
          id: 1646,
        },
        partnerY: {
          id: 526,
        },
        round_number: 4,
        event_id: 118,
      },
      {
        partnerX: {
          id: 1673,
        },
        partnerY: {
          id: 8,
        },
        round_number: 4,
        event_id: 118,
      },
      {
        partnerX: {
          id: 1691,
        },
        partnerY: {
          id: 1736,
        },
        round_number: 4,
        event_id: 118,
      },
      {
        partnerX: {
          id: 1071,
        },
        partnerY: {
          id: 1208,
        },
        round_number: 5,
        event_id: 118,
      },
      {
        partnerX: {
          id: 1674,
        },
        partnerY: {
          id: 8,
        },
        round_number: 8,
        event_id: 118,
      },
      {
        partnerX: {
          id: 1646,
        },
        partnerY: {
          id: 1656,
        },
        round_number: 5,
        event_id: 118,
      },
      {
        partnerX: {
          id: 1578,
        },
        partnerY: {
          id: 1736,
        },
        round_number: 5,
        event_id: 118,
      },
      {
        partnerX: {
          id: 1628,
        },
        partnerY: {
          id: 1853,
        },
        round_number: 3,
        event_id: 129,
      },
      {
        partnerX: {
          id: 1656,
        },
        partnerY: {
          id: 1792,
        },
        round_number: 8,
        event_id: 118,
      },
      {
        partnerX: {
          id: 1725,
        },
        partnerY: {
          id: 1963,
        },
        round_number: 3,
        event_id: 129,
      },
      {
        partnerX: {
          id: 1721,
        },
        partnerY: {
          id: 1752,
        },
        round_number: 5,
        event_id: 118,
      },
      {
        partnerX: {
          id: 1567,
        },
        partnerY: {
          id: 1674,
        },
        round_number: 5,
        event_id: 118,
      },
      {
        partnerX: {
          id: 1673,
        },
        partnerY: {
          id: 1691,
        },
        round_number: 5,
        event_id: 118,
      },
      {
        partnerX: {
          id: 115,
        },
        partnerY: {
          id: 8,
        },
        round_number: 5,
        event_id: 118,
      },
      {
        partnerX: {
          id: 1646,
        },
        partnerY: {
          id: 1721,
        },
        round_number: 8,
        event_id: 118,
      },
      {
        partnerX: {
          id: 1752,
        },
        partnerY: {
          id: 1789,
        },
        round_number: 8,
        event_id: 118,
      },
      {
        partnerX: {
          id: 115,
        },
        partnerY: {
          id: 1691,
        },
        round_number: 8,
        event_id: 118,
      },
      {
        partnerX: {
          id: 1208,
        },
        partnerY: {
          id: 8,
        },
        round_number: 6,
        event_id: 118,
      },
      {
        partnerX: {
          id: 1700,
        },
        partnerY: {
          id: 1826,
        },
        round_number: 1,
        event_id: 123,
      },
      {
        partnerX: {
          id: 1071,
        },
        partnerY: {
          id: 1721,
        },
        round_number: 6,
        event_id: 118,
      },
      {
        partnerX: {
          id: 1857,
        },
        partnerY: {
          id: 1933,
        },
        round_number: 3,
        event_id: 129,
      },
      {
        partnerX: {
          id: 1071,
        },
        partnerY: {
          id: 526,
        },
        round_number: 8,
        event_id: 118,
      },
      {
        partnerX: {
          id: 1674,
        },
        partnerY: {
          id: 1789,
        },
        round_number: 6,
        event_id: 118,
      },
      {
        partnerX: {
          id: 115,
        },
        partnerY: {
          id: 526,
        },
        round_number: 6,
        event_id: 118,
      },
      {
        partnerX: {
          id: 12,
        },
        partnerY: {
          id: 1578,
        },
        round_number: 8,
        event_id: 118,
      },
      {
        partnerX: {
          id: 1647,
        },
        partnerY: {
          id: 1691,
        },
        round_number: 6,
        event_id: 118,
      },
      {
        partnerX: {
          id: 1567,
        },
        partnerY: {
          id: 1673,
        },
        round_number: 6,
        event_id: 118,
      },
      {
        partnerX: {
          id: 1258,
        },
        partnerY: {
          id: 1646,
        },
        round_number: 6,
        event_id: 118,
      },
      {
        partnerX: {
          id: 1208,
        },
        partnerY: {
          id: 1673,
        },
        round_number: 8,
        event_id: 118,
      },
      {
        partnerX: {
          id: 1736,
        },
        partnerY: {
          id: 1750,
        },
        round_number: 8,
        event_id: 118,
      },
      {
        partnerX: {
          id: 1567,
        },
        partnerY: {
          id: 1647,
        },
        round_number: 8,
        event_id: 118,
      },
      {
        partnerX: {
          id: 1674,
        },
        partnerY: {
          id: 1736,
        },
        round_number: 7,
        event_id: 118,
      },
      {
        partnerX: {
          id: 1071,
        },
        partnerY: {
          id: 1752,
        },
        round_number: 7,
        event_id: 118,
      },
      {
        partnerX: {
          id: 1646,
        },
        partnerY: {
          id: 1691,
        },
        round_number: 7,
        event_id: 118,
      },
      {
        partnerX: {
          id: 1258,
        },
        partnerY: {
          id: 8,
        },
        round_number: 7,
        event_id: 118,
      },
      {
        partnerX: {
          id: 1645,
        },
        partnerY: {
          id: 1750,
        },
        round_number: 7,
        event_id: 118,
      },
      {
        partnerX: {
          id: 12,
        },
        partnerY: {
          id: 1673,
        },
        round_number: 7,
        event_id: 118,
      },
      {
        partnerX: {
          id: 1567,
        },
        partnerY: {
          id: 1721,
        },
        round_number: 7,
        event_id: 118,
      },
      {
        partnerX: {
          id: 1208,
        },
        partnerY: {
          id: 1792,
        },
        round_number: 7,
        event_id: 118,
      },
      {
        partnerX: {
          id: 1791,
        },
        partnerY: {
          id: 1827,
        },
        round_number: 1,
        event_id: 123,
      },
      {
        partnerX: {
          id: 1685,
        },
        partnerY: {
          id: 1686,
        },
        round_number: 1,
        event_id: 123,
      },
      {
        partnerX: {
          id: 1653,
        },
        partnerY: {
          id: 1801,
        },
        round_number: 1,
        event_id: 123,
      },
      {
        partnerX: {
          id: 12,
        },
        partnerY: {
          id: 1792,
        },
        round_number: 9,
        event_id: 118,
      },
      {
        partnerX: {
          id: 1655,
        },
        partnerY: {
          id: 1683,
        },
        round_number: 12,
        event_id: 123,
      },
      {
        partnerX: {
          id: 1674,
        },
        partnerY: {
          id: 526,
        },
        round_number: 9,
        event_id: 118,
      },
      {
        partnerX: {
          id: 1789,
        },
        partnerY: {
          id: 8,
        },
        round_number: 9,
        event_id: 118,
      },
      {
        partnerX: {
          id: 1691,
        },
        partnerY: {
          id: 1750,
        },
        round_number: 9,
        event_id: 118,
      },
      {
        partnerX: {
          id: 1736,
        },
        partnerY: {
          id: 1752,
        },
        round_number: 9,
        event_id: 118,
      },
      {
        partnerX: {
          id: 1567,
        },
        partnerY: {
          id: 1645,
        },
        round_number: 9,
        event_id: 118,
      },
      {
        partnerX: {
          id: 115,
        },
        partnerY: {
          id: 1656,
        },
        round_number: 9,
        event_id: 118,
      },
      {
        partnerX: {
          id: 1646,
        },
        partnerY: {
          id: 1673,
        },
        round_number: 9,
        event_id: 118,
      },
      {
        partnerX: {
          id: 1578,
        },
        partnerY: {
          id: 1721,
        },
        round_number: 9,
        event_id: 118,
      },
      {
        partnerX: {
          id: 1071,
        },
        partnerY: {
          id: 1647,
        },
        round_number: 9,
        event_id: 118,
      },
      {
        partnerX: {
          id: 1862,
        },
        partnerY: {
          id: 1929,
        },
        round_number: 3,
        event_id: 129,
      },
      {
        partnerX: {
          id: 1837,
        },
        partnerY: {
          id: 8,
        },
        round_number: 6,
        event_id: 131,
      },
      {
        partnerX: {
          id: 1905,
        },
        partnerY: {
          id: 1958,
        },
        round_number: 6,
        event_id: 131,
      },
      {
        partnerX: {
          id: 1071,
        },
        partnerY: {
          id: 385,
        },
        round_number: 3,
        event_id: 129,
      },
      {
        partnerX: {
          id: 1925,
        },
        partnerY: {
          id: 1933,
        },
        round_number: 6,
        event_id: 131,
      },
      {
        partnerX: {
          id: 1629,
        },
        partnerY: {
          id: 1816,
        },
        round_number: 3,
        event_id: 129,
      },
      {
        partnerX: {
          id: 1071,
        },
        partnerY: {
          id: 1656,
        },
        round_number: 6,
        event_id: 131,
      },
      {
        partnerX: {
          id: 12,
        },
        partnerY: {
          id: 1906,
        },
        round_number: 6,
        event_id: 131,
      },
      {
        partnerX: {
          id: 115,
        },
        partnerY: {
          id: 1901,
        },
        round_number: 6,
        event_id: 131,
      },
      {
        partnerX: {
          id: 12,
        },
        partnerY: {
          id: 1939,
        },
        round_number: 3,
        event_id: 129,
      },
      {
        partnerX: {
          id: 1071,
        },
        partnerY: {
          id: 1993,
        },
        round_number: 5,
        event_id: 130,
      },
      {
        partnerX: {
          id: 115,
        },
        partnerY: {
          id: 1599,
        },
        round_number: 3,
        event_id: 129,
      },
      {
        partnerX: {
          id: 595,
        },
        partnerY: {
          id: 8,
        },
        round_number: 3,
        event_id: 129,
      },
      {
        partnerX: {
          id: 34,
        },
        partnerY: {
          id: 513,
        },
        round_number: 3,
        event_id: 129,
      },
      {
        partnerX: {
          id: 115,
        },
        partnerY: {
          id: 947,
        },
        round_number: 5,
        event_id: 130,
      },
      {
        partnerX: {
          id: 12,
        },
        partnerY: {
          id: 1901,
        },
        round_number: 5,
        event_id: 130,
      },
      {
        partnerX: {
          id: 1962,
        },
        partnerY: {
          id: 596,
        },
        round_number: 5,
        event_id: 130,
      },
      {
        partnerX: {
          id: 1960,
        },
        partnerY: {
          id: 2003,
        },
        round_number: 5,
        event_id: 130,
      },
      {
        partnerX: {
          id: 34,
        },
        partnerY: {
          id: 513,
        },
        round_number: 5,
        event_id: 130,
      },
      {
        partnerX: {
          id: 596,
        },
        partnerY: {
          id: 947,
        },
        round_number: 7,
        event_id: 130,
      },
      {
        partnerX: {
          id: 1724,
        },
        partnerY: {
          id: 506,
        },
        round_number: 4,
        event_id: 134,
      },
      {
        partnerX: {
          id: 1600,
        },
        partnerY: {
          id: 2010,
        },
        round_number: 4,
        event_id: 134,
      },
      {
        partnerX: {
          id: 1859,
        },
        partnerY: {
          id: 1901,
        },
        round_number: 4,
        event_id: 134,
      },
      {
        partnerX: {
          id: 1685,
        },
        partnerY: {
          id: 1729,
        },
        round_number: 4,
        event_id: 134,
      },
      {
        partnerX: {
          id: 1071,
        },
        partnerY: {
          id: 1826,
        },
        round_number: 4,
        event_id: 134,
      },
      {
        partnerX: {
          id: 1948,
        },
        partnerY: {
          id: 2024,
        },
        round_number: 4,
        event_id: 134,
      },
      {
        partnerX: {
          id: 1801,
        },
        partnerY: {
          id: 2025,
        },
        round_number: 4,
        event_id: 134,
      },
      {
        partnerX: {
          id: 1655,
        },
        partnerY: {
          id: 1700,
        },
        round_number: 4,
        event_id: 134,
      },
      {
        partnerX: {
          id: 1821,
        },
        partnerY: {
          id: 1999,
        },
        round_number: 4,
        event_id: 134,
      },
      {
        partnerX: {
          id: 1729,
        },
        partnerY: {
          id: 1821,
        },
        round_number: 5,
        event_id: 134,
      },
      {
        partnerX: {
          id: 1826,
        },
        partnerY: {
          id: 1859,
        },
        round_number: 5,
        event_id: 134,
      },
      {
        partnerX: {
          id: 2010,
        },
        partnerY: {
          id: 2024,
        },
        round_number: 5,
        event_id: 134,
      },
      {
        partnerX: {
          id: 1685,
        },
        partnerY: {
          id: 1999,
        },
        round_number: 5,
        event_id: 134,
      },
      {
        partnerX: {
          id: 1071,
        },
        partnerY: {
          id: 1948,
        },
        round_number: 5,
        event_id: 134,
      },
      {
        partnerX: {
          id: 1700,
        },
        partnerY: {
          id: 1901,
        },
        round_number: 5,
        event_id: 134,
      },
      {
        partnerX: {
          id: 1600,
        },
        partnerY: {
          id: 1655,
        },
        round_number: 5,
        event_id: 134,
      },
      {
        partnerX: {
          id: 1600,
        },
        partnerY: {
          id: 2024,
        },
        round_number: 6,
        event_id: 134,
      },
      {
        partnerX: {
          id: 1685,
        },
        partnerY: {
          id: 1985,
        },
        round_number: 6,
        event_id: 134,
      },
      {
        partnerX: {
          id: 1724,
        },
        partnerY: {
          id: 1801,
        },
        round_number: 6,
        event_id: 134,
      },
      {
        partnerX: {
          id: 1821,
        },
        partnerY: {
          id: 1859,
        },
        round_number: 6,
        event_id: 134,
      },
      {
        partnerX: {
          id: 1700,
        },
        partnerY: {
          id: 1729,
        },
        round_number: 6,
        event_id: 134,
      },
      {
        partnerX: {
          id: 1826,
        },
        partnerY: {
          id: 506,
        },
        round_number: 6,
        event_id: 134,
      },
      {
        partnerX: {
          id: 1901,
        },
        partnerY: {
          id: 1999,
        },
        round_number: 6,
        event_id: 134,
      },
      {
        partnerX: {
          id: 1948,
        },
        partnerY: {
          id: 2010,
        },
        round_number: 6,
        event_id: 134,
      },
      {
        partnerX: {
          id: 1801,
        },
        partnerY: {
          id: 506,
        },
        round_number: 7,
        event_id: 134,
      },
      {
        partnerX: {
          id: 1859,
        },
        partnerY: {
          id: 2010,
        },
        round_number: 7,
        event_id: 134,
      },
      {
        partnerX: {
          id: 1655,
        },
        partnerY: {
          id: 1821,
        },
        round_number: 7,
        event_id: 134,
      },
      {
        partnerX: {
          id: 1729,
        },
        partnerY: {
          id: 1948,
        },
        round_number: 7,
        event_id: 134,
      },
      {
        partnerX: {
          id: 1985,
        },
        partnerY: {
          id: 1999,
        },
        round_number: 7,
        event_id: 134,
      },
      {
        partnerX: {
          id: 2015,
        },
        partnerY: {
          id: 2024,
        },
        round_number: 7,
        event_id: 134,
      },
      {
        partnerX: {
          id: 1071,
        },
        partnerY: {
          id: 1724,
        },
        round_number: 7,
        event_id: 134,
      },
      {
        partnerX: {
          id: 1600,
        },
        partnerY: {
          id: 2025,
        },
        round_number: 7,
        event_id: 134,
      },
      {
        partnerX: {
          id: 1700,
        },
        partnerY: {
          id: 1999,
        },
        round_number: 8,
        event_id: 134,
      },
      {
        partnerX: {
          id: 1071,
        },
        partnerY: {
          id: 506,
        },
        round_number: 8,
        event_id: 134,
      },
      {
        partnerX: {
          id: 1801,
        },
        partnerY: {
          id: 2015,
        },
        round_number: 8,
        event_id: 134,
      },
      {
        partnerX: {
          id: 2010,
        },
        partnerY: {
          id: 2025,
        },
        round_number: 8,
        event_id: 134,
      },
      {
        partnerX: {
          id: 1985,
        },
        partnerY: {
          id: 2024,
        },
        round_number: 8,
        event_id: 134,
      },
      {
        partnerX: {
          id: 1600,
        },
        partnerY: {
          id: 1729,
        },
        round_number: 8,
        event_id: 134,
      },
      {
        partnerX: {
          id: 1901,
        },
        partnerY: {
          id: 1948,
        },
        round_number: 8,
        event_id: 134,
      },
      {
        partnerX: {
          id: 1948,
        },
        partnerY: {
          id: 2025,
        },
        round_number: 9,
        event_id: 134,
      },
      {
        partnerX: {
          id: 1071,
        },
        partnerY: {
          id: 1600,
        },
        round_number: 9,
        event_id: 134,
      },
      {
        partnerX: {
          id: 1700,
        },
        partnerY: {
          id: 2024,
        },
        round_number: 9,
        event_id: 134,
      },
      {
        partnerX: {
          id: 1729,
        },
        partnerY: {
          id: 2015,
        },
        round_number: 9,
        event_id: 134,
      },
      {
        partnerX: {
          id: 1685,
        },
        partnerY: {
          id: 1859,
        },
        round_number: 9,
        event_id: 134,
      },
      {
        partnerX: {
          id: 1821,
        },
        partnerY: {
          id: 1901,
        },
        round_number: 9,
        event_id: 134,
      },
      {
        partnerX: {
          id: 1801,
        },
        partnerY: {
          id: 1999,
        },
        round_number: 9,
        event_id: 134,
      },
      {
        partnerX: {
          id: 1600,
        },
        partnerY: {
          id: 1901,
        },
        round_number: 10,
        event_id: 134,
      },
      {
        partnerX: {
          id: 1985,
        },
        partnerY: {
          id: 506,
        },
        round_number: 10,
        event_id: 134,
      },
      {
        partnerX: {
          id: 1801,
        },
        partnerY: {
          id: 1948,
        },
        round_number: 10,
        event_id: 134,
      },
      {
        partnerX: {
          id: 1700,
        },
        partnerY: {
          id: 2025,
        },
        round_number: 10,
        event_id: 134,
      },
      {
        partnerX: {
          id: 1071,
        },
        partnerY: {
          id: 1729,
        },
        round_number: 10,
        event_id: 134,
      },
      {
        partnerX: {
          id: 1821,
        },
        partnerY: {
          id: 2024,
        },
        round_number: 10,
        event_id: 134,
      },
      {
        partnerX: {
          id: 1655,
        },
        partnerY: {
          id: 1724,
        },
        round_number: 10,
        event_id: 134,
      },
      {
        partnerX: {
          id: 1859,
        },
        partnerY: {
          id: 2015,
        },
        round_number: 10,
        event_id: 134,
      },
      {
        partnerX: {
          id: 1644,
        },
        partnerY: {
          id: 2094,
        },
        round_number: 3,
        event_id: 125,
      },
      {
        partnerX: {
          id: 1820,
        },
        partnerY: {
          id: 2140,
        },
        round_number: 3,
        event_id: 125,
      },
      {
        partnerX: {
          id: 1819,
        },
        partnerY: {
          id: 1820,
        },
        round_number: 6,
        event_id: 125,
      },
      {
        partnerX: {
          id: 2030,
        },
        partnerY: {
          id: 2052,
        },
        round_number: 7,
        event_id: 125,
      },
      {
        partnerX: {
          id: 1820,
        },
        partnerY: {
          id: 1990,
        },
        round_number: 1,
        event_id: 125,
      },
      {
        partnerX: {
          id: 1842,
        },
        partnerY: {
          id: 2140,
        },
        round_number: 1,
        event_id: 125,
      },
      {
        partnerX: {
          id: 2030,
        },
        partnerY: {
          id: 2141,
        },
        round_number: 1,
        event_id: 125,
      },
      {
        partnerX: {
          id: 1990,
        },
        partnerY: {
          id: 2030,
        },
        round_number: 6,
        event_id: 125,
      },
      {
        partnerX: {
          id: 1820,
        },
        partnerY: {
          id: 2141,
        },
        round_number: 2,
        event_id: 125,
      },
      {
        partnerX: {
          id: 1819,
        },
        partnerY: {
          id: 2121,
        },
        round_number: 4,
        event_id: 125,
      },
      {
        partnerX: {
          id: 1990,
        },
        partnerY: {
          id: 2052,
        },
        round_number: 2,
        event_id: 125,
      },
      {
        partnerX: {
          id: 1644,
        },
        partnerY: {
          id: 1990,
        },
        round_number: 4,
        event_id: 125,
      },
      {
        partnerX: {
          id: 2140,
        },
        partnerY: {
          id: 2143,
        },
        round_number: 4,
        event_id: 125,
      },
      {
        partnerX: {
          id: 2052,
        },
        partnerY: {
          id: 2094,
        },
        round_number: 4,
        event_id: 125,
      },
      {
        partnerX: {
          id: 1644,
        },
        partnerY: {
          id: 2141,
        },
        round_number: 7,
        event_id: 125,
      },
      {
        partnerX: {
          id: 1842,
        },
        partnerY: {
          id: 2142,
        },
        round_number: 6,
        event_id: 125,
      },
      {
        partnerX: {
          id: 1644,
        },
        partnerY: {
          id: 2030,
        },
        round_number: 5,
        event_id: 125,
      },
      {
        partnerX: {
          id: 1842,
        },
        partnerY: {
          id: 2052,
        },
        round_number: 5,
        event_id: 125,
      },
      {
        partnerX: {
          id: 2094,
        },
        partnerY: {
          id: 2143,
        },
        round_number: 7,
        event_id: 125,
      },
      {
        partnerX: {
          id: 2052,
        },
        partnerY: {
          id: 2143,
        },
        round_number: 6,
        event_id: 125,
      },
      {
        partnerX: {
          id: 2094,
        },
        partnerY: {
          id: 2141,
        },
        round_number: 6,
        event_id: 125,
      },
      {
        partnerX: {
          id: 2052,
        },
        partnerY: {
          id: 2142,
        },
        round_number: 8,
        event_id: 125,
      },
      {
        partnerX: {
          id: 1644,
        },
        partnerY: {
          id: 1819,
        },
        round_number: 9,
        event_id: 125,
      },
      {
        partnerX: {
          id: 1644,
        },
        partnerY: {
          id: 1820,
        },
        round_number: 8,
        event_id: 125,
      },
      {
        partnerX: {
          id: 2030,
        },
        partnerY: {
          id: 2094,
        },
        round_number: 8,
        event_id: 125,
      },
      {
        partnerX: {
          id: 1990,
        },
        partnerY: {
          id: 2140,
        },
        round_number: 9,
        event_id: 125,
      },
      {
        partnerX: {
          id: 1644,
        },
        partnerY: {
          id: 1842,
        },
        round_number: 10,
        event_id: 125,
      },
      {
        partnerX: {
          id: 2094,
        },
        partnerY: {
          id: 2142,
        },
        round_number: 10,
        event_id: 125,
      },
      {
        partnerX: {
          id: 1990,
        },
        partnerY: {
          id: 2141,
        },
        round_number: 10,
        event_id: 125,
      },
      {
        partnerX: {
          id: 1820,
        },
        partnerY: {
          id: 2030,
        },
        round_number: 10,
        event_id: 125,
      },
      {
        partnerX: {
          id: 2052,
        },
        partnerY: {
          id: 2140,
        },
        round_number: 10,
        event_id: 125,
      },
      {
        partnerX: {
          id: 2083,
        },
        partnerY: {
          id: 2182,
        },
        round_number: 4,
        event_id: 175,
      },
      {
        partnerX: {
          id: 2170,
        },
        partnerY: {
          id: 2171,
        },
        round_number: 1,
        event_id: 184,
      },
      {
        partnerX: {
          id: 1939,
        },
        partnerY: {
          id: 2068,
        },
        round_number: 4,
        event_id: 175,
      },
      {
        partnerX: {
          id: 12,
        },
        partnerY: {
          id: 2171,
        },
        round_number: 2,
        event_id: 184,
      },
      {
        partnerX: {
          id: 12,
        },
        partnerY: {
          id: 2073,
        },
        round_number: 4,
        event_id: 175,
      },
      {
        partnerX: {
          id: 2169,
        },
        partnerY: {
          id: 2171,
        },
        round_number: 3,
        event_id: 184,
      },
      {
        partnerX: {
          id: 12,
        },
        partnerY: {
          id: 2170,
        },
        round_number: 3,
        event_id: 184,
      },
      {
        partnerX: {
          id: 2182,
        },
        partnerY: {
          id: 34,
        },
        round_number: 1,
        event_id: 175,
      },
      {
        partnerX: {
          id: 1939,
        },
        partnerY: {
          id: 2083,
        },
        round_number: 1,
        event_id: 175,
      },
      {
        partnerX: {
          id: 2107,
        },
        partnerY: {
          id: 513,
        },
        round_number: 5,
        event_id: 175,
      },
      {
        partnerX: {
          id: 2073,
        },
        partnerY: {
          id: 2093,
        },
        round_number: 1,
        event_id: 175,
      },
      {
        partnerX: {
          id: 12,
        },
        partnerY: {
          id: 2068,
        },
        round_number: 1,
        event_id: 175,
      },
      {
        partnerX: {
          id: 2068,
        },
        partnerY: {
          id: 2093,
        },
        round_number: 7,
        event_id: 175,
      },
      {
        partnerX: {
          id: 1635,
        },
        partnerY: {
          id: 2182,
        },
        round_number: 7,
        event_id: 175,
      },
      {
        partnerX: {
          id: 2182,
        },
        partnerY: {
          id: 513,
        },
        round_number: 2,
        event_id: 175,
      },
      {
        partnerX: {
          id: 2083,
        },
        partnerY: {
          id: 34,
        },
        round_number: 7,
        event_id: 175,
      },
      {
        partnerX: {
          id: 2083,
        },
        partnerY: {
          id: 2093,
        },
        round_number: 5,
        event_id: 175,
      },
      {
        partnerX: {
          id: 2068,
        },
        partnerY: {
          id: 2116,
        },
        round_number: 2,
        event_id: 175,
      },
      {
        partnerX: {
          id: 12,
        },
        partnerY: {
          id: 2089,
        },
        round_number: 2,
        event_id: 175,
      },
      {
        partnerX: {
          id: 2083,
        },
        partnerY: {
          id: 2163,
        },
        round_number: 2,
        event_id: 175,
      },
      {
        partnerX: {
          id: 12,
        },
        partnerY: {
          id: 34,
        },
        round_number: 5,
        event_id: 175,
      },
      {
        partnerX: {
          id: 2076,
        },
        partnerY: {
          id: 513,
        },
        round_number: 3,
        event_id: 175,
      },
      {
        partnerX: {
          id: 2073,
        },
        partnerY: {
          id: 2182,
        },
        round_number: 3,
        event_id: 175,
      },
      {
        partnerX: {
          id: 2083,
        },
        partnerY: {
          id: 2107,
        },
        round_number: 3,
        event_id: 175,
      },
      {
        partnerX: {
          id: 2068,
        },
        partnerY: {
          id: 2182,
        },
        round_number: 5,
        event_id: 175,
      },
      {
        partnerX: {
          id: 2073,
        },
        partnerY: {
          id: 2089,
        },
        round_number: 5,
        event_id: 175,
      },
      {
        partnerX: {
          id: 2116,
        },
        partnerY: {
          id: 2163,
        },
        round_number: 3,
        event_id: 175,
      },
      {
        partnerX: {
          id: 2068,
        },
        partnerY: {
          id: 34,
        },
        round_number: 3,
        event_id: 175,
      },
      {
        partnerX: {
          id: 2107,
        },
        partnerY: {
          id: 34,
        },
        round_number: 4,
        event_id: 175,
      },
      {
        partnerX: {
          id: 2076,
        },
        partnerY: {
          id: 2089,
        },
        round_number: 4,
        event_id: 175,
      },
      {
        partnerX: {
          id: 12,
        },
        partnerY: {
          id: 2107,
        },
        round_number: 6,
        event_id: 175,
      },
      {
        partnerX: {
          id: 2068,
        },
        partnerY: {
          id: 2089,
        },
        round_number: 6,
        event_id: 175,
      },
      {
        partnerX: {
          id: 2076,
        },
        partnerY: {
          id: 34,
        },
        round_number: 6,
        event_id: 175,
      },
      {
        partnerX: {
          id: 1939,
        },
        partnerY: {
          id: 2182,
        },
        round_number: 6,
        event_id: 175,
      },
      {
        partnerX: {
          id: 2073,
        },
        partnerY: {
          id: 2116,
        },
        round_number: 6,
        event_id: 175,
      },
      {
        partnerX: {
          id: 2093,
        },
        partnerY: {
          id: 2163,
        },
        round_number: 6,
        event_id: 175,
      },
      {
        partnerX: {
          id: 12,
        },
        partnerY: {
          id: 513,
        },
        round_number: 7,
        event_id: 175,
      },
      {
        partnerX: {
          id: 1939,
        },
        partnerY: {
          id: 2163,
        },
        round_number: 7,
        event_id: 175,
      },
      {
        partnerX: {
          id: 12,
        },
        partnerY: {
          id: 2083,
        },
        round_number: 8,
        event_id: 175,
      },
      {
        partnerX: {
          id: 2073,
        },
        partnerY: {
          id: 2107,
        },
        round_number: 8,
        event_id: 175,
      },
      {
        partnerX: {
          id: 2089,
        },
        partnerY: {
          id: 2182,
        },
        round_number: 8,
        event_id: 175,
      },
      {
        partnerX: {
          id: 1939,
        },
        partnerY: {
          id: 513,
        },
        round_number: 8,
        event_id: 175,
      },
      {
        partnerX: {
          id: 1859,
        },
        partnerY: {
          id: 2163,
        },
        round_number: 1,
        event_id: 176,
      },
      {
        partnerX: {
          id: 1628,
        },
        partnerY: {
          id: 2147,
        },
        round_number: 1,
        event_id: 176,
      },
      {
        partnerX: {
          id: 115,
        },
        partnerY: {
          id: 2099,
        },
        round_number: 1,
        event_id: 176,
      },
      {
        partnerX: {
          id: 12,
        },
        partnerY: {
          id: 2197,
        },
        round_number: 1,
        event_id: 176,
      },
      {
        partnerX: {
          id: 1996,
        },
        partnerY: {
          id: 8,
        },
        round_number: 1,
        event_id: 176,
      },
      {
        partnerX: {
          id: 2161,
        },
        partnerY: {
          id: 965,
        },
        round_number: 1,
        event_id: 176,
      },
      {
        partnerX: {
          id: 2110,
        },
        partnerY: {
          id: 2138,
        },
        round_number: 1,
        event_id: 176,
      },
      {
        partnerX: {
          id: 115,
        },
        partnerY: {
          id: 1628,
        },
        round_number: 2,
        event_id: 176,
      },
      {
        partnerX: {
          id: 2197,
        },
        partnerY: {
          id: 8,
        },
        round_number: 2,
        event_id: 176,
      },
      {
        partnerX: {
          id: 1578,
        },
        partnerY: {
          id: 2044,
        },
        round_number: 2,
        event_id: 176,
      },
      {
        partnerX: {
          id: 2039,
        },
        partnerY: {
          id: 2163,
        },
        round_number: 2,
        event_id: 176,
      },
      {
        partnerX: {
          id: 12,
        },
        partnerY: {
          id: 1847,
        },
        round_number: 2,
        event_id: 176,
      },
      {
        partnerX: {
          id: 1859,
        },
        partnerY: {
          id: 2158,
        },
        round_number: 2,
        event_id: 176,
      },
      {
        partnerX: {
          id: 1599,
        },
        partnerY: {
          id: 2161,
        },
        round_number: 2,
        event_id: 176,
      },
      {
        partnerX: {
          id: 1859,
        },
        partnerY: {
          id: 2147,
        },
        round_number: 3,
        event_id: 176,
      },
      {
        partnerX: {
          id: 2110,
        },
        partnerY: {
          id: 8,
        },
        round_number: 3,
        event_id: 176,
      },
      {
        partnerX: {
          id: 12,
        },
        partnerY: {
          id: 1578,
        },
        round_number: 3,
        event_id: 176,
      },
      {
        partnerX: {
          id: 1629,
        },
        partnerY: {
          id: 2138,
        },
        round_number: 3,
        event_id: 176,
      },
      {
        partnerX: {
          id: 2099,
        },
        partnerY: {
          id: 2161,
        },
        round_number: 3,
        event_id: 176,
      },
      {
        partnerX: {
          id: 12,
        },
        partnerY: {
          id: 2138,
        },
        round_number: 7,
        event_id: 176,
      },
      {
        partnerX: {
          id: 1628,
        },
        partnerY: {
          id: 2099,
        },
        round_number: 7,
        event_id: 176,
      },
      {
        partnerX: {
          id: 1847,
        },
        partnerY: {
          id: 8,
        },
        round_number: 7,
        event_id: 176,
      },
      {
        partnerX: {
          id: 115,
        },
        partnerY: {
          id: 1599,
        },
        round_number: 7,
        event_id: 176,
      },
      {
        partnerX: {
          id: 2044,
        },
        partnerY: {
          id: 2163,
        },
        round_number: 7,
        event_id: 176,
      },
      {
        partnerX: {
          id: 1585,
        },
        partnerY: {
          id: 2161,
        },
        round_number: 7,
        event_id: 176,
      },
      {
        partnerX: {
          id: 12,
        },
        partnerY: {
          id: 8,
        },
        round_number: 4,
        event_id: 176,
      },
      {
        partnerX: {
          id: 2099,
        },
        partnerY: {
          id: 2147,
        },
        round_number: 4,
        event_id: 176,
      },
      {
        partnerX: {
          id: 1578,
        },
        partnerY: {
          id: 2163,
        },
        round_number: 4,
        event_id: 176,
      },
      {
        partnerX: {
          id: 1629,
        },
        partnerY: {
          id: 2110,
        },
        round_number: 4,
        event_id: 176,
      },
      {
        partnerX: {
          id: 1859,
        },
        partnerY: {
          id: 965,
        },
        round_number: 4,
        event_id: 176,
      },
      {
        partnerX: {
          id: 115,
        },
        partnerY: {
          id: 2044,
        },
        round_number: 4,
        event_id: 176,
      },
      {
        partnerX: {
          id: 2073,
        },
        partnerY: {
          id: 2161,
        },
        round_number: 4,
        event_id: 176,
      },
      {
        partnerX: {
          id: 12,
        },
        partnerY: {
          id: 2084,
        },
        round_number: 5,
        event_id: 176,
      },
      {
        partnerX: {
          id: 8,
        },
        partnerY: {
          id: 965,
        },
        round_number: 5,
        event_id: 176,
      },
      {
        partnerX: {
          id: 1599,
        },
        partnerY: {
          id: 1996,
        },
        round_number: 5,
        event_id: 176,
      },
      {
        partnerX: {
          id: 115,
        },
        partnerY: {
          id: 2147,
        },
        round_number: 5,
        event_id: 176,
      },
      {
        partnerX: {
          id: 1859,
        },
        partnerY: {
          id: 2110,
        },
        round_number: 5,
        event_id: 176,
      },
      {
        partnerX: {
          id: 1629,
        },
        partnerY: {
          id: 2163,
        },
        round_number: 5,
        event_id: 176,
      },
      {
        partnerX: {
          id: 2044,
        },
        partnerY: {
          id: 2161,
        },
        round_number: 5,
        event_id: 176,
      },
      {
        partnerX: {
          id: 1629,
        },
        partnerY: {
          id: 2147,
        },
        round_number: 6,
        event_id: 176,
      },
      {
        partnerX: {
          id: 2044,
        },
        partnerY: {
          id: 965,
        },
        round_number: 6,
        event_id: 176,
      },
      {
        partnerX: {
          id: 12,
        },
        partnerY: {
          id: 1628,
        },
        round_number: 6,
        event_id: 176,
      },
      {
        partnerX: {
          id: 1996,
        },
        partnerY: {
          id: 2099,
        },
        round_number: 8,
        event_id: 176,
      },
      {
        partnerX: {
          id: 1859,
        },
        partnerY: {
          id: 2084,
        },
        round_number: 6,
        event_id: 176,
      },
      {
        partnerX: {
          id: 1578,
        },
        partnerY: {
          id: 2099,
        },
        round_number: 6,
        event_id: 176,
      },
      {
        partnerX: {
          id: 1847,
        },
        partnerY: {
          id: 2161,
        },
        round_number: 6,
        event_id: 176,
      },
      {
        partnerX: {
          id: 2110,
        },
        partnerY: {
          id: 2163,
        },
        round_number: 6,
        event_id: 176,
      },
      {
        partnerX: {
          id: 115,
        },
        partnerY: {
          id: 8,
        },
        round_number: 6,
        event_id: 176,
      },
      {
        partnerX: {
          id: 2023,
        },
        partnerY: {
          id: 8,
        },
        round_number: 2,
        event_id: 177,
      },
      {
        partnerX: {
          id: 2023,
        },
        partnerY: {
          id: 2130,
        },
        round_number: 4,
        event_id: 177,
      },
      {
        partnerX: {
          id: 1996,
        },
        partnerY: {
          id: 2147,
        },
        round_number: 7,
        event_id: 176,
      },
      {
        partnerX: {
          id: 12,
        },
        partnerY: {
          id: 2167,
        },
        round_number: 1,
        event_id: 177,
      },
      {
        partnerX: {
          id: 2054,
        },
        partnerY: {
          id: 2130,
        },
        round_number: 1,
        event_id: 177,
      },
      {
        partnerX: {
          id: 2102,
        },
        partnerY: {
          id: 513,
        },
        round_number: 4,
        event_id: 177,
      },
      {
        partnerX: {
          id: 2084,
        },
        partnerY: {
          id: 965,
        },
        round_number: 8,
        event_id: 176,
      },
      {
        partnerX: {
          id: 1847,
        },
        partnerY: {
          id: 2147,
        },
        round_number: 8,
        event_id: 176,
      },
      {
        partnerX: {
          id: 12,
        },
        partnerY: {
          id: 1859,
        },
        round_number: 8,
        event_id: 176,
      },
      {
        partnerX: {
          id: 1932,
        },
        partnerY: {
          id: 1980,
        },
        round_number: 1,
        event_id: 177,
      },
      {
        partnerX: {
          id: 115,
        },
        partnerY: {
          id: 2153,
        },
        round_number: 8,
        event_id: 176,
      },
      {
        partnerX: {
          id: 1901,
        },
        partnerY: {
          id: 1943,
        },
        round_number: 1,
        event_id: 177,
      },
      {
        partnerX: {
          id: 2138,
        },
        partnerY: {
          id: 2163,
        },
        round_number: 8,
        event_id: 176,
      },
      {
        partnerX: {
          id: 1578,
        },
        partnerY: {
          id: 2161,
        },
        round_number: 8,
        event_id: 176,
      },
      {
        partnerX: {
          id: 1628,
        },
        partnerY: {
          id: 1629,
        },
        round_number: 8,
        event_id: 176,
      },
      {
        partnerX: {
          id: 1906,
        },
        partnerY: {
          id: 1932,
        },
        round_number: 5,
        event_id: 177,
      },
      {
        partnerX: {
          id: 1901,
        },
        partnerY: {
          id: 8,
        },
        round_number: 5,
        event_id: 177,
      },
      {
        partnerX: {
          id: 12,
        },
        partnerY: {
          id: 2054,
        },
        round_number: 2,
        event_id: 177,
      },
      {
        partnerX: {
          id: 2023,
        },
        partnerY: {
          id: 2206,
        },
        round_number: 5,
        event_id: 177,
      },
      {
        partnerX: {
          id: 1906,
        },
        partnerY: {
          id: 513,
        },
        round_number: 2,
        event_id: 177,
      },
      {
        partnerX: {
          id: 2102,
        },
        partnerY: {
          id: 2167,
        },
        round_number: 2,
        event_id: 177,
      },
      {
        partnerX: {
          id: 12,
        },
        partnerY: {
          id: 1901,
        },
        round_number: 3,
        event_id: 177,
      },
      {
        partnerX: {
          id: 2130,
        },
        partnerY: {
          id: 2203,
        },
        round_number: 2,
        event_id: 177,
      },
      {
        partnerX: {
          id: 1980,
        },
        partnerY: {
          id: 2167,
        },
        round_number: 4,
        event_id: 177,
      },
      {
        partnerX: {
          id: 2167,
        },
        partnerY: {
          id: 513,
        },
        round_number: 3,
        event_id: 177,
      },
      {
        partnerX: {
          id: 1906,
        },
        partnerY: {
          id: 2023,
        },
        round_number: 3,
        event_id: 177,
      },
      {
        partnerX: {
          id: 1932,
        },
        partnerY: {
          id: 8,
        },
        round_number: 3,
        event_id: 177,
      },
      {
        partnerX: {
          id: 1993,
        },
        partnerY: {
          id: 2054,
        },
        round_number: 3,
        event_id: 177,
      },
      {
        partnerX: {
          id: 2102,
        },
        partnerY: {
          id: 2203,
        },
        round_number: 3,
        event_id: 177,
      },
      {
        partnerX: {
          id: 1943,
        },
        partnerY: {
          id: 8,
        },
        round_number: 4,
        event_id: 177,
      },
      {
        partnerX: {
          id: 12,
        },
        partnerY: {
          id: 2206,
        },
        round_number: 4,
        event_id: 177,
      },
      {
        partnerX: {
          id: 1901,
        },
        partnerY: {
          id: 1906,
        },
        round_number: 4,
        event_id: 177,
      },
      {
        partnerX: {
          id: 2130,
        },
        partnerY: {
          id: 2167,
        },
        round_number: 5,
        event_id: 177,
      },
      {
        partnerX: {
          id: 2054,
        },
        partnerY: {
          id: 2203,
        },
        round_number: 4,
        event_id: 177,
      },
      {
        partnerX: {
          id: 12,
        },
        partnerY: {
          id: 1943,
        },
        round_number: 5,
        event_id: 177,
      },
      {
        partnerX: {
          id: 2203,
        },
        partnerY: {
          id: 513,
        },
        round_number: 5,
        event_id: 177,
      },
      {
        partnerX: {
          id: 1993,
        },
        partnerY: {
          id: 2102,
        },
        round_number: 5,
        event_id: 177,
      },
      {
        partnerX: {
          id: 1980,
        },
        partnerY: {
          id: 2054,
        },
        round_number: 5,
        event_id: 177,
      },
      {
        partnerX: {
          id: 2036,
        },
        partnerY: {
          id: 2120,
        },
        round_number: 1,
        event_id: 178,
      },
      {
        partnerX: {
          id: 1934,
        },
        partnerY: {
          id: 2178,
        },
        round_number: 1,
        event_id: 178,
      },
      {
        partnerX: {
          id: 2046,
        },
        partnerY: {
          id: 8,
        },
        round_number: 1,
        event_id: 178,
      },
      {
        partnerX: {
          id: 2050,
        },
        partnerY: {
          id: 2196,
        },
        round_number: 1,
        event_id: 178,
      },
      {
        partnerX: {
          id: 1635,
        },
        partnerY: {
          id: 2106,
        },
        round_number: 1,
        event_id: 178,
      },
      {
        partnerX: {
          id: 1071,
        },
        partnerY: {
          id: 2172,
        },
        round_number: 1,
        event_id: 178,
      },
      {
        partnerX: {
          id: 2062,
        },
        partnerY: {
          id: 2152,
        },
        round_number: 1,
        event_id: 178,
      },
      {
        partnerX: {
          id: 2046,
        },
        partnerY: {
          id: 2136,
        },
        round_number: 2,
        event_id: 178,
      },
      {
        partnerX: {
          id: 1071,
        },
        partnerY: {
          id: 2196,
        },
        round_number: 5,
        event_id: 178,
      },
      {
        partnerX: {
          id: 2062,
        },
        partnerY: {
          id: 2120,
        },
        round_number: 2,
        event_id: 178,
      },
      {
        partnerX: {
          id: 1635,
        },
        partnerY: {
          id: 2178,
        },
        round_number: 2,
        event_id: 178,
      },
      {
        partnerX: {
          id: 2050,
        },
        partnerY: {
          id: 2106,
        },
        round_number: 2,
        event_id: 178,
      },
      {
        partnerX: {
          id: 1934,
        },
        partnerY: {
          id: 2172,
        },
        round_number: 2,
        event_id: 178,
      },
      {
        partnerX: {
          id: 1901,
        },
        partnerY: {
          id: 2097,
        },
        round_number: 2,
        event_id: 178,
      },
      {
        partnerX: {
          id: 1071,
        },
        partnerY: {
          id: 8,
        },
        round_number: 2,
        event_id: 178,
      },
      {
        partnerX: {
          id: 2036,
        },
        partnerY: {
          id: 2196,
        },
        round_number: 2,
        event_id: 178,
      },
      {
        partnerX: {
          id: 2108,
        },
        partnerY: {
          id: 2135,
        },
        round_number: 2,
        event_id: 178,
      },
      {
        partnerX: {
          id: 1635,
        },
        partnerY: {
          id: 2152,
        },
        round_number: 3,
        event_id: 178,
      },
      {
        partnerX: {
          id: 2048,
        },
        partnerY: {
          id: 2062,
        },
        round_number: 3,
        event_id: 178,
      },
      {
        partnerX: {
          id: 1934,
        },
        partnerY: {
          id: 2196,
        },
        round_number: 3,
        event_id: 178,
      },
      {
        partnerX: {
          id: 2046,
        },
        partnerY: {
          id: 2097,
        },
        round_number: 3,
        event_id: 178,
      },
      {
        partnerX: {
          id: 2062,
        },
        partnerY: {
          id: 2136,
        },
        round_number: 6,
        event_id: 178,
      },
      {
        partnerX: {
          id: 2172,
        },
        partnerY: {
          id: 8,
        },
        round_number: 3,
        event_id: 178,
      },
      {
        partnerX: {
          id: 2106,
        },
        partnerY: {
          id: 2120,
        },
        round_number: 3,
        event_id: 178,
      },
      {
        partnerX: {
          id: 2036,
        },
        partnerY: {
          id: 2135,
        },
        round_number: 3,
        event_id: 178,
      },
      {
        partnerX: {
          id: 1934,
        },
        partnerY: {
          id: 2036,
        },
        round_number: 4,
        event_id: 178,
      },
      {
        partnerX: {
          id: 2136,
        },
        partnerY: {
          id: 2210,
        },
        round_number: 8,
        event_id: 178,
      },
      {
        partnerX: {
          id: 2062,
        },
        partnerY: {
          id: 2210,
        },
        round_number: 4,
        event_id: 178,
      },
      {
        partnerX: {
          id: 12,
        },
        partnerY: {
          id: 8,
        },
        round_number: 2,
        event_id: 201,
      },
      {
        partnerX: {
          id: 1071,
        },
        partnerY: {
          id: 2097,
        },
        round_number: 6,
        event_id: 178,
      },
      {
        partnerX: {
          id: 2106,
        },
        partnerY: {
          id: 2152,
        },
        round_number: 6,
        event_id: 178,
      },
      {
        partnerX: {
          id: 2196,
        },
        partnerY: {
          id: 8,
        },
        round_number: 4,
        event_id: 178,
      },
      {
        partnerX: {
          id: 1635,
        },
        partnerY: {
          id: 1901,
        },
        round_number: 4,
        event_id: 178,
      },
      {
        partnerX: {
          id: 2120,
        },
        partnerY: {
          id: 2152,
        },
        round_number: 4,
        event_id: 178,
      },
      {
        partnerX: {
          id: 2097,
        },
        partnerY: {
          id: 2106,
        },
        round_number: 4,
        event_id: 178,
      },
      {
        partnerX: {
          id: 2046,
        },
        partnerY: {
          id: 2135,
        },
        round_number: 4,
        event_id: 178,
      },
      {
        partnerX: {
          id: 2050,
        },
        partnerY: {
          id: 2136,
        },
        round_number: 4,
        event_id: 178,
      },
      {
        partnerX: {
          id: 1071,
        },
        partnerY: {
          id: 2178,
        },
        round_number: 4,
        event_id: 178,
      },
      {
        partnerX: {
          id: 2046,
        },
        partnerY: {
          id: 2210,
        },
        round_number: 6,
        event_id: 178,
      },
      {
        partnerX: {
          id: 1635,
        },
        partnerY: {
          id: 2050,
        },
        round_number: 6,
        event_id: 178,
      },
      {
        partnerX: {
          id: 2097,
        },
        partnerY: {
          id: 2172,
        },
        round_number: 8,
        event_id: 178,
      },
      {
        partnerX: {
          id: 2029,
        },
        partnerY: {
          id: 2196,
        },
        round_number: 6,
        event_id: 178,
      },
      {
        partnerX: {
          id: 2062,
        },
        partnerY: {
          id: 2172,
        },
        round_number: 5,
        event_id: 178,
      },
      {
        partnerX: {
          id: 2135,
        },
        partnerY: {
          id: 2172,
        },
        round_number: 6,
        event_id: 178,
      },
      {
        partnerX: {
          id: 1901,
        },
        partnerY: {
          id: 2120,
        },
        round_number: 6,
        event_id: 178,
      },
      {
        partnerX: {
          id: 2050,
        },
        partnerY: {
          id: 2178,
        },
        round_number: 5,
        event_id: 178,
      },
      {
        partnerX: {
          id: 2120,
        },
        partnerY: {
          id: 2210,
        },
        round_number: 5,
        event_id: 178,
      },
      {
        partnerX: {
          id: 2106,
        },
        partnerY: {
          id: 2136,
        },
        round_number: 5,
        event_id: 178,
      },
      {
        partnerX: {
          id: 1901,
        },
        partnerY: {
          id: 2152,
        },
        round_number: 5,
        event_id: 178,
      },
      {
        partnerX: {
          id: 2036,
        },
        partnerY: {
          id: 2178,
        },
        round_number: 6,
        event_id: 178,
      },
      {
        partnerX: {
          id: 2036,
        },
        partnerY: {
          id: 2097,
        },
        round_number: 5,
        event_id: 178,
      },
      {
        partnerX: {
          id: 1635,
        },
        partnerY: {
          id: 2135,
        },
        round_number: 5,
        event_id: 178,
      },
      {
        partnerX: {
          id: 1934,
        },
        partnerY: {
          id: 2046,
        },
        round_number: 5,
        event_id: 178,
      },
      {
        partnerX: {
          id: 2152,
        },
        partnerY: {
          id: 8,
        },
        round_number: 8,
        event_id: 178,
      },
      {
        partnerX: {
          id: 2036,
        },
        partnerY: {
          id: 2172,
        },
        round_number: 7,
        event_id: 178,
      },
      {
        partnerX: {
          id: 1071,
        },
        partnerY: {
          id: 1635,
        },
        round_number: 8,
        event_id: 178,
      },
      {
        partnerX: {
          id: 2178,
        },
        partnerY: {
          id: 2196,
        },
        round_number: 8,
        event_id: 178,
      },
      {
        partnerX: {
          id: 2046,
        },
        partnerY: {
          id: 2062,
        },
        round_number: 7,
        event_id: 178,
      },
      {
        partnerX: {
          id: 1071,
        },
        partnerY: {
          id: 2050,
        },
        round_number: 7,
        event_id: 178,
      },
      {
        partnerX: {
          id: 2120,
        },
        partnerY: {
          id: 2196,
        },
        round_number: 7,
        event_id: 178,
      },
      {
        partnerX: {
          id: 1934,
        },
        partnerY: {
          id: 2135,
        },
        round_number: 8,
        event_id: 178,
      },
      {
        partnerX: {
          id: 2029,
        },
        partnerY: {
          id: 2120,
        },
        round_number: 8,
        event_id: 178,
      },
      {
        partnerX: {
          id: 2097,
        },
        partnerY: {
          id: 2135,
        },
        round_number: 7,
        event_id: 178,
      },
      {
        partnerX: {
          id: 2046,
        },
        partnerY: {
          id: 2050,
        },
        round_number: 8,
        event_id: 178,
      },
      {
        partnerX: {
          id: 1901,
        },
        partnerY: {
          id: 8,
        },
        round_number: 7,
        event_id: 178,
      },
      {
        partnerX: {
          id: 1934,
        },
        partnerY: {
          id: 2106,
        },
        round_number: 7,
        event_id: 178,
      },
      {
        partnerX: {
          id: 1635,
        },
        partnerY: {
          id: 2210,
        },
        round_number: 7,
        event_id: 178,
      },
      {
        partnerX: {
          id: 1901,
        },
        partnerY: {
          id: 2106,
        },
        round_number: 8,
        event_id: 178,
      },
      {
        partnerX: {
          id: 12,
        },
        partnerY: {
          id: 513,
        },
        round_number: 1,
        event_id: 201,
      },
      {
        partnerX: {
          id: 115,
        },
        partnerY: {
          id: 8,
        },
        round_number: 1,
        event_id: 201,
      },
      {
        partnerX: {
          id: 1628,
        },
        partnerY: {
          id: 506,
        },
        round_number: 1,
        event_id: 201,
      },
      {
        partnerX: {
          id: 506,
        },
        partnerY: {
          id: 513,
        },
        round_number: 4,
        event_id: 201,
      },
      {
        partnerX: {
          id: 1628,
        },
        partnerY: {
          id: 513,
        },
        round_number: 2,
        event_id: 201,
      },
      {
        partnerX: {
          id: 115,
        },
        partnerY: {
          id: 506,
        },
        round_number: 2,
        event_id: 201,
      },
      {
        partnerX: {
          id: 513,
        },
        partnerY: {
          id: 8,
        },
        round_number: 3,
        event_id: 201,
      },
      {
        partnerX: {
          id: 12,
        },
        partnerY: {
          id: 506,
        },
        round_number: 3,
        event_id: 201,
      },
      {
        partnerX: {
          id: 1628,
        },
        partnerY: {
          id: 8,
        },
        round_number: 4,
        event_id: 201,
      },
      {
        partnerX: {
          id: 115,
        },
        partnerY: {
          id: 1628,
        },
        round_number: 3,
        event_id: 201,
      },
      {
        partnerX: {
          id: 506,
        },
        partnerY: {
          id: 8,
        },
        round_number: 5,
        event_id: 201,
      },
      {
        partnerX: {
          id: 115,
        },
        partnerY: {
          id: 513,
        },
        round_number: 5,
        event_id: 201,
      },
      {
        partnerX: {
          id: 12,
        },
        partnerY: {
          id: 1628,
        },
        round_number: 5,
        event_id: 201,
      },
      {
        partnerX: {
          id: 115,
        },
        partnerY: {
          id: 2232,
        },
        round_number: 1,
        event_id: 199,
      },
      {
        partnerX: {
          id: 2303,
        },
        partnerY: {
          id: 513,
        },
        round_number: 3,
        event_id: 189,
      },
      {
        partnerX: {
          id: 115,
        },
        partnerY: {
          id: 12,
        },
        round_number: 2,
        event_id: 199,
      },
      {
        partnerX: {
          id: 2232,
        },
        partnerY: {
          id: 8,
        },
        round_number: 2,
        event_id: 199,
      },
      {
        partnerX: {
          id: 2212,
        },
        partnerY: {
          id: 590,
        },
        round_number: 3,
        event_id: 189,
      },
      {
        partnerX: {
          id: 12,
        },
        partnerY: {
          id: 2232,
        },
        round_number: 3,
        event_id: 199,
      },
      {
        partnerX: {
          id: 1585,
        },
        partnerY: {
          id: 2196,
        },
        round_number: 3,
        event_id: 189,
      },
      {
        partnerX: {
          id: 12,
        },
        partnerY: {
          id: 8,
        },
        round_number: 1,
        event_id: 206,
      },
      {
        partnerX: {
          id: 12,
        },
        partnerY: {
          id: 34,
        },
        round_number: 3,
        event_id: 189,
      },
      {
        partnerX: {
          id: 115,
        },
        partnerY: {
          id: 8,
        },
        round_number: 2,
        event_id: 206,
      },
      {
        partnerX: {
          id: 115,
        },
        partnerY: {
          id: 12,
        },
        round_number: 3,
        event_id: 206,
      },
      {
        partnerX: {
          id: 2320,
        },
        partnerY: {
          id: 8,
        },
        round_number: 3,
        event_id: 206,
      },
      {
        partnerX: {
          id: 1808,
        },
        partnerY: {
          id: 1939,
        },
        round_number: 6,
        event_id: 189,
      },
      {
        partnerX: {
          id: 2259,
        },
        partnerY: {
          id: 513,
        },
        round_number: 6,
        event_id: 189,
      },
      {
        partnerX: {
          id: 2073,
        },
        partnerY: {
          id: 34,
        },
        round_number: 4,
        event_id: 189,
      },
      {
        partnerX: {
          id: 1939,
        },
        partnerY: {
          id: 2363,
        },
        round_number: 4,
        event_id: 189,
      },
      {
        partnerX: {
          id: 34,
        },
        partnerY: {
          id: 513,
        },
        round_number: 1,
        event_id: 189,
      },
      {
        partnerX: {
          id: 2303,
        },
        partnerY: {
          id: 2363,
        },
        round_number: 1,
        event_id: 189,
      },
      {
        partnerX: {
          id: 12,
        },
        partnerY: {
          id: 1585,
        },
        round_number: 1,
        event_id: 189,
      },
      {
        partnerX: {
          id: 2212,
        },
        partnerY: {
          id: 2303,
        },
        round_number: 4,
        event_id: 189,
      },
      {
        partnerX: {
          id: 2110,
        },
        partnerY: {
          id: 590,
        },
        round_number: 4,
        event_id: 189,
      },
      {
        partnerX: {
          id: 12,
        },
        partnerY: {
          id: 2259,
        },
        round_number: 2,
        event_id: 189,
      },
      {
        partnerX: {
          id: 1585,
        },
        partnerY: {
          id: 513,
        },
        round_number: 4,
        event_id: 189,
      },
      {
        partnerX: {
          id: 1585,
        },
        partnerY: {
          id: 2073,
        },
        round_number: 2,
        event_id: 189,
      },
      {
        partnerX: {
          id: 1808,
        },
        partnerY: {
          id: 2196,
        },
        round_number: 4,
        event_id: 189,
      },
      {
        partnerX: {
          id: 2212,
        },
        partnerY: {
          id: 34,
        },
        round_number: 2,
        event_id: 189,
      },
      {
        partnerX: {
          id: 2363,
        },
        partnerY: {
          id: 513,
        },
        round_number: 2,
        event_id: 189,
      },
      {
        partnerX: {
          id: 1808,
        },
        partnerY: {
          id: 590,
        },
        round_number: 2,
        event_id: 189,
      },
      {
        partnerX: {
          id: 1939,
        },
        partnerY: {
          id: 2303,
        },
        round_number: 2,
        event_id: 189,
      },
      {
        partnerX: {
          id: 2196,
        },
        partnerY: {
          id: 34,
        },
        round_number: 8,
        event_id: 189,
      },
      {
        partnerX: {
          id: 12,
        },
        partnerY: {
          id: 1808,
        },
        round_number: 8,
        event_id: 189,
      },
      {
        partnerX: {
          id: 2259,
        },
        partnerY: {
          id: 2363,
        },
        round_number: 7,
        event_id: 189,
      },
      {
        partnerX: {
          id: 2212,
        },
        partnerY: {
          id: 2259,
        },
        round_number: 5,
        event_id: 189,
      },
      {
        partnerX: {
          id: 1585,
        },
        partnerY: {
          id: 2213,
        },
        round_number: 5,
        event_id: 189,
      },
      {
        partnerX: {
          id: 12,
        },
        partnerY: {
          id: 513,
        },
        round_number: 5,
        event_id: 189,
      },
      {
        partnerX: {
          id: 1808,
        },
        partnerY: {
          id: 2212,
        },
        round_number: 7,
        event_id: 189,
      },
      {
        partnerX: {
          id: 2363,
        },
        partnerY: {
          id: 590,
        },
        round_number: 5,
        event_id: 189,
      },
      {
        partnerX: {
          id: 1808,
        },
        partnerY: {
          id: 2303,
        },
        round_number: 5,
        event_id: 189,
      },
      {
        partnerX: {
          id: 1585,
        },
        partnerY: {
          id: 2303,
        },
        round_number: 7,
        event_id: 189,
      },
      {
        partnerX: {
          id: 1585,
        },
        partnerY: {
          id: 2110,
        },
        round_number: 6,
        event_id: 189,
      },
      {
        partnerX: {
          id: 2212,
        },
        partnerY: {
          id: 2363,
        },
        round_number: 6,
        event_id: 189,
      },
      {
        partnerX: {
          id: 1939,
        },
        partnerY: {
          id: 2196,
        },
        round_number: 7,
        event_id: 189,
      },
      {
        partnerX: {
          id: 2213,
        },
        partnerY: {
          id: 34,
        },
        round_number: 6,
        event_id: 189,
      },
      {
        partnerX: {
          id: 12,
        },
        partnerY: {
          id: 2303,
        },
        round_number: 6,
        event_id: 189,
      },
      {
        partnerX: {
          id: 2196,
        },
        partnerY: {
          id: 590,
        },
        round_number: 6,
        event_id: 189,
      },
      {
        partnerX: {
          id: 12,
        },
        partnerY: {
          id: 590,
        },
        round_number: 7,
        event_id: 189,
      },
      {
        partnerX: {
          id: 2110,
        },
        partnerY: {
          id: 34,
        },
        round_number: 7,
        event_id: 189,
      },
      {
        partnerX: {
          id: 1585,
        },
        partnerY: {
          id: 2212,
        },
        round_number: 8,
        event_id: 189,
      },
      {
        partnerX: {
          id: 2303,
        },
        partnerY: {
          id: 590,
        },
        round_number: 8,
        event_id: 189,
      },
      {
        partnerX: {
          id: 2213,
        },
        partnerY: {
          id: 2363,
        },
        round_number: 8,
        event_id: 189,
      },
      {
        partnerX: {
          id: 2110,
        },
        partnerY: {
          id: 513,
        },
        round_number: 8,
        event_id: 189,
      },
      {
        partnerX: {
          id: 2260,
        },
        partnerY: {
          id: 506,
        },
        round_number: 1,
        event_id: 190,
      },
      {
        partnerX: {
          id: 2396,
        },
        partnerY: {
          id: 541,
        },
        round_number: 1,
        event_id: 190,
      },
      {
        partnerX: {
          id: 2364,
        },
        partnerY: {
          id: 590,
        },
        round_number: 1,
        event_id: 190,
      },
      {
        partnerX: {
          id: 115,
        },
        partnerY: {
          id: 2271,
        },
        round_number: 1,
        event_id: 190,
      },
      {
        partnerX: {
          id: 12,
        },
        partnerY: {
          id: 1560,
        },
        round_number: 1,
        event_id: 190,
      },
      {
        partnerX: {
          id: 1578,
        },
        partnerY: {
          id: 1933,
        },
        round_number: 1,
        event_id: 190,
      },
      {
        partnerX: {
          id: 1918,
        },
        partnerY: {
          id: 34,
        },
        round_number: 1,
        event_id: 190,
      },
      {
        partnerX: {
          id: 270,
        },
        partnerY: {
          id: 8,
        },
        round_number: 1,
        event_id: 190,
      },
      {
        partnerX: {
          id: 2110,
        },
        partnerY: {
          id: 2373,
        },
        round_number: 1,
        event_id: 190,
      },
      {
        partnerX: {
          id: 2260,
        },
        partnerY: {
          id: 2364,
        },
        round_number: 5,
        event_id: 190,
      },
      {
        partnerX: {
          id: 115,
        },
        partnerY: {
          id: 2396,
        },
        round_number: 5,
        event_id: 190,
      },
      {
        partnerX: {
          id: 2247,
        },
        partnerY: {
          id: 590,
        },
        round_number: 5,
        event_id: 190,
      },
      {
        partnerX: {
          id: 34,
        },
        partnerY: {
          id: 541,
        },
        round_number: 5,
        event_id: 190,
      },
      {
        partnerX: {
          id: 115,
        },
        partnerY: {
          id: 590,
        },
        round_number: 2,
        event_id: 190,
      },
      {
        partnerX: {
          id: 2373,
        },
        partnerY: {
          id: 506,
        },
        round_number: 5,
        event_id: 190,
      },
      {
        partnerX: {
          id: 2403,
        },
        partnerY: {
          id: 270,
        },
        round_number: 5,
        event_id: 190,
      },
      {
        partnerX: {
          id: 12,
        },
        partnerY: {
          id: 2364,
        },
        round_number: 2,
        event_id: 190,
      },
      {
        partnerX: {
          id: 1933,
        },
        partnerY: {
          id: 270,
        },
        round_number: 2,
        event_id: 190,
      },
      {
        partnerX: {
          id: 2260,
        },
        partnerY: {
          id: 8,
        },
        round_number: 2,
        event_id: 190,
      },
      {
        partnerX: {
          id: 2373,
        },
        partnerY: {
          id: 34,
        },
        round_number: 2,
        event_id: 190,
      },
      {
        partnerX: {
          id: 1578,
        },
        partnerY: {
          id: 2271,
        },
        round_number: 2,
        event_id: 190,
      },
      {
        partnerX: {
          id: 2110,
        },
        partnerY: {
          id: 506,
        },
        round_number: 2,
        event_id: 190,
      },
      {
        partnerX: {
          id: 2412,
        },
        partnerY: {
          id: 541,
        },
        round_number: 2,
        event_id: 190,
      },
      {
        partnerX: {
          id: 12,
        },
        partnerY: {
          id: 270,
        },
        round_number: 3,
        event_id: 190,
      },
      {
        partnerX: {
          id: 115,
        },
        partnerY: {
          id: 2364,
        },
        round_number: 3,
        event_id: 190,
      },
      {
        partnerX: {
          id: 2271,
        },
        partnerY: {
          id: 506,
        },
        round_number: 3,
        event_id: 190,
      },
      {
        partnerX: {
          id: 2365,
        },
        partnerY: {
          id: 541,
        },
        round_number: 3,
        event_id: 190,
      },
      {
        partnerX: {
          id: 1918,
        },
        partnerY: {
          id: 2260,
        },
        round_number: 3,
        event_id: 190,
      },
      {
        partnerX: {
          id: 1560,
        },
        partnerY: {
          id: 1578,
        },
        round_number: 3,
        event_id: 190,
      },
      {
        partnerX: {
          id: 2373,
        },
        partnerY: {
          id: 8,
        },
        round_number: 3,
        event_id: 190,
      },
      {
        partnerX: {
          id: 1933,
        },
        partnerY: {
          id: 590,
        },
        round_number: 3,
        event_id: 190,
      },
      {
        partnerX: {
          id: 1918,
        },
        partnerY: {
          id: 8,
        },
        round_number: 4,
        event_id: 190,
      },
      {
        partnerX: {
          id: 1933,
        },
        partnerY: {
          id: 2365,
        },
        round_number: 4,
        event_id: 190,
      },
      {
        partnerX: {
          id: 115,
        },
        partnerY: {
          id: 541,
        },
        round_number: 4,
        event_id: 190,
      },
      {
        partnerX: {
          id: 1560,
        },
        partnerY: {
          id: 2364,
        },
        round_number: 4,
        event_id: 190,
      },
      {
        partnerX: {
          id: 34,
        },
        partnerY: {
          id: 506,
        },
        round_number: 4,
        event_id: 190,
      },
      {
        partnerX: {
          id: 2373,
        },
        partnerY: {
          id: 270,
        },
        round_number: 4,
        event_id: 190,
      },
      {
        partnerX: {
          id: 12,
        },
        partnerY: {
          id: 2403,
        },
        round_number: 4,
        event_id: 190,
      },
      {
        partnerX: {
          id: 2260,
        },
        partnerY: {
          id: 2271,
        },
        round_number: 4,
        event_id: 190,
      },
      {
        partnerX: {
          id: 2247,
        },
        partnerY: {
          id: 2412,
        },
        round_number: 4,
        event_id: 190,
      },
      {
        partnerX: {
          id: 1578,
        },
        partnerY: {
          id: 2396,
        },
        round_number: 4,
        event_id: 190,
      },
      {
        partnerX: {
          id: 2364,
        },
        partnerY: {
          id: 541,
        },
        round_number: 7,
        event_id: 190,
      },
      {
        partnerX: {
          id: 115,
        },
        partnerY: {
          id: 8,
        },
        round_number: 7,
        event_id: 190,
      },
      {
        partnerX: {
          id: 2110,
        },
        partnerY: {
          id: 270,
        },
        round_number: 7,
        event_id: 190,
      },
      {
        partnerX: {
          id: 12,
        },
        partnerY: {
          id: 2396,
        },
        round_number: 7,
        event_id: 190,
      },
      {
        partnerX: {
          id: 2365,
        },
        partnerY: {
          id: 8,
        },
        round_number: 5,
        event_id: 190,
      },
      {
        partnerX: {
          id: 1560,
        },
        partnerY: {
          id: 1933,
        },
        round_number: 5,
        event_id: 190,
      },
      {
        partnerX: {
          id: 2403,
        },
        partnerY: {
          id: 2412,
        },
        round_number: 6,
        event_id: 190,
      },
      {
        partnerX: {
          id: 2365,
        },
        partnerY: {
          id: 2373,
        },
        round_number: 6,
        event_id: 190,
      },
      {
        partnerX: {
          id: 115,
        },
        partnerY: {
          id: 1918,
        },
        round_number: 6,
        event_id: 190,
      },
      {
        partnerX: {
          id: 506,
        },
        partnerY: {
          id: 541,
        },
        round_number: 6,
        event_id: 190,
      },
      {
        partnerX: {
          id: 1560,
        },
        partnerY: {
          id: 34,
        },
        round_number: 6,
        event_id: 190,
      },
      {
        partnerX: {
          id: 2364,
        },
        partnerY: {
          id: 270,
        },
        round_number: 6,
        event_id: 190,
      },
      {
        partnerX: {
          id: 2396,
        },
        partnerY: {
          id: 8,
        },
        round_number: 6,
        event_id: 190,
      },
      {
        partnerX: {
          id: 12,
        },
        partnerY: {
          id: 590,
        },
        round_number: 6,
        event_id: 190,
      },
      {
        partnerX: {
          id: 2247,
        },
        partnerY: {
          id: 2260,
        },
        round_number: 6,
        event_id: 190,
      },
      {
        partnerX: {
          id: 1918,
        },
        partnerY: {
          id: 590,
        },
        round_number: 7,
        event_id: 190,
      },
      {
        partnerX: {
          id: 1560,
        },
        partnerY: {
          id: 506,
        },
        round_number: 7,
        event_id: 190,
      },
      {
        partnerX: {
          id: 2247,
        },
        partnerY: {
          id: 34,
        },
        round_number: 7,
        event_id: 190,
      },
      {
        partnerX: {
          id: 1578,
        },
        partnerY: {
          id: 2365,
        },
        round_number: 7,
        event_id: 190,
      },
      {
        partnerX: {
          id: 2260,
        },
        partnerY: {
          id: 2403,
        },
        round_number: 7,
        event_id: 190,
      },
      {
        partnerX: {
          id: 115,
        },
        partnerY: {
          id: 2110,
        },
        round_number: 8,
        event_id: 190,
      },
      {
        partnerX: {
          id: 541,
        },
        partnerY: {
          id: 8,
        },
        round_number: 8,
        event_id: 190,
      },
      {
        partnerX: {
          id: 2403,
        },
        partnerY: {
          id: 506,
        },
        round_number: 8,
        event_id: 190,
      },
      {
        partnerX: {
          id: 2373,
        },
        partnerY: {
          id: 2412,
        },
        round_number: 8,
        event_id: 190,
      },
      {
        partnerX: {
          id: 2247,
        },
        partnerY: {
          id: 2365,
        },
        round_number: 8,
        event_id: 190,
      },
      {
        partnerX: {
          id: 1933,
        },
        partnerY: {
          id: 2271,
        },
        round_number: 8,
        event_id: 190,
      },
      {
        partnerX: {
          id: 1560,
        },
        partnerY: {
          id: 590,
        },
        round_number: 8,
        event_id: 190,
      },
      {
        partnerX: {
          id: 2396,
        },
        partnerY: {
          id: 270,
        },
        round_number: 8,
        event_id: 190,
      },
      {
        partnerX: {
          id: 2364,
        },
        partnerY: {
          id: 34,
        },
        round_number: 8,
        event_id: 190,
      },
      {
        partnerX: {
          id: 2338,
        },
        partnerY: {
          id: 2384,
        },
        round_number: 1,
        event_id: 191,
      },
      {
        partnerX: {
          id: 2097,
        },
        partnerY: {
          id: 2206,
        },
        round_number: 1,
        event_id: 192,
      },
      {
        partnerX: {
          id: 1933,
        },
        partnerY: {
          id: 513,
        },
        round_number: 2,
        event_id: 191,
      },
      {
        partnerX: {
          id: 1752,
        },
        partnerY: {
          id: 2361,
        },
        round_number: 1,
        event_id: 192,
      },
      {
        partnerX: {
          id: 115,
        },
        partnerY: {
          id: 2345,
        },
        round_number: 1,
        event_id: 192,
      },
      {
        partnerX: {
          id: 2120,
        },
        partnerY: {
          id: 2218,
        },
        round_number: 1,
        event_id: 192,
      },
      {
        partnerX: {
          id: 1572,
        },
        partnerY: {
          id: 2329,
        },
        round_number: 2,
        event_id: 191,
      },
      {
        partnerX: {
          id: 115,
        },
        partnerY: {
          id: 270,
        },
        round_number: 2,
        event_id: 191,
      },
      {
        partnerX: {
          id: 1933,
        },
        partnerY: {
          id: 212,
        },
        round_number: 1,
        event_id: 192,
      },
      {
        partnerX: {
          id: 12,
        },
        partnerY: {
          id: 2227,
        },
        round_number: 2,
        event_id: 191,
      },
      {
        partnerX: {
          id: 2083,
        },
        partnerY: {
          id: 2178,
        },
        round_number: 2,
        event_id: 191,
      },
      {
        partnerX: {
          id: 1934,
        },
        partnerY: {
          id: 34,
        },
        round_number: 2,
        event_id: 191,
      },
      {
        partnerX: {
          id: 1901,
        },
        partnerY: {
          id: 8,
        },
        round_number: 2,
        event_id: 191,
      },
      {
        partnerX: {
          id: 1635,
        },
        partnerY: {
          id: 2254,
        },
        round_number: 1,
        event_id: 192,
      },
      {
        partnerX: {
          id: 2178,
        },
        partnerY: {
          id: 2219,
        },
        round_number: 1,
        event_id: 192,
      },
      {
        partnerX: {
          id: 2286,
        },
        partnerY: {
          id: 8,
        },
        round_number: 1,
        event_id: 192,
      },
      {
        partnerX: {
          id: 2330,
        },
        partnerY: {
          id: 2374,
        },
        round_number: 1,
        event_id: 192,
      },
      {
        partnerX: {
          id: 1533,
        },
        partnerY: {
          id: 2227,
        },
        round_number: 3,
        event_id: 191,
      },
      {
        partnerX: {
          id: 1572,
        },
        partnerY: {
          id: 1901,
        },
        round_number: 3,
        event_id: 191,
      },
      {
        partnerX: {
          id: 270,
        },
        partnerY: {
          id: 8,
        },
        round_number: 3,
        event_id: 191,
      },
      {
        partnerX: {
          id: 34,
        },
        partnerY: {
          id: 513,
        },
        round_number: 3,
        event_id: 191,
      },
      {
        partnerX: {
          id: 1934,
        },
        partnerY: {
          id: 2384,
        },
        round_number: 3,
        event_id: 191,
      },
      {
        partnerX: {
          id: 1071,
        },
        partnerY: {
          id: 2395,
        },
        round_number: 3,
        event_id: 191,
      },
      {
        partnerX: {
          id: 1933,
        },
        partnerY: {
          id: 2083,
        },
        round_number: 3,
        event_id: 191,
      },
      {
        partnerX: {
          id: 1993,
        },
        partnerY: {
          id: 52,
        },
        round_number: 3,
        event_id: 191,
      },
      {
        partnerX: {
          id: 2178,
        },
        partnerY: {
          id: 2329,
        },
        round_number: 3,
        event_id: 191,
      },
      {
        partnerX: {
          id: 12,
        },
        partnerY: {
          id: 2372,
        },
        round_number: 3,
        event_id: 191,
      },
      {
        partnerX: {
          id: 1901,
        },
        partnerY: {
          id: 2227,
        },
        round_number: 1,
        event_id: 192,
      },
      {
        partnerX: {
          id: 2120,
        },
        partnerY: {
          id: 2254,
        },
        round_number: 2,
        event_id: 192,
      },
      {
        partnerX: {
          id: 1635,
        },
        partnerY: {
          id: 2374,
        },
        round_number: 2,
        event_id: 192,
      },
      {
        partnerX: {
          id: 115,
        },
        partnerY: {
          id: 270,
        },
        round_number: 2,
        event_id: 192,
      },
      {
        partnerX: {
          id: 1933,
        },
        partnerY: {
          id: 8,
        },
        round_number: 2,
        event_id: 192,
      },
      {
        partnerX: {
          id: 2172,
        },
        partnerY: {
          id: 2227,
        },
        round_number: 3,
        event_id: 192,
      },
      {
        partnerX: {
          id: 2097,
        },
        partnerY: {
          id: 2361,
        },
        round_number: 2,
        event_id: 192,
      },
      {
        partnerX: {
          id: 1752,
        },
        partnerY: {
          id: 2227,
        },
        round_number: 2,
        event_id: 192,
      },
      {
        partnerX: {
          id: 2178,
        },
        partnerY: {
          id: 2206,
        },
        round_number: 2,
        event_id: 192,
      },
      {
        partnerX: {
          id: 1901,
        },
        partnerY: {
          id: 2387,
        },
        round_number: 2,
        event_id: 192,
      },
      {
        partnerX: {
          id: 2172,
        },
        partnerY: {
          id: 2219,
        },
        round_number: 2,
        event_id: 192,
      },
      {
        partnerX: {
          id: 2220,
        },
        partnerY: {
          id: 2330,
        },
        round_number: 2,
        event_id: 192,
      },
      {
        partnerX: {
          id: 115,
        },
        partnerY: {
          id: 1901,
        },
        round_number: 3,
        event_id: 192,
      },
      {
        partnerX: {
          id: 2219,
        },
        partnerY: {
          id: 2254,
        },
        round_number: 3,
        event_id: 192,
      },
      {
        partnerX: {
          id: 1635,
        },
        partnerY: {
          id: 2387,
        },
        round_number: 3,
        event_id: 192,
      },
      {
        partnerX: {
          id: 2345,
        },
        partnerY: {
          id: 8,
        },
        round_number: 3,
        event_id: 192,
      },
      {
        partnerX: {
          id: 2206,
        },
        partnerY: {
          id: 270,
        },
        round_number: 3,
        event_id: 192,
      },
      {
        partnerX: {
          id: 1752,
        },
        partnerY: {
          id: 2178,
        },
        round_number: 3,
        event_id: 192,
      },
      {
        partnerX: {
          id: 2220,
        },
        partnerY: {
          id: 2374,
        },
        round_number: 3,
        event_id: 192,
      },
      {
        partnerX: {
          id: 1933,
        },
        partnerY: {
          id: 2097,
        },
        round_number: 3,
        event_id: 192,
      },
      {
        partnerX: {
          id: 2120,
        },
        partnerY: {
          id: 2361,
        },
        round_number: 3,
        event_id: 192,
      },
      {
        partnerX: {
          id: 115,
        },
        partnerY: {
          id: 2120,
        },
        round_number: 4,
        event_id: 192,
      },
      {
        partnerX: {
          id: 1635,
        },
        partnerY: {
          id: 2227,
        },
        round_number: 4,
        event_id: 192,
      },
      {
        partnerX: {
          id: 2178,
        },
        partnerY: {
          id: 270,
        },
        round_number: 4,
        event_id: 192,
      },
      {
        partnerX: {
          id: 2345,
        },
        partnerY: {
          id: 2374,
        },
        round_number: 4,
        event_id: 192,
      },
      {
        partnerX: {
          id: 1752,
        },
        partnerY: {
          id: 8,
        },
        round_number: 4,
        event_id: 192,
      },
      {
        partnerX: {
          id: 1933,
        },
        partnerY: {
          id: 2330,
        },
        round_number: 4,
        event_id: 192,
      },
      {
        partnerX: {
          id: 212,
        },
        partnerY: {
          id: 2361,
        },
        round_number: 4,
        event_id: 192,
      },
      {
        partnerX: {
          id: 1901,
        },
        partnerY: {
          id: 2206,
        },
        round_number: 4,
        event_id: 192,
      },
      {
        partnerX: {
          id: 2097,
        },
        partnerY: {
          id: 2172,
        },
        round_number: 5,
        event_id: 192,
      },
      {
        partnerX: {
          id: 2120,
        },
        partnerY: {
          id: 2374,
        },
        round_number: 5,
        event_id: 192,
      },
      {
        partnerX: {
          id: 2227,
        },
        partnerY: {
          id: 8,
        },
        round_number: 5,
        event_id: 192,
      },
      {
        partnerX: {
          id: 1933,
        },
        partnerY: {
          id: 270,
        },
        round_number: 5,
        event_id: 192,
      },
      {
        partnerX: {
          id: 1901,
        },
        partnerY: {
          id: 2361,
        },
        round_number: 5,
        event_id: 192,
      },
      {
        partnerX: {
          id: 115,
        },
        partnerY: {
          id: 1635,
        },
        round_number: 5,
        event_id: 192,
      },
      {
        partnerX: {
          id: 2218,
        },
        partnerY: {
          id: 2219,
        },
        round_number: 5,
        event_id: 192,
      },
      {
        partnerX: {
          id: 1752,
        },
        partnerY: {
          id: 2330,
        },
        round_number: 5,
        event_id: 192,
      },
      {
        partnerX: {
          id: 2178,
        },
        partnerY: {
          id: 2387,
        },
        round_number: 5,
        event_id: 192,
      },
      {
        partnerX: {
          id: 2330,
        },
        partnerY: {
          id: 2345,
        },
        round_number: 6,
        event_id: 192,
      },
      {
        partnerX: {
          id: 115,
        },
        partnerY: {
          id: 2374,
        },
        round_number: 6,
        event_id: 192,
      },
      {
        partnerX: {
          id: 2219,
        },
        partnerY: {
          id: 2361,
        },
        round_number: 6,
        event_id: 192,
      },
      {
        partnerX: {
          id: 1933,
        },
        partnerY: {
          id: 2387,
        },
        round_number: 6,
        event_id: 192,
      },
      {
        partnerX: {
          id: 2206,
        },
        partnerY: {
          id: 2227,
        },
        round_number: 6,
        event_id: 192,
      },
      {
        partnerX: {
          id: 2097,
        },
        partnerY: {
          id: 2218,
        },
        round_number: 6,
        event_id: 192,
      },
      {
        partnerX: {
          id: 212,
        },
        partnerY: {
          id: 2120,
        },
        round_number: 6,
        event_id: 192,
      },
      {
        partnerX: {
          id: 2220,
        },
        partnerY: {
          id: 8,
        },
        round_number: 6,
        event_id: 192,
      },
      {
        partnerX: {
          id: 1901,
        },
        partnerY: {
          id: 270,
        },
        round_number: 6,
        event_id: 192,
      },
      {
        partnerX: {
          id: 1752,
        },
        partnerY: {
          id: 2286,
        },
        round_number: 6,
        event_id: 192,
      },
      {
        partnerX: {
          id: 2120,
        },
        partnerY: {
          id: 270,
        },
        round_number: 7,
        event_id: 192,
      },
      {
        partnerX: {
          id: 1578,
        },
        partnerY: {
          id: 1901,
        },
        round_number: 6,
        event_id: 187,
      },
      {
        partnerX: {
          id: 12,
        },
        partnerY: {
          id: 1933,
        },
        round_number: 6,
        event_id: 187,
      },
      {
        partnerX: {
          id: 2286,
        },
        partnerY: {
          id: 2330,
        },
        round_number: 7,
        event_id: 192,
      },
      {
        partnerX: {
          id: 1635,
        },
        partnerY: {
          id: 2172,
        },
        round_number: 7,
        event_id: 192,
      },
      {
        partnerX: {
          id: 1933,
        },
        partnerY: {
          id: 2206,
        },
        round_number: 7,
        event_id: 192,
      },
      {
        partnerX: {
          id: 1578,
        },
        partnerY: {
          id: 8,
        },
        round_number: 4,
        event_id: 187,
      },
      {
        partnerX: {
          id: 115,
        },
        partnerY: {
          id: 2219,
        },
        round_number: 7,
        event_id: 192,
      },
      {
        partnerX: {
          id: 2374,
        },
        partnerY: {
          id: 2387,
        },
        round_number: 7,
        event_id: 192,
      },
      {
        partnerX: {
          id: 2097,
        },
        partnerY: {
          id: 2345,
        },
        round_number: 7,
        event_id: 192,
      },
      {
        partnerX: {
          id: 2178,
        },
        partnerY: {
          id: 2227,
        },
        round_number: 7,
        event_id: 192,
      },
      {
        partnerX: {
          id: 2361,
        },
        partnerY: {
          id: 8,
        },
        round_number: 7,
        event_id: 192,
      },
      {
        partnerX: {
          id: 12,
        },
        partnerY: {
          id: 2249,
        },
        round_number: 1,
        event_id: 187,
      },
      {
        partnerX: {
          id: 1933,
        },
        partnerY: {
          id: 8,
        },
        round_number: 1,
        event_id: 187,
      },
      {
        partnerX: {
          id: 115,
        },
        partnerY: {
          id: 2249,
        },
        round_number: 6,
        event_id: 187,
      },
      {
        partnerX: {
          id: 2245,
        },
        partnerY: {
          id: 34,
        },
        round_number: 1,
        event_id: 187,
      },
      {
        partnerX: {
          id: 1578,
        },
        partnerY: {
          id: 2371,
        },
        round_number: 1,
        event_id: 187,
      },
      {
        partnerX: {
          id: 2227,
        },
        partnerY: {
          id: 541,
        },
        round_number: 1,
        event_id: 187,
      },
      {
        partnerX: {
          id: 115,
        },
        partnerY: {
          id: 506,
        },
        round_number: 1,
        event_id: 187,
      },
      {
        partnerX: {
          id: 1752,
        },
        partnerY: {
          id: 1933,
        },
        round_number: 8,
        event_id: 192,
      },
      {
        partnerX: {
          id: 2172,
        },
        partnerY: {
          id: 2220,
        },
        round_number: 8,
        event_id: 192,
      },
      {
        partnerX: {
          id: 2227,
        },
        partnerY: {
          id: 2374,
        },
        round_number: 8,
        event_id: 192,
      },
      {
        partnerX: {
          id: 115,
        },
        partnerY: {
          id: 8,
        },
        round_number: 8,
        event_id: 192,
      },
      {
        partnerX: {
          id: 1901,
        },
        partnerY: {
          id: 2330,
        },
        round_number: 8,
        event_id: 192,
      },
      {
        partnerX: {
          id: 2097,
        },
        partnerY: {
          id: 2286,
        },
        round_number: 8,
        event_id: 192,
      },
      {
        partnerX: {
          id: 2206,
        },
        partnerY: {
          id: 2387,
        },
        round_number: 8,
        event_id: 192,
      },
      {
        partnerX: {
          id: 2361,
        },
        partnerY: {
          id: 270,
        },
        round_number: 8,
        event_id: 192,
      },
      {
        partnerX: {
          id: 2120,
        },
        partnerY: {
          id: 2178,
        },
        round_number: 8,
        event_id: 192,
      },
      {
        partnerX: {
          id: 212,
        },
        partnerY: {
          id: 2219,
        },
        round_number: 8,
        event_id: 192,
      },
      {
        partnerX: {
          id: 2172,
        },
        partnerY: {
          id: 270,
        },
        round_number: 4,
        event_id: 187,
      },
      {
        partnerX: {
          id: 115,
        },
        partnerY: {
          id: 34,
        },
        round_number: 4,
        event_id: 187,
      },
      {
        partnerX: {
          id: 1933,
        },
        partnerY: {
          id: 2371,
        },
        round_number: 4,
        event_id: 187,
      },
      {
        partnerX: {
          id: 12,
        },
        partnerY: {
          id: 1578,
        },
        round_number: 2,
        event_id: 187,
      },
      {
        partnerX: {
          id: 2245,
        },
        partnerY: {
          id: 541,
        },
        round_number: 4,
        event_id: 187,
      },
      {
        partnerX: {
          id: 1933,
        },
        partnerY: {
          id: 34,
        },
        round_number: 2,
        event_id: 187,
      },
      {
        partnerX: {
          id: 115,
        },
        partnerY: {
          id: 2371,
        },
        round_number: 2,
        event_id: 187,
      },
      {
        partnerX: {
          id: 12,
        },
        partnerY: {
          id: 506,
        },
        round_number: 4,
        event_id: 187,
      },
      {
        partnerX: {
          id: 2249,
        },
        partnerY: {
          id: 541,
        },
        round_number: 2,
        event_id: 187,
      },
      {
        partnerX: {
          id: 2227,
        },
        partnerY: {
          id: 2245,
        },
        round_number: 2,
        event_id: 187,
      },
      {
        partnerX: {
          id: 1901,
        },
        partnerY: {
          id: 506,
        },
        round_number: 2,
        event_id: 187,
      },
      {
        partnerX: {
          id: 2249,
        },
        partnerY: {
          id: 34,
        },
        round_number: 5,
        event_id: 187,
      },
      {
        partnerX: {
          id: 12,
        },
        partnerY: {
          id: 270,
        },
        round_number: 3,
        event_id: 187,
      },
      {
        partnerX: {
          id: 2227,
        },
        partnerY: {
          id: 8,
        },
        round_number: 3,
        event_id: 187,
      },
      {
        partnerX: {
          id: 2227,
        },
        partnerY: {
          id: 2371,
        },
        round_number: 5,
        event_id: 187,
      },
      {
        partnerX: {
          id: 1578,
        },
        partnerY: {
          id: 2172,
        },
        round_number: 5,
        event_id: 187,
      },
      {
        partnerX: {
          id: 270,
        },
        partnerY: {
          id: 506,
        },
        round_number: 5,
        event_id: 187,
      },
      {
        partnerX: {
          id: 115,
        },
        partnerY: {
          id: 541,
        },
        round_number: 5,
        event_id: 187,
      },
      {
        partnerX: {
          id: 2371,
        },
        partnerY: {
          id: 34,
        },
        round_number: 3,
        event_id: 187,
      },
      {
        partnerX: {
          id: 115,
        },
        partnerY: {
          id: 1901,
        },
        round_number: 3,
        event_id: 187,
      },
      {
        partnerX: {
          id: 1578,
        },
        partnerY: {
          id: 541,
        },
        round_number: 3,
        event_id: 187,
      },
      {
        partnerX: {
          id: 1933,
        },
        partnerY: {
          id: 2249,
        },
        round_number: 3,
        event_id: 187,
      },
      {
        partnerX: {
          id: 12,
        },
        partnerY: {
          id: 8,
        },
        round_number: 5,
        event_id: 187,
      },
      {
        partnerX: {
          id: 1901,
        },
        partnerY: {
          id: 2249,
        },
        round_number: 4,
        event_id: 187,
      },
      {
        partnerX: {
          id: 1578,
        },
        partnerY: {
          id: 2249,
        },
        round_number: 7,
        event_id: 187,
      },
      {
        partnerX: {
          id: 2227,
        },
        partnerY: {
          id: 506,
        },
        round_number: 6,
        event_id: 187,
      },
      {
        partnerX: {
          id: 34,
        },
        partnerY: {
          id: 541,
        },
        round_number: 6,
        event_id: 187,
      },
      {
        partnerX: {
          id: 2371,
        },
        partnerY: {
          id: 270,
        },
        round_number: 6,
        event_id: 187,
      },
      {
        partnerX: {
          id: 34,
        },
        partnerY: {
          id: 506,
        },
        round_number: 7,
        event_id: 187,
      },
      {
        partnerX: {
          id: 1933,
        },
        partnerY: {
          id: 270,
        },
        round_number: 7,
        event_id: 187,
      },
      {
        partnerX: {
          id: 1901,
        },
        partnerY: {
          id: 2227,
        },
        round_number: 7,
        event_id: 187,
      },
      {
        partnerX: {
          id: 115,
        },
        partnerY: {
          id: 2172,
        },
        round_number: 7,
        event_id: 187,
      },
      {
        partnerX: {
          id: 2371,
        },
        partnerY: {
          id: 541,
        },
        round_number: 7,
        event_id: 187,
      },
      {
        partnerX: {
          id: 2172,
        },
        partnerY: {
          id: 2249,
        },
        round_number: 8,
        event_id: 187,
      },
      {
        partnerX: {
          id: 1901,
        },
        partnerY: {
          id: 270,
        },
        round_number: 8,
        event_id: 187,
      },
      {
        partnerX: {
          id: 12,
        },
        partnerY: {
          id: 34,
        },
        round_number: 8,
        event_id: 187,
      },
      {
        partnerX: {
          id: 115,
        },
        partnerY: {
          id: 1933,
        },
        round_number: 8,
        event_id: 187,
      },
      {
        partnerX: {
          id: 506,
        },
        partnerY: {
          id: 541,
        },
        round_number: 8,
        event_id: 187,
      },
      {
        partnerX: {
          id: 2422,
        },
        partnerY: {
          id: 2532,
        },
        round_number: 8,
        event_id: 196,
      },
      {
        partnerX: {
          id: 2429,
        },
        partnerY: {
          id: 2431,
        },
        round_number: 5,
        event_id: 196,
      },
      {
        partnerX: {
          id: 2357,
        },
        partnerY: {
          id: 2532,
        },
        round_number: 5,
        event_id: 196,
      },
      {
        partnerX: {
          id: 2344,
        },
        partnerY: {
          id: 2530,
        },
        round_number: 1,
        event_id: 196,
      },
      {
        partnerX: {
          id: 2420,
        },
        partnerY: {
          id: 2515,
        },
        round_number: 5,
        event_id: 196,
      },
      {
        partnerX: {
          id: 1533,
        },
        partnerY: {
          id: 2390,
        },
        round_number: 1,
        event_id: 196,
      },
      {
        partnerX: {
          id: 2381,
        },
        partnerY: {
          id: 2515,
        },
        round_number: 1,
        event_id: 196,
      },
      {
        partnerX: {
          id: 2420,
        },
        partnerY: {
          id: 2529,
        },
        round_number: 1,
        event_id: 196,
      },
      {
        partnerX: {
          id: 2429,
        },
        partnerY: {
          id: 2506,
        },
        round_number: 1,
        event_id: 196,
      },
      {
        partnerX: {
          id: 2381,
        },
        partnerY: {
          id: 2529,
        },
        round_number: 5,
        event_id: 196,
      },
      {
        partnerX: {
          id: 2328,
        },
        partnerY: {
          id: 2420,
        },
        round_number: 2,
        event_id: 196,
      },
      {
        partnerX: {
          id: 2344,
        },
        partnerY: {
          id: 2506,
        },
        round_number: 2,
        event_id: 196,
      },
      {
        partnerX: {
          id: 1533,
        },
        partnerY: {
          id: 2357,
        },
        round_number: 2,
        event_id: 196,
      },
      {
        partnerX: {
          id: 2529,
        },
        partnerY: {
          id: 2531,
        },
        round_number: 2,
        event_id: 196,
      },
      {
        partnerX: {
          id: 2381,
        },
        partnerY: {
          id: 2422,
        },
        round_number: 2,
        event_id: 196,
      },
      {
        partnerX: {
          id: 2431,
        },
        partnerY: {
          id: 2515,
        },
        round_number: 2,
        event_id: 196,
      },
      {
        partnerX: {
          id: 2488,
        },
        partnerY: {
          id: 2532,
        },
        round_number: 2,
        event_id: 196,
      },
      {
        partnerX: {
          id: 2344,
        },
        partnerY: {
          id: 2515,
        },
        round_number: 8,
        event_id: 196,
      },
      {
        partnerX: {
          id: 2506,
        },
        partnerY: {
          id: 2529,
        },
        round_number: 8,
        event_id: 196,
      },
      {
        partnerX: {
          id: 1533,
        },
        partnerY: {
          id: 2381,
        },
        round_number: 3,
        event_id: 196,
      },
      {
        partnerX: {
          id: 2390,
        },
        partnerY: {
          id: 2422,
        },
        round_number: 6,
        event_id: 196,
      },
      {
        partnerX: {
          id: 2529,
        },
        partnerY: {
          id: 2530,
        },
        round_number: 3,
        event_id: 196,
      },
      {
        partnerX: {
          id: 2328,
        },
        partnerY: {
          id: 2506,
        },
        round_number: 3,
        event_id: 196,
      },
      {
        partnerX: {
          id: 2515,
        },
        partnerY: {
          id: 2533,
        },
        round_number: 3,
        event_id: 196,
      },
      {
        partnerX: {
          id: 2420,
        },
        partnerY: {
          id: 2422,
        },
        round_number: 3,
        event_id: 196,
      },
      {
        partnerX: {
          id: 2431,
        },
        partnerY: {
          id: 2531,
        },
        round_number: 3,
        event_id: 196,
      },
      {
        partnerX: {
          id: 2344,
        },
        partnerY: {
          id: 2532,
        },
        round_number: 3,
        event_id: 196,
      },
      {
        partnerX: {
          id: 2357,
        },
        partnerY: {
          id: 2488,
        },
        round_number: 3,
        event_id: 196,
      },
      {
        partnerX: {
          id: 1533,
        },
        partnerY: {
          id: 2533,
        },
        round_number: 6,
        event_id: 196,
      },
      {
        partnerX: {
          id: 2429,
        },
        partnerY: {
          id: 2530,
        },
        round_number: 4,
        event_id: 196,
      },
      {
        partnerX: {
          id: 2328,
        },
        partnerY: {
          id: 2381,
        },
        round_number: 6,
        event_id: 196,
      },
      {
        partnerX: {
          id: 2328,
        },
        partnerY: {
          id: 2531,
        },
        round_number: 4,
        event_id: 196,
      },
      {
        partnerX: {
          id: 1533,
        },
        partnerY: {
          id: 2515,
        },
        round_number: 4,
        event_id: 196,
      },
      {
        partnerX: {
          id: 2420,
        },
        partnerY: {
          id: 2488,
        },
        round_number: 6,
        event_id: 196,
      },
      {
        partnerX: {
          id: 2506,
        },
        partnerY: {
          id: 2515,
        },
        round_number: 6,
        event_id: 196,
      },
      {
        partnerX: {
          id: 2381,
        },
        partnerY: {
          id: 2420,
        },
        round_number: 4,
        event_id: 196,
      },
      {
        partnerX: {
          id: 2431,
        },
        partnerY: {
          id: 2532,
        },
        round_number: 4,
        event_id: 196,
      },
      {
        partnerX: {
          id: 2422,
        },
        partnerY: {
          id: 2506,
        },
        round_number: 4,
        event_id: 196,
      },
      {
        partnerX: {
          id: 2344,
        },
        partnerY: {
          id: 2533,
        },
        round_number: 4,
        event_id: 196,
      },
      {
        partnerX: {
          id: 2390,
        },
        partnerY: {
          id: 2488,
        },
        round_number: 4,
        event_id: 196,
      },
      {
        partnerX: {
          id: 2357,
        },
        partnerY: {
          id: 2429,
        },
        round_number: 6,
        event_id: 196,
      },
      {
        partnerX: {
          id: 1533,
        },
        partnerY: {
          id: 2328,
        },
        round_number: 5,
        event_id: 196,
      },
      {
        partnerX: {
          id: 2488,
        },
        partnerY: {
          id: 2533,
        },
        round_number: 5,
        event_id: 196,
      },
      {
        partnerX: {
          id: 2390,
        },
        partnerY: {
          id: 2506,
        },
        round_number: 5,
        event_id: 196,
      },
      {
        partnerX: {
          id: 2529,
        },
        partnerY: {
          id: 2533,
        },
        round_number: 10,
        event_id: 196,
      },
      {
        partnerX: {
          id: 2390,
        },
        partnerY: {
          id: 2533,
        },
        round_number: 7,
        event_id: 196,
      },
      {
        partnerX: {
          id: 2422,
        },
        partnerY: {
          id: 2529,
        },
        round_number: 7,
        event_id: 196,
      },
      {
        partnerX: {
          id: 2381,
        },
        partnerY: {
          id: 2506,
        },
        round_number: 9,
        event_id: 196,
      },
      {
        partnerX: {
          id: 2431,
        },
        partnerY: {
          id: 2488,
        },
        round_number: 7,
        event_id: 196,
      },
      {
        partnerX: {
          id: 1533,
        },
        partnerY: {
          id: 2506,
        },
        round_number: 7,
        event_id: 196,
      },
      {
        partnerX: {
          id: 2429,
        },
        partnerY: {
          id: 2515,
        },
        round_number: 7,
        event_id: 196,
      },
      {
        partnerX: {
          id: 2357,
        },
        partnerY: {
          id: 2381,
        },
        round_number: 7,
        event_id: 196,
      },
      {
        partnerX: {
          id: 2488,
        },
        partnerY: {
          id: 2515,
        },
        round_number: 10,
        event_id: 196,
      },
      {
        partnerX: {
          id: 2431,
        },
        partnerY: {
          id: 2506,
        },
        round_number: 10,
        event_id: 196,
      },
      {
        partnerX: {
          id: 2390,
        },
        partnerY: {
          id: 2532,
        },
        round_number: 9,
        event_id: 196,
      },
      {
        partnerX: {
          id: 2381,
        },
        partnerY: {
          id: 2488,
        },
        round_number: 8,
        event_id: 196,
      },
      {
        partnerX: {
          id: 2422,
        },
        partnerY: {
          id: 2531,
        },
        round_number: 10,
        event_id: 196,
      },
      {
        partnerX: {
          id: 1533,
        },
        partnerY: {
          id: 2344,
        },
        round_number: 9,
        event_id: 196,
      },
      {
        partnerX: {
          id: 2531,
        },
        partnerY: {
          id: 2533,
        },
        round_number: 9,
        event_id: 196,
      },
      {
        partnerX: {
          id: 2429,
        },
        partnerY: {
          id: 2488,
        },
        round_number: 9,
        event_id: 196,
      },
      {
        partnerX: {
          id: 2431,
        },
        partnerY: {
          id: 2529,
        },
        round_number: 9,
        event_id: 196,
      },
      {
        partnerX: {
          id: 2344,
        },
        partnerY: {
          id: 2357,
        },
        round_number: 10,
        event_id: 196,
      },
      {
        partnerX: {
          id: 1533,
        },
        partnerY: {
          id: 2532,
        },
        round_number: 10,
        event_id: 196,
      },
      {
        partnerX: {
          id: 2522,
        },
        partnerY: {
          id: 868,
        },
        round_number: 1,
        event_id: 185,
      },
      {
        partnerX: {
          id: 2590,
        },
        partnerY: {
          id: 621,
        },
        round_number: 1,
        event_id: 185,
      },
      {
        partnerX: {
          id: 1226,
        },
        partnerY: {
          id: 614,
        },
        round_number: 1,
        event_id: 185,
      },
      {
        partnerX: {
          id: 1121,
        },
        partnerY: {
          id: 2522,
        },
        round_number: 4,
        event_id: 185,
      },
      {
        partnerX: {
          id: 2548,
        },
        partnerY: {
          id: 965,
        },
        round_number: 1,
        event_id: 185,
      },
      {
        partnerX: {
          id: 2498,
        },
        partnerY: {
          id: 2586,
        },
        round_number: 1,
        event_id: 185,
      },
      {
        partnerX: {
          id: 2579,
        },
        partnerY: {
          id: 2589,
        },
        round_number: 1,
        event_id: 185,
      },
      {
        partnerX: {
          id: 2551,
        },
        partnerY: {
          id: 651,
        },
        round_number: 1,
        event_id: 185,
      },
      {
        partnerX: {
          id: 115,
        },
        partnerY: {
          id: 2185,
        },
        round_number: 4,
        event_id: 185,
      },
      {
        partnerX: {
          id: 784,
        },
        partnerY: {
          id: 868,
        },
        round_number: 4,
        event_id: 185,
      },
      {
        partnerX: {
          id: 1121,
        },
        partnerY: {
          id: 621,
        },
        round_number: 2,
        event_id: 185,
      },
      {
        partnerX: {
          id: 2585,
        },
        partnerY: {
          id: 2592,
        },
        round_number: 4,
        event_id: 185,
      },
      {
        partnerX: {
          id: 621,
        },
        partnerY: {
          id: 651,
        },
        round_number: 4,
        event_id: 185,
      },
      {
        partnerX: {
          id: 2586,
        },
        partnerY: {
          id: 868,
        },
        round_number: 2,
        event_id: 185,
      },
      {
        partnerX: {
          id: 2589,
        },
        partnerY: {
          id: 614,
        },
        round_number: 2,
        event_id: 185,
      },
      {
        partnerX: {
          id: 1047,
        },
        partnerY: {
          id: 2590,
        },
        round_number: 2,
        event_id: 185,
      },
      {
        partnerX: {
          id: 2497,
        },
        partnerY: {
          id: 2551,
        },
        round_number: 2,
        event_id: 185,
      },
      {
        partnerX: {
          id: 1226,
        },
        partnerY: {
          id: 2592,
        },
        round_number: 2,
        event_id: 185,
      },
      {
        partnerX: {
          id: 2497,
        },
        partnerY: {
          id: 2498,
        },
        round_number: 4,
        event_id: 185,
      },
      {
        partnerX: {
          id: 115,
        },
        partnerY: {
          id: 2585,
        },
        round_number: 2,
        event_id: 185,
      },
      {
        partnerX: {
          id: 2176,
        },
        partnerY: {
          id: 2522,
        },
        round_number: 2,
        event_id: 185,
      },
      {
        partnerX: {
          id: 2579,
        },
        partnerY: {
          id: 965,
        },
        round_number: 2,
        event_id: 185,
      },
      {
        partnerX: {
          id: 2185,
        },
        partnerY: {
          id: 2480,
        },
        round_number: 2,
        event_id: 185,
      },
      {
        partnerX: {
          id: 1444,
        },
        partnerY: {
          id: 651,
        },
        round_number: 2,
        event_id: 185,
      },
      {
        partnerX: {
          id: 1226,
        },
        partnerY: {
          id: 2579,
        },
        round_number: 4,
        event_id: 185,
      },
      {
        partnerX: {
          id: 2498,
        },
        partnerY: {
          id: 2582,
        },
        round_number: 2,
        event_id: 185,
      },
      {
        partnerX: {
          id: 2480,
        },
        partnerY: {
          id: 2589,
        },
        round_number: 4,
        event_id: 185,
      },
      {
        partnerX: {
          id: 2579,
        },
        partnerY: {
          id: 2590,
        },
        round_number: 3,
        event_id: 185,
      },
      {
        partnerX: {
          id: 1121,
        },
        partnerY: {
          id: 2185,
        },
        round_number: 3,
        event_id: 185,
      },
      {
        partnerX: {
          id: 621,
        },
        partnerY: {
          id: 965,
        },
        round_number: 3,
        event_id: 185,
      },
      {
        partnerX: {
          id: 1444,
        },
        partnerY: {
          id: 2585,
        },
        round_number: 3,
        event_id: 185,
      },
      {
        partnerX: {
          id: 1452,
        },
        partnerY: {
          id: 2498,
        },
        round_number: 3,
        event_id: 185,
      },
      {
        partnerX: {
          id: 2480,
        },
        partnerY: {
          id: 868,
        },
        round_number: 3,
        event_id: 185,
      },
      {
        partnerX: {
          id: 115,
        },
        partnerY: {
          id: 2589,
        },
        round_number: 3,
        event_id: 185,
      },
      {
        partnerX: {
          id: 2497,
        },
        partnerY: {
          id: 651,
        },
        round_number: 3,
        event_id: 185,
      },
      {
        partnerX: {
          id: 2522,
        },
        partnerY: {
          id: 2592,
        },
        round_number: 3,
        event_id: 185,
      },
      {
        partnerX: {
          id: 2552,
        },
        partnerY: {
          id: 2647,
        },
        round_number: 2,
        event_id: 218,
      },
      {
        partnerX: {
          id: 2628,
        },
        partnerY: {
          id: 2654,
        },
        round_number: 2,
        event_id: 218,
      },
      {
        partnerX: {
          id: 2616,
        },
        partnerY: {
          id: 2636,
        },
        round_number: 2,
        event_id: 218,
      },
      {
        partnerX: {
          id: 2611,
        },
        partnerY: {
          id: 2626,
        },
        round_number: 2,
        event_id: 218,
      },
      {
        partnerX: {
          id: 2522,
        },
        partnerY: {
          id: 2590,
        },
        round_number: 5,
        event_id: 185,
      },
      {
        partnerX: {
          id: 2592,
        },
        partnerY: {
          id: 621,
        },
        round_number: 5,
        event_id: 185,
      },
      {
        partnerX: {
          id: 2185,
        },
        partnerY: {
          id: 2585,
        },
        round_number: 5,
        event_id: 185,
      },
      {
        partnerX: {
          id: 1226,
        },
        partnerY: {
          id: 965,
        },
        round_number: 5,
        event_id: 185,
      },
      {
        partnerX: {
          id: 2480,
        },
        partnerY: {
          id: 2497,
        },
        round_number: 5,
        event_id: 185,
      },
      {
        partnerX: {
          id: 1452,
        },
        partnerY: {
          id: 784,
        },
        round_number: 5,
        event_id: 185,
      },
      {
        partnerX: {
          id: 1121,
        },
        partnerY: {
          id: 2579,
        },
        round_number: 5,
        event_id: 185,
      },
      {
        partnerX: {
          id: 115,
        },
        partnerY: {
          id: 2586,
        },
        round_number: 5,
        event_id: 185,
      },
      {
        partnerX: {
          id: 2589,
        },
        partnerY: {
          id: 868,
        },
        round_number: 5,
        event_id: 185,
      },
      {
        partnerX: {
          id: 2579,
        },
        partnerY: {
          id: 868,
        },
        round_number: 6,
        event_id: 185,
      },
      {
        partnerX: {
          id: 2628,
        },
        partnerY: {
          id: 2647,
        },
        round_number: 5,
        event_id: 218,
      },
      {
        partnerX: {
          id: 2152,
        },
        partnerY: {
          id: 2652,
        },
        round_number: 5,
        event_id: 218,
      },
      {
        partnerX: {
          id: 2496,
        },
        partnerY: {
          id: 2551,
        },
        round_number: 6,
        event_id: 185,
      },
      {
        partnerX: {
          id: 1226,
        },
        partnerY: {
          id: 621,
        },
        round_number: 6,
        event_id: 185,
      },
      {
        partnerX: {
          id: 115,
        },
        partnerY: {
          id: 784,
        },
        round_number: 6,
        event_id: 185,
      },
      {
        partnerX: {
          id: 1121,
        },
        partnerY: {
          id: 1452,
        },
        round_number: 6,
        event_id: 185,
      },
      {
        partnerX: {
          id: 2152,
        },
        partnerY: {
          id: 2636,
        },
        round_number: 9,
        event_id: 218,
      },
      {
        partnerX: {
          id: 2497,
        },
        partnerY: {
          id: 2522,
        },
        round_number: 6,
        event_id: 185,
      },
      {
        partnerX: {
          id: 2626,
        },
        partnerY: {
          id: 2647,
        },
        round_number: 8,
        event_id: 218,
      },
      {
        partnerX: {
          id: 1047,
        },
        partnerY: {
          id: 2586,
        },
        round_number: 6,
        event_id: 185,
      },
      {
        partnerX: {
          id: 2480,
        },
        partnerY: {
          id: 2498,
        },
        round_number: 6,
        event_id: 185,
      },
      {
        partnerX: {
          id: 2606,
        },
        partnerY: {
          id: 2652,
        },
        round_number: 3,
        event_id: 218,
      },
      {
        partnerX: {
          id: 2611,
        },
        partnerY: {
          id: 2628,
        },
        round_number: 3,
        event_id: 218,
      },
      {
        partnerX: {
          id: 2615,
        },
        partnerY: {
          id: 2636,
        },
        round_number: 5,
        event_id: 218,
      },
      {
        partnerX: {
          id: 2615,
        },
        partnerY: {
          id: 2616,
        },
        round_number: 3,
        event_id: 218,
      },
      {
        partnerX: {
          id: 2615,
        },
        partnerY: {
          id: 2645,
        },
        round_number: 1,
        event_id: 218,
      },
      {
        partnerX: {
          id: 2436,
        },
        partnerY: {
          id: 2626,
        },
        round_number: 5,
        event_id: 218,
      },
      {
        partnerX: {
          id: 12,
        },
        partnerY: {
          id: 2652,
        },
        round_number: 1,
        event_id: 218,
      },
      {
        partnerX: {
          id: 2606,
        },
        partnerY: {
          id: 2626,
        },
        round_number: 1,
        event_id: 218,
      },
      {
        partnerX: {
          id: 2611,
        },
        partnerY: {
          id: 2647,
        },
        round_number: 1,
        event_id: 218,
      },
      {
        partnerX: {
          id: 2152,
        },
        partnerY: {
          id: 2628,
        },
        round_number: 1,
        event_id: 218,
      },
      {
        partnerX: {
          id: 2552,
        },
        partnerY: {
          id: 2616,
        },
        round_number: 1,
        event_id: 218,
      },
      {
        partnerX: {
          id: 2645,
        },
        partnerY: {
          id: 2647,
        },
        round_number: 3,
        event_id: 218,
      },
      {
        partnerX: {
          id: 2606,
        },
        partnerY: {
          id: 2645,
        },
        round_number: 5,
        event_id: 218,
      },
      {
        partnerX: {
          id: 2436,
        },
        partnerY: {
          id: 2606,
        },
        round_number: 7,
        event_id: 218,
      },
      {
        partnerX: {
          id: 2436,
        },
        partnerY: {
          id: 2636,
        },
        round_number: 3,
        event_id: 218,
      },
      {
        partnerX: {
          id: 2436,
        },
        partnerY: {
          id: 2652,
        },
        round_number: 2,
        event_id: 218,
      },
      {
        partnerX: {
          id: 12,
        },
        partnerY: {
          id: 2645,
        },
        round_number: 2,
        event_id: 218,
      },
      {
        partnerX: {
          id: 2616,
        },
        partnerY: {
          id: 2654,
        },
        round_number: 5,
        event_id: 218,
      },
      {
        partnerX: {
          id: 12,
        },
        partnerY: {
          id: 2611,
        },
        round_number: 5,
        event_id: 218,
      },
      {
        partnerX: {
          id: 2626,
        },
        partnerY: {
          id: 2654,
        },
        round_number: 3,
        event_id: 218,
      },
      {
        partnerX: {
          id: 12,
        },
        partnerY: {
          id: 2552,
        },
        round_number: 3,
        event_id: 218,
      },
      {
        partnerX: {
          id: 2611,
        },
        partnerY: {
          id: 2616,
        },
        round_number: 4,
        event_id: 218,
      },
      {
        partnerX: {
          id: 2552,
        },
        partnerY: {
          id: 2626,
        },
        round_number: 4,
        event_id: 218,
      },
      {
        partnerX: {
          id: 2606,
        },
        partnerY: {
          id: 2636,
        },
        round_number: 4,
        event_id: 218,
      },
      {
        partnerX: {
          id: 2615,
        },
        partnerY: {
          id: 2654,
        },
        round_number: 4,
        event_id: 218,
      },
      {
        partnerX: {
          id: 2628,
        },
        partnerY: {
          id: 2652,
        },
        round_number: 4,
        event_id: 218,
      },
      {
        partnerX: {
          id: 2152,
        },
        partnerY: {
          id: 2645,
        },
        round_number: 4,
        event_id: 218,
      },
      {
        partnerX: {
          id: 12,
        },
        partnerY: {
          id: 2436,
        },
        round_number: 4,
        event_id: 218,
      },
      {
        partnerX: {
          id: 12,
        },
        partnerY: {
          id: 2636,
        },
        round_number: 8,
        event_id: 218,
      },
      {
        partnerX: {
          id: 2152,
        },
        partnerY: {
          id: 2552,
        },
        round_number: 7,
        event_id: 218,
      },
      {
        partnerX: {
          id: 2626,
        },
        partnerY: {
          id: 2652,
        },
        round_number: 7,
        event_id: 218,
      },
      {
        partnerX: {
          id: 2615,
        },
        partnerY: {
          id: 2652,
        },
        round_number: 8,
        event_id: 218,
      },
      {
        partnerX: {
          id: 2636,
        },
        partnerY: {
          id: 2654,
        },
        round_number: 7,
        event_id: 218,
      },
      {
        partnerX: {
          id: 2616,
        },
        partnerY: {
          id: 2645,
        },
        round_number: 7,
        event_id: 218,
      },
      {
        partnerX: {
          id: 2606,
        },
        partnerY: {
          id: 2616,
        },
        round_number: 6,
        event_id: 218,
      },
      {
        partnerX: {
          id: 2626,
        },
        partnerY: {
          id: 2636,
        },
        round_number: 6,
        event_id: 218,
      },
      {
        partnerX: {
          id: 2645,
        },
        partnerY: {
          id: 2652,
        },
        round_number: 6,
        event_id: 218,
      },
      {
        partnerX: {
          id: 2611,
        },
        partnerY: {
          id: 2615,
        },
        round_number: 7,
        event_id: 218,
      },
      {
        partnerX: {
          id: 12,
        },
        partnerY: {
          id: 2647,
        },
        round_number: 7,
        event_id: 218,
      },
      {
        partnerX: {
          id: 2552,
        },
        partnerY: {
          id: 2611,
        },
        round_number: 6,
        event_id: 218,
      },
      {
        partnerX: {
          id: 12,
        },
        partnerY: {
          id: 2152,
        },
        round_number: 6,
        event_id: 218,
      },
      {
        partnerX: {
          id: 2615,
        },
        partnerY: {
          id: 2628,
        },
        round_number: 6,
        event_id: 218,
      },
      {
        partnerX: {
          id: 2436,
        },
        partnerY: {
          id: 2647,
        },
        round_number: 6,
        event_id: 218,
      },
      {
        partnerX: {
          id: 2616,
        },
        partnerY: {
          id: 2628,
        },
        round_number: 8,
        event_id: 218,
      },
      {
        partnerX: {
          id: 2152,
        },
        partnerY: {
          id: 2611,
        },
        round_number: 8,
        event_id: 218,
      },
      {
        partnerX: {
          id: 2436,
        },
        partnerY: {
          id: 2552,
        },
        round_number: 8,
        event_id: 218,
      },
      {
        partnerX: {
          id: 2628,
        },
        partnerY: {
          id: 2645,
        },
        round_number: 9,
        event_id: 218,
      },
      {
        partnerX: {
          id: 2615,
        },
        partnerY: {
          id: 2626,
        },
        round_number: 9,
        event_id: 218,
      },
      {
        partnerX: {
          id: 2552,
        },
        partnerY: {
          id: 2652,
        },
        round_number: 9,
        event_id: 218,
      },
      {
        partnerX: {
          id: 12,
        },
        partnerY: {
          id: 2606,
        },
        round_number: 9,
        event_id: 218,
      },
      {
        partnerX: {
          id: 12,
        },
        partnerY: {
          id: 2628,
        },
        round_number: 10,
        event_id: 218,
      },
      {
        partnerX: {
          id: 2152,
        },
        partnerY: {
          id: 2606,
        },
        round_number: 10,
        event_id: 218,
      },
      {
        partnerX: {
          id: 2552,
        },
        partnerY: {
          id: 2615,
        },
        round_number: 10,
        event_id: 218,
      },
      {
        partnerX: {
          id: 2636,
        },
        partnerY: {
          id: 2652,
        },
        round_number: 10,
        event_id: 218,
      },
      {
        partnerX: {
          id: 2611,
        },
        partnerY: {
          id: 2645,
        },
        round_number: 10,
        event_id: 218,
      },
      {
        partnerX: {
          id: 2436,
        },
        partnerY: {
          id: 2654,
        },
        round_number: 10,
        event_id: 218,
      },
      {
        partnerX: {
          id: 2650,
        },
        partnerY: {
          id: 2733,
        },
        round_number: 7,
        event_id: 214,
      },
      {
        partnerX: {
          id: 1157,
        },
        partnerY: {
          id: 1902,
        },
        round_number: 1,
        event_id: 225,
      },
      {
        partnerX: {
          id: 2200,
        },
        partnerY: {
          id: 2698,
        },
        round_number: 1,
        event_id: 225,
      },
      {
        partnerX: {
          id: 1902,
        },
        partnerY: {
          id: 2200,
        },
        round_number: 2,
        event_id: 225,
      },
      {
        partnerX: {
          id: 1157,
        },
        partnerY: {
          id: 1293,
        },
        round_number: 3,
        event_id: 225,
      },
      {
        partnerX: {
          id: 1293,
        },
        partnerY: {
          id: 1902,
        },
        round_number: 4,
        event_id: 225,
      },
      {
        partnerX: {
          id: 1157,
        },
        partnerY: {
          id: 1640,
        },
        round_number: 4,
        event_id: 225,
      },
      {
        partnerX: {
          id: 1293,
        },
        partnerY: {
          id: 2200,
        },
        round_number: 5,
        event_id: 225,
      },
      {
        partnerX: {
          id: 1902,
        },
        partnerY: {
          id: 2698,
        },
        round_number: 5,
        event_id: 225,
      },
      {
        partnerX: {
          id: 12,
        },
        partnerY: {
          id: 1933,
        },
        round_number: 5,
        event_id: 214,
      },
      {
        partnerX: {
          id: 1157,
        },
        partnerY: {
          id: 2200,
        },
        round_number: 6,
        event_id: 225,
      },
      {
        partnerX: {
          id: 1808,
        },
        partnerY: {
          id: 2734,
        },
        round_number: 1,
        event_id: 214,
      },
      {
        partnerX: {
          id: 2621,
        },
        partnerY: {
          id: 513,
        },
        round_number: 1,
        event_id: 214,
      },
      {
        partnerX: {
          id: 115,
        },
        partnerY: {
          id: 8,
        },
        round_number: 1,
        event_id: 239,
      },
      {
        partnerX: {
          id: 12,
        },
        partnerY: {
          id: 389,
        },
        round_number: 1,
        event_id: 239,
      },
      {
        partnerX: {
          id: 12,
        },
        partnerY: {
          id: 2733,
        },
        round_number: 1,
        event_id: 214,
      },
      {
        partnerX: {
          id: 115,
        },
        partnerY: {
          id: 12,
        },
        round_number: 2,
        event_id: 239,
      },
      {
        partnerX: {
          id: 389,
        },
        partnerY: {
          id: 8,
        },
        round_number: 2,
        event_id: 239,
      },
      {
        partnerX: {
          id: 12,
        },
        partnerY: {
          id: 8,
        },
        round_number: 3,
        event_id: 239,
      },
      {
        partnerX: {
          id: 115,
        },
        partnerY: {
          id: 389,
        },
        round_number: 3,
        event_id: 239,
      },
      {
        partnerX: {
          id: 2734,
        },
        partnerY: {
          id: 513,
        },
        round_number: 5,
        event_id: 214,
      },
      {
        partnerX: {
          id: 1808,
        },
        partnerY: {
          id: 2621,
        },
        round_number: 5,
        event_id: 214,
      },
      {
        partnerX: {
          id: 12,
        },
        partnerY: {
          id: 513,
        },
        round_number: 2,
        event_id: 214,
      },
      {
        partnerX: {
          id: 1933,
        },
        partnerY: {
          id: 2734,
        },
        round_number: 2,
        event_id: 214,
      },
      {
        partnerX: {
          id: 1808,
        },
        partnerY: {
          id: 2733,
        },
        round_number: 2,
        event_id: 214,
      },
      {
        partnerX: {
          id: 1808,
        },
        partnerY: {
          id: 1933,
        },
        round_number: 3,
        event_id: 214,
      },
      {
        partnerX: {
          id: 12,
        },
        partnerY: {
          id: 2734,
        },
        round_number: 3,
        event_id: 214,
      },
      {
        partnerX: {
          id: 2621,
        },
        partnerY: {
          id: 2733,
        },
        round_number: 3,
        event_id: 214,
      },
      {
        partnerX: {
          id: 2621,
        },
        partnerY: {
          id: 2734,
        },
        round_number: 4,
        event_id: 214,
      },
      {
        partnerX: {
          id: 12,
        },
        partnerY: {
          id: 1808,
        },
        round_number: 4,
        event_id: 214,
      },
      {
        partnerX: {
          id: 2733,
        },
        partnerY: {
          id: 2734,
        },
        round_number: 6,
        event_id: 214,
      },
      {
        partnerX: {
          id: 1808,
        },
        partnerY: {
          id: 513,
        },
        round_number: 6,
        event_id: 214,
      },
      {
        partnerX: {
          id: 1933,
        },
        partnerY: {
          id: 2621,
        },
        round_number: 6,
        event_id: 214,
      },
      {
        partnerX: {
          id: 1502,
        },
        partnerY: {
          id: 2266,
        },
        round_number: 1,
        event_id: 200,
      },
      {
        partnerX: {
          id: 1933,
        },
        partnerY: {
          id: 513,
        },
        round_number: 7,
        event_id: 214,
      },
      {
        partnerX: {
          id: 12,
        },
        partnerY: {
          id: 2621,
        },
        round_number: 7,
        event_id: 214,
      },
      {
        partnerX: {
          id: 2282,
        },
        partnerY: {
          id: 2659,
        },
        round_number: 1,
        event_id: 200,
      },
      {
        partnerX: {
          id: 2733,
        },
        partnerY: {
          id: 513,
        },
        round_number: 8,
        event_id: 214,
      },
      {
        partnerX: {
          id: 1933,
        },
        partnerY: {
          id: 2650,
        },
        round_number: 8,
        event_id: 214,
      },
      {
        partnerX: {
          id: 2321,
        },
        partnerY: {
          id: 2738,
        },
        round_number: 1,
        event_id: 200,
      },
      {
        partnerX: {
          id: 2270,
        },
        partnerY: {
          id: 2295,
        },
        round_number: 1,
        event_id: 200,
      },
      {
        partnerX: {
          id: 1474,
        },
        partnerY: {
          id: 1522,
        },
        round_number: 1,
        event_id: 200,
      },
      {
        partnerX: {
          id: 2266,
        },
        partnerY: {
          id: 2273,
        },
        round_number: 2,
        event_id: 200,
      },
      {
        partnerX: {
          id: 2314,
        },
        partnerY: {
          id: 2321,
        },
        round_number: 2,
        event_id: 200,
      },
      {
        partnerX: {
          id: 1502,
        },
        partnerY: {
          id: 2659,
        },
        round_number: 2,
        event_id: 200,
      },
      {
        partnerX: {
          id: 1601,
        },
        partnerY: {
          id: 2355,
        },
        round_number: 2,
        event_id: 200,
      },
      {
        partnerX: {
          id: 1522,
        },
        partnerY: {
          id: 2295,
        },
        round_number: 2,
        event_id: 200,
      },
      {
        partnerX: {
          id: 121,
        },
        partnerY: {
          id: 2738,
        },
        round_number: 2,
        event_id: 200,
      },
      {
        partnerX: {
          id: 1550,
        },
        partnerY: {
          id: 2304,
        },
        round_number: 2,
        event_id: 200,
      },
      {
        partnerX: {
          id: 1474,
        },
        partnerY: {
          id: 992,
        },
        round_number: 2,
        event_id: 200,
      },
      {
        partnerX: {
          id: 2366,
        },
        partnerY: {
          id: 2409,
        },
        round_number: 2,
        event_id: 200,
      },
      {
        partnerX: {
          id: 1559,
        },
        partnerY: {
          id: 1577,
        },
        round_number: 2,
        event_id: 200,
      },
      {
        partnerX: {
          id: 1502,
        },
        partnerY: {
          id: 1559,
        },
        round_number: 5,
        event_id: 200,
      },
      {
        partnerX: {
          id: 2266,
        },
        partnerY: {
          id: 2295,
        },
        round_number: 8,
        event_id: 200,
      },
      {
        partnerX: {
          id: 1601,
        },
        partnerY: {
          id: 2659,
        },
        round_number: 3,
        event_id: 200,
      },
      {
        partnerX: {
          id: 2738,
        },
        partnerY: {
          id: 2739,
        },
        round_number: 5,
        event_id: 200,
      },
      {
        partnerX: {
          id: 1601,
        },
        partnerY: {
          id: 2295,
        },
        round_number: 5,
        event_id: 200,
      },
      {
        partnerX: {
          id: 1550,
        },
        partnerY: {
          id: 2732,
        },
        round_number: 5,
        event_id: 200,
      },
      {
        partnerX: {
          id: 1502,
        },
        partnerY: {
          id: 2366,
        },
        round_number: 3,
        event_id: 200,
      },
      {
        partnerX: {
          id: 1577,
        },
        partnerY: {
          id: 2304,
        },
        round_number: 5,
        event_id: 200,
      },
      {
        partnerX: {
          id: 12,
        },
        partnerY: {
          id: 2266,
        },
        round_number: 3,
        event_id: 200,
      },
      {
        partnerX: {
          id: 2282,
        },
        partnerY: {
          id: 2409,
        },
        round_number: 3,
        event_id: 200,
      },
      {
        partnerX: {
          id: 2273,
        },
        partnerY: {
          id: 2295,
        },
        round_number: 3,
        event_id: 200,
      },
      {
        partnerX: {
          id: 2321,
        },
        partnerY: {
          id: 2355,
        },
        round_number: 3,
        event_id: 200,
      },
      {
        partnerX: {
          id: 2270,
        },
        partnerY: {
          id: 992,
        },
        round_number: 3,
        event_id: 200,
      },
      {
        partnerX: {
          id: 1522,
        },
        partnerY: {
          id: 1577,
        },
        round_number: 3,
        event_id: 200,
      },
      {
        partnerX: {
          id: 1474,
        },
        partnerY: {
          id: 2302,
        },
        round_number: 3,
        event_id: 200,
      },
      {
        partnerX: {
          id: 1550,
        },
        partnerY: {
          id: 1559,
        },
        round_number: 3,
        event_id: 200,
      },
      {
        partnerX: {
          id: 1522,
        },
        partnerY: {
          id: 2302,
        },
        round_number: 4,
        event_id: 200,
      },
      {
        partnerX: {
          id: 1601,
        },
        partnerY: {
          id: 2321,
        },
        round_number: 4,
        event_id: 200,
      },
      {
        partnerX: {
          id: 2273,
        },
        partnerY: {
          id: 2282,
        },
        round_number: 4,
        event_id: 200,
      },
      {
        partnerX: {
          id: 1502,
        },
        partnerY: {
          id: 2295,
        },
        round_number: 4,
        event_id: 200,
      },
      {
        partnerX: {
          id: 1474,
        },
        partnerY: {
          id: 2366,
        },
        round_number: 4,
        event_id: 200,
      },
      {
        partnerX: {
          id: 2270,
        },
        partnerY: {
          id: 2409,
        },
        round_number: 4,
        event_id: 200,
      },
      {
        partnerX: {
          id: 2659,
        },
        partnerY: {
          id: 2739,
        },
        round_number: 4,
        event_id: 200,
      },
      {
        partnerX: {
          id: 12,
        },
        partnerY: {
          id: 1559,
        },
        round_number: 4,
        event_id: 200,
      },
      {
        partnerX: {
          id: 1577,
        },
        partnerY: {
          id: 992,
        },
        round_number: 4,
        event_id: 200,
      },
      {
        partnerX: {
          id: 2304,
        },
        partnerY: {
          id: 2405,
        },
        round_number: 4,
        event_id: 200,
      },
      {
        partnerX: {
          id: 2302,
        },
        partnerY: {
          id: 2739,
        },
        round_number: 8,
        event_id: 200,
      },
      {
        partnerX: {
          id: 1550,
        },
        partnerY: {
          id: 2273,
        },
        round_number: 8,
        event_id: 200,
      },
      {
        partnerX: {
          id: 2266,
        },
        partnerY: {
          id: 992,
        },
        round_number: 5,
        event_id: 200,
      },
      {
        partnerX: {
          id: 2295,
        },
        partnerY: {
          id: 2302,
        },
        round_number: 7,
        event_id: 200,
      },
      {
        partnerX: {
          id: 2409,
        },
        partnerY: {
          id: 2732,
        },
        round_number: 8,
        event_id: 200,
      },
      {
        partnerX: {
          id: 1474,
        },
        partnerY: {
          id: 2270,
        },
        round_number: 5,
        event_id: 200,
      },
      {
        partnerX: {
          id: 2273,
        },
        partnerY: {
          id: 2355,
        },
        round_number: 5,
        event_id: 200,
      },
      {
        partnerX: {
          id: 1522,
        },
        partnerY: {
          id: 2409,
        },
        round_number: 5,
        event_id: 200,
      },
      {
        partnerX: {
          id: 121,
        },
        partnerY: {
          id: 2273,
        },
        round_number: 7,
        event_id: 200,
      },
      {
        partnerX: {
          id: 1601,
        },
        partnerY: {
          id: 2405,
        },
        round_number: 6,
        event_id: 200,
      },
      {
        partnerX: {
          id: 12,
        },
        partnerY: {
          id: 1502,
        },
        round_number: 6,
        event_id: 200,
      },
      {
        partnerX: {
          id: 121,
        },
        partnerY: {
          id: 1577,
        },
        round_number: 8,
        event_id: 200,
      },
      {
        partnerX: {
          id: 2321,
        },
        partnerY: {
          id: 2739,
        },
        round_number: 7,
        event_id: 200,
      },
      {
        partnerX: {
          id: 2270,
        },
        partnerY: {
          id: 2405,
        },
        round_number: 8,
        event_id: 200,
      },
      {
        partnerX: {
          id: 1601,
        },
        partnerY: {
          id: 2304,
        },
        round_number: 7,
        event_id: 200,
      },
      {
        partnerX: {
          id: 1502,
        },
        partnerY: {
          id: 2738,
        },
        round_number: 8,
        event_id: 200,
      },
      {
        partnerX: {
          id: 2366,
        },
        partnerY: {
          id: 2732,
        },
        round_number: 6,
        event_id: 200,
      },
      {
        partnerX: {
          id: 1550,
        },
        partnerY: {
          id: 2409,
        },
        round_number: 6,
        event_id: 200,
      },
      {
        partnerX: {
          id: 12,
        },
        partnerY: {
          id: 2366,
        },
        round_number: 8,
        event_id: 200,
      },
      {
        partnerX: {
          id: 2304,
        },
        partnerY: {
          id: 992,
        },
        round_number: 6,
        event_id: 200,
      },
      {
        partnerX: {
          id: 2266,
        },
        partnerY: {
          id: 2659,
        },
        round_number: 6,
        event_id: 200,
      },
      {
        partnerX: {
          id: 12,
        },
        partnerY: {
          id: 1522,
        },
        round_number: 7,
        event_id: 200,
      },
      {
        partnerX: {
          id: 2302,
        },
        partnerY: {
          id: 2355,
        },
        round_number: 6,
        event_id: 200,
      },
      {
        partnerX: {
          id: 1577,
        },
        partnerY: {
          id: 2739,
        },
        round_number: 6,
        event_id: 200,
      },
      {
        partnerX: {
          id: 1559,
        },
        partnerY: {
          id: 2321,
        },
        round_number: 6,
        event_id: 200,
      },
      {
        partnerX: {
          id: 1474,
        },
        partnerY: {
          id: 2738,
        },
        round_number: 6,
        event_id: 200,
      },
      {
        partnerX: {
          id: 2266,
        },
        partnerY: {
          id: 2304,
        },
        round_number: 9,
        event_id: 200,
      },
      {
        partnerX: {
          id: 2366,
        },
        partnerY: {
          id: 2659,
        },
        round_number: 7,
        event_id: 200,
      },
      {
        partnerX: {
          id: 2405,
        },
        partnerY: {
          id: 2409,
        },
        round_number: 7,
        event_id: 200,
      },
      {
        partnerX: {
          id: 1550,
        },
        partnerY: {
          id: 2270,
        },
        round_number: 7,
        event_id: 200,
      },
      {
        partnerX: {
          id: 2732,
        },
        partnerY: {
          id: 992,
        },
        round_number: 7,
        event_id: 200,
      },
      {
        partnerX: {
          id: 1522,
        },
        partnerY: {
          id: 992,
        },
        round_number: 8,
        event_id: 200,
      },
      {
        partnerX: {
          id: 1559,
        },
        partnerY: {
          id: 2738,
        },
        round_number: 7,
        event_id: 200,
      },
      {
        partnerX: {
          id: 1474,
        },
        partnerY: {
          id: 1502,
        },
        round_number: 7,
        event_id: 200,
      },
      {
        partnerX: {
          id: 1577,
        },
        partnerY: {
          id: 2409,
        },
        round_number: 9,
        event_id: 200,
      },
      {
        partnerX: {
          id: 12,
        },
        partnerY: {
          id: 2302,
        },
        round_number: 9,
        event_id: 200,
      },
      {
        partnerX: {
          id: 2366,
        },
        partnerY: {
          id: 2738,
        },
        round_number: 9,
        event_id: 200,
      },
      {
        partnerX: {
          id: 2304,
        },
        partnerY: {
          id: 2321,
        },
        round_number: 8,
        event_id: 200,
      },
      {
        partnerX: {
          id: 1559,
        },
        partnerY: {
          id: 1601,
        },
        round_number: 8,
        event_id: 200,
      },
      {
        partnerX: {
          id: 2273,
        },
        partnerY: {
          id: 2659,
        },
        round_number: 9,
        event_id: 200,
      },
      {
        partnerX: {
          id: 2295,
        },
        partnerY: {
          id: 2355,
        },
        round_number: 9,
        event_id: 200,
      },
      {
        partnerX: {
          id: 1601,
        },
        partnerY: {
          id: 2739,
        },
        round_number: 9,
        event_id: 200,
      },
      {
        partnerX: {
          id: 1522,
        },
        partnerY: {
          id: 2270,
        },
        round_number: 9,
        event_id: 200,
      },
      {
        partnerX: {
          id: 1550,
        },
        partnerY: {
          id: 2405,
        },
        round_number: 9,
        event_id: 200,
      },
      {
        partnerX: {
          id: 1601,
        },
        partnerY: {
          id: 2732,
        },
        round_number: 10,
        event_id: 200,
      },
      {
        partnerX: {
          id: 2355,
        },
        partnerY: {
          id: 2366,
        },
        round_number: 10,
        event_id: 200,
      },
      {
        partnerX: {
          id: 2295,
        },
        partnerY: {
          id: 2321,
        },
        round_number: 10,
        event_id: 200,
      },
      {
        partnerX: {
          id: 1522,
        },
        partnerY: {
          id: 2739,
        },
        round_number: 10,
        event_id: 200,
      },
      {
        partnerX: {
          id: 2304,
        },
        partnerY: {
          id: 2659,
        },
        round_number: 10,
        event_id: 200,
      },
      {
        partnerX: {
          id: 2738,
        },
        partnerY: {
          id: 992,
        },
        round_number: 10,
        event_id: 200,
      },
      {
        partnerX: {
          id: 1502,
        },
        partnerY: {
          id: 1577,
        },
        round_number: 10,
        event_id: 200,
      },
      {
        partnerX: {
          id: 1550,
        },
        partnerY: {
          id: 2266,
        },
        round_number: 10,
        event_id: 200,
      },
      {
        partnerX: {
          id: 12,
        },
        partnerY: {
          id: 2273,
        },
        round_number: 10,
        event_id: 200,
      },
      {
        partnerX: {
          id: 1474,
        },
        partnerY: {
          id: 2409,
        },
        round_number: 10,
        event_id: 200,
      },
      {
        partnerX: {
          id: 2537,
        },
        partnerY: {
          id: 569,
        },
        round_number: 7,
        event_id: 215,
      },
      {
        partnerX: {
          id: 2571,
        },
        partnerY: {
          id: 513,
        },
        round_number: 1,
        event_id: 215,
      },
      {
        partnerX: {
          id: 115,
        },
        partnerY: {
          id: 1578,
        },
        round_number: 1,
        event_id: 215,
      },
      {
        partnerX: {
          id: 1933,
        },
        partnerY: {
          id: 2775,
        },
        round_number: 1,
        event_id: 215,
      },
      {
        partnerX: {
          id: 1585,
        },
        partnerY: {
          id: 2537,
        },
        round_number: 5,
        event_id: 215,
      },
      {
        partnerX: {
          id: 2247,
        },
        partnerY: {
          id: 569,
        },
        round_number: 1,
        event_id: 215,
      },
      {
        partnerX: {
          id: 115,
        },
        partnerY: {
          id: 2775,
        },
        round_number: 7,
        event_id: 215,
      },
      {
        partnerX: {
          id: 2731,
        },
        partnerY: {
          id: 2773,
        },
        round_number: 1,
        event_id: 215,
      },
      {
        partnerX: {
          id: 2218,
        },
        partnerY: {
          id: 2686,
        },
        round_number: 1,
        event_id: 215,
      },
      {
        partnerX: {
          id: 115,
        },
        partnerY: {
          id: 569,
        },
        round_number: 5,
        event_id: 215,
      },
      {
        partnerX: {
          id: 115,
        },
        partnerY: {
          id: 2247,
        },
        round_number: 2,
        event_id: 215,
      },
      {
        partnerX: {
          id: 1578,
        },
        partnerY: {
          id: 513,
        },
        round_number: 5,
        event_id: 215,
      },
      {
        partnerX: {
          id: 12,
        },
        partnerY: {
          id: 2775,
        },
        round_number: 5,
        event_id: 215,
      },
      {
        partnerX: {
          id: 1933,
        },
        partnerY: {
          id: 513,
        },
        round_number: 7,
        event_id: 215,
      },
      {
        partnerX: {
          id: 2731,
        },
        partnerY: {
          id: 513,
        },
        round_number: 2,
        event_id: 215,
      },
      {
        partnerX: {
          id: 1933,
        },
        partnerY: {
          id: 569,
        },
        round_number: 2,
        event_id: 215,
      },
      {
        partnerX: {
          id: 2537,
        },
        partnerY: {
          id: 2571,
        },
        round_number: 2,
        event_id: 215,
      },
      {
        partnerX: {
          id: 12,
        },
        partnerY: {
          id: 1578,
        },
        round_number: 2,
        event_id: 215,
      },
      {
        partnerX: {
          id: 2633,
        },
        partnerY: {
          id: 2731,
        },
        round_number: 5,
        event_id: 215,
      },
      {
        partnerX: {
          id: 2218,
        },
        partnerY: {
          id: 2773,
        },
        round_number: 5,
        event_id: 215,
      },
      {
        partnerX: {
          id: 1933,
        },
        partnerY: {
          id: 2773,
        },
        round_number: 3,
        event_id: 215,
      },
      {
        partnerX: {
          id: 2260,
        },
        partnerY: {
          id: 2731,
        },
        round_number: 3,
        event_id: 215,
      },
      {
        partnerX: {
          id: 2247,
        },
        partnerY: {
          id: 2571,
        },
        round_number: 3,
        event_id: 215,
      },
      {
        partnerX: {
          id: 12,
        },
        partnerY: {
          id: 2686,
        },
        round_number: 3,
        event_id: 215,
      },
      {
        partnerX: {
          id: 2537,
        },
        partnerY: {
          id: 513,
        },
        round_number: 3,
        event_id: 215,
      },
      {
        partnerX: {
          id: 1817,
        },
        partnerY: {
          id: 569,
        },
        round_number: 3,
        event_id: 215,
      },
      {
        partnerX: {
          id: 2218,
        },
        partnerY: {
          id: 513,
        },
        round_number: 4,
        event_id: 215,
      },
      {
        partnerX: {
          id: 1585,
        },
        partnerY: {
          id: 2260,
        },
        round_number: 4,
        event_id: 215,
      },
      {
        partnerX: {
          id: 1933,
        },
        partnerY: {
          id: 2633,
        },
        round_number: 4,
        event_id: 215,
      },
      {
        partnerX: {
          id: 2775,
        },
        partnerY: {
          id: 569,
        },
        round_number: 4,
        event_id: 215,
      },
      {
        partnerX: {
          id: 2686,
        },
        partnerY: {
          id: 2773,
        },
        round_number: 4,
        event_id: 215,
      },
      {
        partnerX: {
          id: 1578,
        },
        partnerY: {
          id: 2571,
        },
        round_number: 4,
        event_id: 215,
      },
      {
        partnerX: {
          id: 2247,
        },
        partnerY: {
          id: 2731,
        },
        round_number: 4,
        event_id: 215,
      },
      {
        partnerX: {
          id: 1933,
        },
        partnerY: {
          id: 2571,
        },
        round_number: 6,
        event_id: 215,
      },
      {
        partnerX: {
          id: 2247,
        },
        partnerY: {
          id: 2775,
        },
        round_number: 6,
        event_id: 215,
      },
      {
        partnerX: {
          id: 1585,
        },
        partnerY: {
          id: 2773,
        },
        round_number: 6,
        event_id: 215,
      },
      {
        partnerX: {
          id: 2218,
        },
        partnerY: {
          id: 2537,
        },
        round_number: 6,
        event_id: 215,
      },
      {
        partnerX: {
          id: 12,
        },
        partnerY: {
          id: 2633,
        },
        round_number: 6,
        event_id: 215,
      },
      {
        partnerX: {
          id: 1817,
        },
        partnerY: {
          id: 2731,
        },
        round_number: 6,
        event_id: 215,
      },
      {
        partnerX: {
          id: 115,
        },
        partnerY: {
          id: 2686,
        },
        round_number: 6,
        event_id: 215,
      },
      {
        partnerX: {
          id: 2247,
        },
        partnerY: {
          id: 2773,
        },
        round_number: 7,
        event_id: 215,
      },
      {
        partnerX: {
          id: 1646,
        },
        partnerY: {
          id: 2562,
        },
        round_number: 1,
        event_id: 216,
      },
      {
        partnerX: {
          id: 1585,
        },
        partnerY: {
          id: 1933,
        },
        round_number: 8,
        event_id: 215,
      },
      {
        partnerX: {
          id: 1817,
        },
        partnerY: {
          id: 2537,
        },
        round_number: 8,
        event_id: 215,
      },
      {
        partnerX: {
          id: 12,
        },
        partnerY: {
          id: 2773,
        },
        round_number: 8,
        event_id: 215,
      },
      {
        partnerX: {
          id: 115,
        },
        partnerY: {
          id: 2571,
        },
        round_number: 8,
        event_id: 215,
      },
      {
        partnerX: {
          id: 2633,
        },
        partnerY: {
          id: 513,
        },
        round_number: 8,
        event_id: 215,
      },
      {
        partnerX: {
          id: 2731,
        },
        partnerY: {
          id: 569,
        },
        round_number: 8,
        event_id: 215,
      },
      {
        partnerX: {
          id: 2247,
        },
        partnerY: {
          id: 2260,
        },
        round_number: 8,
        event_id: 215,
      },
      {
        partnerX: {
          id: 2571,
        },
        partnerY: {
          id: 2611,
        },
        round_number: 1,
        event_id: 216,
      },
      {
        partnerX: {
          id: 1993,
        },
        partnerY: {
          id: 2483,
        },
        round_number: 1,
        event_id: 216,
      },
      {
        partnerX: {
          id: 115,
        },
        partnerY: {
          id: 2552,
        },
        round_number: 1,
        event_id: 216,
      },
      {
        partnerX: {
          id: 1933,
        },
        partnerY: {
          id: 2333,
        },
        round_number: 1,
        event_id: 216,
      },
      {
        partnerX: {
          id: 2444,
        },
        partnerY: {
          id: 2615,
        },
        round_number: 1,
        event_id: 216,
      },
      {
        partnerX: {
          id: 1901,
        },
        partnerY: {
          id: 2521,
        },
        round_number: 1,
        event_id: 216,
      },
      {
        partnerX: {
          id: 2440,
        },
        partnerY: {
          id: 2738,
        },
        round_number: 1,
        event_id: 216,
      },
      {
        partnerX: {
          id: 12,
        },
        partnerY: {
          id: 2227,
        },
        round_number: 1,
        event_id: 216,
      },
      {
        partnerX: {
          id: 2483,
        },
        partnerY: {
          id: 2615,
        },
        round_number: 2,
        event_id: 216,
      },
      {
        partnerX: {
          id: 12,
        },
        partnerY: {
          id: 2552,
        },
        round_number: 2,
        event_id: 216,
      },
      {
        partnerX: {
          id: 1646,
        },
        partnerY: {
          id: 2571,
        },
        round_number: 2,
        event_id: 216,
      },
      {
        partnerX: {
          id: 115,
        },
        partnerY: {
          id: 2372,
        },
        round_number: 2,
        event_id: 216,
      },
      {
        partnerX: {
          id: 1901,
        },
        partnerY: {
          id: 2220,
        },
        round_number: 2,
        event_id: 216,
      },
      {
        partnerX: {
          id: 2219,
        },
        partnerY: {
          id: 2521,
        },
        round_number: 2,
        event_id: 216,
      },
      {
        partnerX: {
          id: 2109,
        },
        partnerY: {
          id: 2611,
        },
        round_number: 2,
        event_id: 216,
      },
      {
        partnerX: {
          id: 1933,
        },
        partnerY: {
          id: 1993,
        },
        round_number: 3,
        event_id: 216,
      },
      {
        partnerX: {
          id: 2483,
        },
        partnerY: {
          id: 2552,
        },
        round_number: 3,
        event_id: 216,
      },
      {
        partnerX: {
          id: 1646,
        },
        partnerY: {
          id: 2521,
        },
        round_number: 3,
        event_id: 216,
      },
      {
        partnerX: {
          id: 2440,
        },
        partnerY: {
          id: 2615,
        },
        round_number: 3,
        event_id: 216,
      },
      {
        partnerX: {
          id: 115,
        },
        partnerY: {
          id: 1933,
        },
        round_number: 6,
        event_id: 216,
      },
      {
        partnerX: {
          id: 115,
        },
        partnerY: {
          id: 2227,
        },
        round_number: 3,
        event_id: 216,
      },
      {
        partnerX: {
          id: 2109,
        },
        partnerY: {
          id: 2220,
        },
        round_number: 3,
        event_id: 216,
      },
      {
        partnerX: {
          id: 2333,
        },
        partnerY: {
          id: 2571,
        },
        round_number: 3,
        event_id: 216,
      },
      {
        partnerX: {
          id: 1901,
        },
        partnerY: {
          id: 319,
        },
        round_number: 3,
        event_id: 216,
      },
      {
        partnerX: {
          id: 2444,
        },
        partnerY: {
          id: 2611,
        },
        round_number: 3,
        event_id: 216,
      },
      {
        partnerX: {
          id: 2219,
        },
        partnerY: {
          id: 2562,
        },
        round_number: 3,
        event_id: 216,
      },
      {
        partnerX: {
          id: 1993,
        },
        partnerY: {
          id: 2219,
        },
        round_number: 6,
        event_id: 216,
      },
      {
        partnerX: {
          id: 2333,
        },
        partnerY: {
          id: 319,
        },
        round_number: 6,
        event_id: 216,
      },
      {
        partnerX: {
          id: 2372,
        },
        partnerY: {
          id: 2382,
        },
        round_number: 6,
        event_id: 216,
      },
      {
        partnerX: {
          id: 2552,
        },
        partnerY: {
          id: 2615,
        },
        round_number: 4,
        event_id: 216,
      },
      {
        partnerX: {
          id: 2571,
        },
        partnerY: {
          id: 2615,
        },
        round_number: 6,
        event_id: 216,
      },
      {
        partnerX: {
          id: 2227,
        },
        partnerY: {
          id: 2562,
        },
        round_number: 6,
        event_id: 216,
      },
      {
        partnerX: {
          id: 1993,
        },
        partnerY: {
          id: 2333,
        },
        round_number: 4,
        event_id: 216,
      },
      {
        partnerX: {
          id: 1960,
        },
        partnerY: {
          id: 2219,
        },
        round_number: 4,
        event_id: 216,
      },
      {
        partnerX: {
          id: 12,
        },
        partnerY: {
          id: 2521,
        },
        round_number: 4,
        event_id: 216,
      },
      {
        partnerX: {
          id: 1901,
        },
        partnerY: {
          id: 2382,
        },
        round_number: 4,
        event_id: 216,
      },
      {
        partnerX: {
          id: 115,
        },
        partnerY: {
          id: 1646,
        },
        round_number: 4,
        event_id: 216,
      },
      {
        partnerX: {
          id: 2444,
        },
        partnerY: {
          id: 2571,
        },
        round_number: 4,
        event_id: 216,
      },
      {
        partnerX: {
          id: 12,
        },
        partnerY: {
          id: 1901,
        },
        round_number: 6,
        event_id: 216,
      },
      {
        partnerX: {
          id: 1646,
        },
        partnerY: {
          id: 2220,
        },
        round_number: 6,
        event_id: 216,
      },
      {
        partnerX: {
          id: 2109,
        },
        partnerY: {
          id: 2483,
        },
        round_number: 6,
        event_id: 216,
      },
      {
        partnerX: {
          id: 1960,
        },
        partnerY: {
          id: 2615,
        },
        round_number: 5,
        event_id: 216,
      },
      {
        partnerX: {
          id: 115,
        },
        partnerY: {
          id: 2521,
        },
        round_number: 5,
        event_id: 216,
      },
      {
        partnerX: {
          id: 2227,
        },
        partnerY: {
          id: 2552,
        },
        round_number: 5,
        event_id: 216,
      },
      {
        partnerX: {
          id: 1933,
        },
        partnerY: {
          id: 468,
        },
        round_number: 5,
        event_id: 216,
      },
      {
        partnerX: {
          id: 12,
        },
        partnerY: {
          id: 2571,
        },
        round_number: 5,
        event_id: 216,
      },
      {
        partnerX: {
          id: 1646,
        },
        partnerY: {
          id: 2483,
        },
        round_number: 5,
        event_id: 216,
      },
      {
        partnerX: {
          id: 2109,
        },
        partnerY: {
          id: 2219,
        },
        round_number: 5,
        event_id: 216,
      },
      {
        partnerX: {
          id: 1993,
        },
        partnerY: {
          id: 2738,
        },
        round_number: 5,
        event_id: 216,
      },
      {
        partnerX: {
          id: 2227,
        },
        partnerY: {
          id: 2372,
        },
        round_number: 7,
        event_id: 216,
      },
      {
        partnerX: {
          id: 2219,
        },
        partnerY: {
          id: 2483,
        },
        round_number: 7,
        event_id: 216,
      },
      {
        partnerX: {
          id: 115,
        },
        partnerY: {
          id: 2109,
        },
        round_number: 7,
        event_id: 216,
      },
      {
        partnerX: {
          id: 1933,
        },
        partnerY: {
          id: 2444,
        },
        round_number: 7,
        event_id: 216,
      },
      {
        partnerX: {
          id: 2333,
        },
        partnerY: {
          id: 2552,
        },
        round_number: 7,
        event_id: 216,
      },
      {
        partnerX: {
          id: 12,
        },
        partnerY: {
          id: 1646,
        },
        round_number: 7,
        event_id: 216,
      },
      {
        partnerX: {
          id: 2219,
        },
        partnerY: {
          id: 2535,
        },
        round_number: 8,
        event_id: 216,
      },
      {
        partnerX: {
          id: 12,
        },
        partnerY: {
          id: 2382,
        },
        round_number: 1,
        event_id: 217,
      },
      {
        partnerX: {
          id: 1646,
        },
        partnerY: {
          id: 2227,
        },
        round_number: 8,
        event_id: 216,
      },
      {
        partnerX: {
          id: 115,
        },
        partnerY: {
          id: 1901,
        },
        round_number: 2,
        event_id: 217,
      },
      {
        partnerX: {
          id: 1933,
        },
        partnerY: {
          id: 2220,
        },
        round_number: 1,
        event_id: 217,
      },
      {
        partnerX: {
          id: 1933,
        },
        partnerY: {
          id: 2615,
        },
        round_number: 8,
        event_id: 216,
      },
      {
        partnerX: {
          id: 2611,
        },
        partnerY: {
          id: 468,
        },
        round_number: 8,
        event_id: 216,
      },
      {
        partnerX: {
          id: 12,
        },
        partnerY: {
          id: 2483,
        },
        round_number: 8,
        event_id: 216,
      },
      {
        partnerX: {
          id: 2540,
        },
        partnerY: {
          id: 2779,
        },
        round_number: 1,
        event_id: 217,
      },
      {
        partnerX: {
          id: 1993,
        },
        partnerY: {
          id: 2444,
        },
        round_number: 8,
        event_id: 216,
      },
      {
        partnerX: {
          id: 2552,
        },
        partnerY: {
          id: 2562,
        },
        round_number: 8,
        event_id: 216,
      },
      {
        partnerX: {
          id: 1901,
        },
        partnerY: {
          id: 2333,
        },
        round_number: 8,
        event_id: 216,
      },
      {
        partnerX: {
          id: 115,
        },
        partnerY: {
          id: 2738,
        },
        round_number: 8,
        event_id: 216,
      },
      {
        partnerX: {
          id: 2227,
        },
        partnerY: {
          id: 2776,
        },
        round_number: 1,
        event_id: 217,
      },
      {
        partnerX: {
          id: 2120,
        },
        partnerY: {
          id: 2227,
        },
        round_number: 2,
        event_id: 217,
      },
      {
        partnerX: {
          id: 2437,
        },
        partnerY: {
          id: 2686,
        },
        round_number: 1,
        event_id: 217,
      },
      {
        partnerX: {
          id: 12,
        },
        partnerY: {
          id: 1933,
        },
        round_number: 2,
        event_id: 217,
      },
      {
        partnerX: {
          id: 2382,
        },
        partnerY: {
          id: 2441,
        },
        round_number: 2,
        event_id: 217,
      },
      {
        partnerX: {
          id: 2686,
        },
        partnerY: {
          id: 2779,
        },
        round_number: 2,
        event_id: 217,
      },
      {
        partnerX: {
          id: 2540,
        },
        partnerY: {
          id: 2571,
        },
        round_number: 2,
        event_id: 217,
      },
      {
        partnerX: {
          id: 2779,
        },
        partnerY: {
          id: 2784,
        },
        round_number: 3,
        event_id: 217,
      },
      {
        partnerX: {
          id: 2120,
        },
        partnerY: {
          id: 2441,
        },
        round_number: 3,
        event_id: 217,
      },
      {
        partnerX: {
          id: 12,
        },
        partnerY: {
          id: 2776,
        },
        round_number: 3,
        event_id: 217,
      },
      {
        partnerX: {
          id: 1901,
        },
        partnerY: {
          id: 1933,
        },
        round_number: 3,
        event_id: 217,
      },
      {
        partnerX: {
          id: 2382,
        },
        partnerY: {
          id: 2387,
        },
        round_number: 3,
        event_id: 217,
      },
      {
        partnerX: {
          id: 2227,
        },
        partnerY: {
          id: 2725,
        },
        round_number: 3,
        event_id: 217,
      },
      {
        partnerX: {
          id: 2345,
        },
        partnerY: {
          id: 8,
        },
        round_number: 3,
        event_id: 217,
      },
      {
        partnerX: {
          id: 2540,
        },
        partnerY: {
          id: 2654,
        },
        round_number: 3,
        event_id: 217,
      },
      {
        partnerX: {
          id: 115,
        },
        partnerY: {
          id: 2437,
        },
        round_number: 3,
        event_id: 217,
      },
      {
        partnerX: {
          id: 2345,
        },
        partnerY: {
          id: 2382,
        },
        round_number: 4,
        event_id: 217,
      },
      {
        partnerX: {
          id: 2441,
        },
        partnerY: {
          id: 319,
        },
        round_number: 4,
        event_id: 217,
      },
      {
        partnerX: {
          id: 1901,
        },
        partnerY: {
          id: 2437,
        },
        round_number: 7,
        event_id: 217,
      },
      {
        partnerX: {
          id: 2654,
        },
        partnerY: {
          id: 2784,
        },
        round_number: 4,
        event_id: 217,
      },
      {
        partnerX: {
          id: 115,
        },
        partnerY: {
          id: 2227,
        },
        round_number: 4,
        event_id: 217,
      },
      {
        partnerX: {
          id: 2120,
        },
        partnerY: {
          id: 2776,
        },
        round_number: 4,
        event_id: 217,
      },
      {
        partnerX: {
          id: 115,
        },
        partnerY: {
          id: 2654,
        },
        round_number: 7,
        event_id: 217,
      },
      {
        partnerX: {
          id: 1933,
        },
        partnerY: {
          id: 2686,
        },
        round_number: 4,
        event_id: 217,
      },
      {
        partnerX: {
          id: 2220,
        },
        partnerY: {
          id: 8,
        },
        round_number: 4,
        event_id: 217,
      },
      {
        partnerX: {
          id: 1901,
        },
        partnerY: {
          id: 2387,
        },
        round_number: 4,
        event_id: 217,
      },
      {
        partnerX: {
          id: 1933,
        },
        partnerY: {
          id: 506,
        },
        round_number: 4,
        event_id: 219,
      },
      {
        partnerX: {
          id: 468,
        },
        partnerY: {
          id: 8,
        },
        round_number: 7,
        event_id: 217,
      },
      {
        partnerX: {
          id: 2540,
        },
        partnerY: {
          id: 2776,
        },
        round_number: 7,
        event_id: 217,
      },
      {
        partnerX: {
          id: 2441,
        },
        partnerY: {
          id: 2784,
        },
        round_number: 5,
        event_id: 217,
      },
      {
        partnerX: {
          id: 2387,
        },
        partnerY: {
          id: 319,
        },
        round_number: 7,
        event_id: 217,
      },
      {
        partnerX: {
          id: 12,
        },
        partnerY: {
          id: 2686,
        },
        round_number: 7,
        event_id: 217,
      },
      {
        partnerX: {
          id: 1933,
        },
        partnerY: {
          id: 2784,
        },
        round_number: 7,
        event_id: 217,
      },
      {
        partnerX: {
          id: 1933,
        },
        partnerY: {
          id: 2345,
        },
        round_number: 5,
        event_id: 217,
      },
      {
        partnerX: {
          id: 2387,
        },
        partnerY: {
          id: 8,
        },
        round_number: 5,
        event_id: 217,
      },
      {
        partnerX: {
          id: 2382,
        },
        partnerY: {
          id: 468,
        },
        round_number: 5,
        event_id: 217,
      },
      {
        partnerX: {
          id: 2686,
        },
        partnerY: {
          id: 2776,
        },
        round_number: 5,
        event_id: 217,
      },
      {
        partnerX: {
          id: 1901,
        },
        partnerY: {
          id: 2725,
        },
        round_number: 5,
        event_id: 217,
      },
      {
        partnerX: {
          id: 115,
        },
        partnerY: {
          id: 2120,
        },
        round_number: 5,
        event_id: 217,
      },
      {
        partnerX: {
          id: 2571,
        },
        partnerY: {
          id: 2654,
        },
        round_number: 5,
        event_id: 217,
      },
      {
        partnerX: {
          id: 12,
        },
        partnerY: {
          id: 2227,
        },
        round_number: 5,
        event_id: 217,
      },
      {
        partnerX: {
          id: 2120,
        },
        partnerY: {
          id: 319,
        },
        round_number: 6,
        event_id: 217,
      },
      {
        partnerX: {
          id: 2686,
        },
        partnerY: {
          id: 2784,
        },
        round_number: 6,
        event_id: 217,
      },
      {
        partnerX: {
          id: 12,
        },
        partnerY: {
          id: 2725,
        },
        round_number: 6,
        event_id: 217,
      },
      {
        partnerX: {
          id: 2345,
        },
        partnerY: {
          id: 2441,
        },
        round_number: 6,
        event_id: 217,
      },
      {
        partnerX: {
          id: 1933,
        },
        partnerY: {
          id: 2776,
        },
        round_number: 6,
        event_id: 217,
      },
      {
        partnerX: {
          id: 2227,
        },
        partnerY: {
          id: 2387,
        },
        round_number: 6,
        event_id: 217,
      },
      {
        partnerX: {
          id: 1901,
        },
        partnerY: {
          id: 2382,
        },
        round_number: 6,
        event_id: 217,
      },
      {
        partnerX: {
          id: 115,
        },
        partnerY: {
          id: 2220,
        },
        round_number: 6,
        event_id: 217,
      },
      {
        partnerX: {
          id: 1623,
        },
        partnerY: {
          id: 2247,
        },
        round_number: 2,
        event_id: 219,
      },
      {
        partnerX: {
          id: 2172,
        },
        partnerY: {
          id: 34,
        },
        round_number: 2,
        event_id: 219,
      },
      {
        partnerX: {
          id: 2540,
        },
        partnerY: {
          id: 8,
        },
        round_number: 8,
        event_id: 217,
      },
      {
        partnerX: {
          id: 2220,
        },
        partnerY: {
          id: 2227,
        },
        round_number: 8,
        event_id: 217,
      },
      {
        partnerX: {
          id: 2382,
        },
        partnerY: {
          id: 319,
        },
        round_number: 8,
        event_id: 217,
      },
      {
        partnerX: {
          id: 2686,
        },
        partnerY: {
          id: 2725,
        },
        round_number: 8,
        event_id: 217,
      },
      {
        partnerX: {
          id: 115,
        },
        partnerY: {
          id: 1933,
        },
        round_number: 8,
        event_id: 217,
      },
      {
        partnerX: {
          id: 2345,
        },
        partnerY: {
          id: 2387,
        },
        round_number: 8,
        event_id: 217,
      },
      {
        partnerX: {
          id: 12,
        },
        partnerY: {
          id: 506,
        },
        round_number: 2,
        event_id: 219,
      },
      {
        partnerX: {
          id: 12,
        },
        partnerY: {
          id: 1901,
        },
        round_number: 8,
        event_id: 217,
      },
      {
        partnerX: {
          id: 1933,
        },
        partnerY: {
          id: 2147,
        },
        round_number: 1,
        event_id: 219,
      },
      {
        partnerX: {
          id: 1623,
        },
        partnerY: {
          id: 2147,
        },
        round_number: 6,
        event_id: 219,
      },
      {
        partnerX: {
          id: 1623,
        },
        partnerY: {
          id: 1933,
        },
        round_number: 3,
        event_id: 219,
      },
      {
        partnerX: {
          id: 2147,
        },
        partnerY: {
          id: 2172,
        },
        round_number: 3,
        event_id: 219,
      },
      {
        partnerX: {
          id: 2247,
        },
        partnerY: {
          id: 506,
        },
        round_number: 3,
        event_id: 219,
      },
      {
        partnerX: {
          id: 2172,
        },
        partnerY: {
          id: 506,
        },
        round_number: 6,
        event_id: 219,
      },
      {
        partnerX: {
          id: 12,
        },
        partnerY: {
          id: 1623,
        },
        round_number: 4,
        event_id: 219,
      },
      {
        partnerX: {
          id: 2147,
        },
        partnerY: {
          id: 34,
        },
        round_number: 4,
        event_id: 219,
      },
      {
        partnerX: {
          id: 1623,
        },
        partnerY: {
          id: 506,
        },
        round_number: 5,
        event_id: 219,
      },
      {
        partnerX: {
          id: 2247,
        },
        partnerY: {
          id: 34,
        },
        round_number: 5,
        event_id: 219,
      },
      {
        partnerX: {
          id: 1933,
        },
        partnerY: {
          id: 2172,
        },
        round_number: 5,
        event_id: 219,
      },
      {
        partnerX: {
          id: 1623,
        },
        partnerY: {
          id: 34,
        },
        round_number: 8,
        event_id: 219,
      },
      {
        partnerX: {
          id: 2147,
        },
        partnerY: {
          id: 2247,
        },
        round_number: 7,
        event_id: 219,
      },
      {
        partnerX: {
          id: 1933,
        },
        partnerY: {
          id: 34,
        },
        round_number: 7,
        event_id: 219,
      },
      {
        partnerX: {
          id: 1933,
        },
        partnerY: {
          id: 2247,
        },
        round_number: 8,
        event_id: 219,
      },
      {
        partnerX: {
          id: 2701,
        },
        partnerY: {
          id: 2828,
        },
        round_number: 1,
        event_id: 193,
      },
      {
        partnerX: {
          id: 2082,
        },
        partnerY: {
          id: 2831,
        },
        round_number: 1,
        event_id: 193,
      },
      {
        partnerX: {
          id: 2737,
        },
        partnerY: {
          id: 2832,
        },
        round_number: 1,
        event_id: 193,
      },
      {
        partnerX: {
          id: 2791,
        },
        partnerY: {
          id: 2832,
        },
        round_number: 2,
        event_id: 193,
      },
      {
        partnerX: {
          id: 12,
        },
        partnerY: {
          id: 2701,
        },
        round_number: 2,
        event_id: 193,
      },
      {
        partnerX: {
          id: 1586,
        },
        partnerY: {
          id: 2828,
        },
        round_number: 2,
        event_id: 193,
      },
      {
        partnerX: {
          id: 2222,
        },
        partnerY: {
          id: 2831,
        },
        round_number: 2,
        event_id: 193,
      },
      {
        partnerX: {
          id: 2082,
        },
        partnerY: {
          id: 2737,
        },
        round_number: 2,
        event_id: 193,
      },
      {
        partnerX: {
          id: 2714,
        },
        partnerY: {
          id: 2877,
        },
        round_number: 1,
        event_id: 238,
      },
      {
        partnerX: {
          id: 2737,
        },
        partnerY: {
          id: 2791,
        },
        round_number: 3,
        event_id: 193,
      },
      {
        partnerX: {
          id: 12,
        },
        partnerY: {
          id: 2828,
        },
        round_number: 3,
        event_id: 193,
      },
      {
        partnerX: {
          id: 2829,
        },
        partnerY: {
          id: 2831,
        },
        round_number: 3,
        event_id: 193,
      },
      {
        partnerX: {
          id: 2082,
        },
        partnerY: {
          id: 2832,
        },
        round_number: 4,
        event_id: 193,
      },
      {
        partnerX: {
          id: 2828,
        },
        partnerY: {
          id: 2831,
        },
        round_number: 4,
        event_id: 193,
      },
      {
        partnerX: {
          id: 2791,
        },
        partnerY: {
          id: 2829,
        },
        round_number: 4,
        event_id: 193,
      },
      {
        partnerX: {
          id: 2791,
        },
        partnerY: {
          id: 2828,
        },
        round_number: 5,
        event_id: 193,
      },
      {
        partnerX: {
          id: 1586,
        },
        partnerY: {
          id: 2831,
        },
        round_number: 5,
        event_id: 193,
      },
      {
        partnerX: {
          id: 2701,
        },
        partnerY: {
          id: 2832,
        },
        round_number: 5,
        event_id: 193,
      },
      {
        partnerX: {
          id: 2729,
        },
        partnerY: {
          id: 2870,
        },
        round_number: 3,
        event_id: 238,
      },
      {
        partnerX: {
          id: 2847,
        },
        partnerY: {
          id: 2876,
        },
        round_number: 4,
        event_id: 238,
      },
      {
        partnerX: {
          id: 2723,
        },
        partnerY: {
          id: 2870,
        },
        round_number: 2,
        event_id: 238,
      },
      {
        partnerX: {
          id: 2408,
        },
        partnerY: {
          id: 2847,
        },
        round_number: 1,
        event_id: 238,
      },
      {
        partnerX: {
          id: 2783,
        },
        partnerY: {
          id: 2848,
        },
        round_number: 1,
        event_id: 238,
      },
      {
        partnerX: {
          id: 2716,
        },
        partnerY: {
          id: 2841,
        },
        round_number: 1,
        event_id: 238,
      },
      {
        partnerX: {
          id: 2783,
        },
        partnerY: {
          id: 2897,
        },
        round_number: 2,
        event_id: 238,
      },
      {
        partnerX: {
          id: 2868,
        },
        partnerY: {
          id: 2876,
        },
        round_number: 1,
        event_id: 238,
      },
      {
        partnerX: {
          id: 2847,
        },
        partnerY: {
          id: 2848,
        },
        round_number: 3,
        event_id: 238,
      },
      {
        partnerX: {
          id: 2723,
        },
        partnerY: {
          id: 2841,
        },
        round_number: 3,
        event_id: 238,
      },
      {
        partnerX: {
          id: 2714,
        },
        partnerY: {
          id: 2729,
        },
        round_number: 2,
        event_id: 238,
      },
      {
        partnerX: {
          id: 2868,
        },
        partnerY: {
          id: 2873,
        },
        round_number: 2,
        event_id: 238,
      },
      {
        partnerX: {
          id: 2714,
        },
        partnerY: {
          id: 2876,
        },
        round_number: 3,
        event_id: 238,
      },
      {
        partnerX: {
          id: 2717,
        },
        partnerY: {
          id: 2868,
        },
        round_number: 4,
        event_id: 238,
      },
      {
        partnerX: {
          id: 2123,
        },
        partnerY: {
          id: 2783,
        },
        round_number: 3,
        event_id: 238,
      },
      {
        partnerX: {
          id: 2716,
        },
        partnerY: {
          id: 2877,
        },
        round_number: 3,
        event_id: 238,
      },
      {
        partnerX: {
          id: 2717,
        },
        partnerY: {
          id: 2880,
        },
        round_number: 3,
        event_id: 238,
      },
      {
        partnerX: {
          id: 2786,
        },
        partnerY: {
          id: 2897,
        },
        round_number: 4,
        event_id: 238,
      },
      {
        partnerX: {
          id: 2716,
        },
        partnerY: {
          id: 2783,
        },
        round_number: 4,
        event_id: 238,
      },
      {
        partnerX: {
          id: 2408,
        },
        partnerY: {
          id: 2786,
        },
        round_number: 5,
        event_id: 238,
      },
      {
        partnerX: {
          id: 2157,
        },
        partnerY: {
          id: 2723,
        },
        round_number: 5,
        event_id: 238,
      },
      {
        partnerX: {
          id: 2408,
        },
        partnerY: {
          id: 2872,
        },
        round_number: 4,
        event_id: 238,
      },
      {
        partnerX: {
          id: 2123,
        },
        partnerY: {
          id: 2723,
        },
        round_number: 4,
        event_id: 238,
      },
      {
        partnerX: {
          id: 2841,
        },
        partnerY: {
          id: 2848,
        },
        round_number: 4,
        event_id: 238,
      },
      {
        partnerX: {
          id: 2864,
        },
        partnerY: {
          id: 2880,
        },
        round_number: 4,
        event_id: 238,
      },
      {
        partnerX: {
          id: 2157,
        },
        partnerY: {
          id: 2729,
        },
        round_number: 4,
        event_id: 238,
      },
      {
        partnerX: {
          id: 2716,
        },
        partnerY: {
          id: 2870,
        },
        round_number: 5,
        event_id: 238,
      },
      {
        partnerX: {
          id: 2783,
        },
        partnerY: {
          id: 2876,
        },
        round_number: 5,
        event_id: 238,
      },
      {
        partnerX: {
          id: 2847,
        },
        partnerY: {
          id: 2877,
        },
        round_number: 5,
        event_id: 238,
      },
      {
        partnerX: {
          id: 2729,
        },
        partnerY: {
          id: 2841,
        },
        round_number: 6,
        event_id: 238,
      },
      {
        partnerX: {
          id: 2783,
        },
        partnerY: {
          id: 2864,
        },
        round_number: 6,
        event_id: 238,
      },
      {
        partnerX: {
          id: 2123,
        },
        partnerY: {
          id: 2408,
        },
        round_number: 6,
        event_id: 238,
      },
      {
        partnerX: {
          id: 2723,
        },
        partnerY: {
          id: 2876,
        },
        round_number: 6,
        event_id: 238,
      },
      {
        partnerX: {
          id: 2717,
        },
        partnerY: {
          id: 2786,
        },
        round_number: 6,
        event_id: 238,
      },
      {
        partnerX: {
          id: 2716,
        },
        partnerY: {
          id: 2848,
        },
        round_number: 6,
        event_id: 238,
      },
      {
        partnerX: {
          id: 2714,
        },
        partnerY: {
          id: 2868,
        },
        round_number: 6,
        event_id: 238,
      },
      {
        partnerX: {
          id: 2870,
        },
        partnerY: {
          id: 2872,
        },
        round_number: 6,
        event_id: 238,
      },
      {
        partnerX: {
          id: 2786,
        },
        partnerY: {
          id: 2848,
        },
        round_number: 7,
        event_id: 238,
      },
      {
        partnerX: {
          id: 2723,
        },
        partnerY: {
          id: 2868,
        },
        round_number: 10,
        event_id: 238,
      },
      {
        partnerX: {
          id: 2123,
        },
        partnerY: {
          id: 2848,
        },
        round_number: 10,
        event_id: 238,
      },
      {
        partnerX: {
          id: 2864,
        },
        partnerY: {
          id: 2870,
        },
        round_number: 7,
        event_id: 238,
      },
      {
        partnerX: {
          id: 2847,
        },
        partnerY: {
          id: 2897,
        },
        round_number: 7,
        event_id: 238,
      },
      {
        partnerX: {
          id: 2714,
        },
        partnerY: {
          id: 2716,
        },
        round_number: 7,
        event_id: 238,
      },
      {
        partnerX: {
          id: 2783,
        },
        partnerY: {
          id: 2786,
        },
        round_number: 10,
        event_id: 238,
      },
      {
        partnerX: {
          id: 2714,
        },
        partnerY: {
          id: 2847,
        },
        round_number: 10,
        event_id: 238,
      },
      {
        partnerX: {
          id: 2876,
        },
        partnerY: {
          id: 2899,
        },
        round_number: 10,
        event_id: 238,
      },
      {
        partnerX: {
          id: 2723,
        },
        partnerY: {
          id: 2880,
        },
        round_number: 8,
        event_id: 238,
      },
      {
        partnerX: {
          id: 2717,
        },
        partnerY: {
          id: 2897,
        },
        round_number: 8,
        event_id: 238,
      },
      {
        partnerX: {
          id: 2729,
        },
        partnerY: {
          id: 2848,
        },
        round_number: 8,
        event_id: 238,
      },
      {
        partnerX: {
          id: 2868,
        },
        partnerY: {
          id: 2870,
        },
        round_number: 8,
        event_id: 238,
      },
      {
        partnerX: {
          id: 2157,
        },
        partnerY: {
          id: 2847,
        },
        round_number: 8,
        event_id: 238,
      },
      {
        partnerX: {
          id: 2716,
        },
        partnerY: {
          id: 2847,
        },
        round_number: 9,
        event_id: 238,
      },
      {
        partnerX: {
          id: 2848,
        },
        partnerY: {
          id: 2897,
        },
        round_number: 9,
        event_id: 238,
      },
      {
        partnerX: {
          id: 2841,
        },
        partnerY: {
          id: 2876,
        },
        round_number: 9,
        event_id: 238,
      },
      {
        partnerX: {
          id: 2870,
        },
        partnerY: {
          id: 2877,
        },
        round_number: 9,
        event_id: 238,
      },
      {
        partnerX: {
          id: 2729,
        },
        partnerY: {
          id: 2868,
        },
        round_number: 9,
        event_id: 238,
      },
      {
        partnerX: {
          id: 2870,
        },
        partnerY: {
          id: 2876,
        },
        round_number: 12,
        event_id: 238,
      },
      {
        partnerX: {
          id: 2716,
        },
        partnerY: {
          id: 2717,
        },
        round_number: 10,
        event_id: 238,
      },
      {
        partnerX: {
          id: 2841,
        },
        partnerY: {
          id: 2897,
        },
        round_number: 10,
        event_id: 238,
      },
      {
        partnerX: {
          id: 2877,
        },
        partnerY: {
          id: 2880,
        },
        round_number: 10,
        event_id: 238,
      },
      {
        partnerX: {
          id: 2848,
        },
        partnerY: {
          id: 2864,
        },
        round_number: 13,
        event_id: 238,
      },
      {
        partnerX: {
          id: 2729,
        },
        partnerY: {
          id: 2876,
        },
        round_number: 13,
        event_id: 238,
      },
      {
        partnerX: {
          id: 2714,
        },
        partnerY: {
          id: 2717,
        },
        round_number: 11,
        event_id: 238,
      },
      {
        partnerX: {
          id: 2841,
        },
        partnerY: {
          id: 2870,
        },
        round_number: 11,
        event_id: 238,
      },
      {
        partnerX: {
          id: 2716,
        },
        partnerY: {
          id: 2723,
        },
        round_number: 12,
        event_id: 238,
      },
      {
        partnerX: {
          id: 2723,
        },
        partnerY: {
          id: 2783,
        },
        round_number: 11,
        event_id: 238,
      },
      {
        partnerX: {
          id: 2786,
        },
        partnerY: {
          id: 2868,
        },
        round_number: 11,
        event_id: 238,
      },
      {
        partnerX: {
          id: 2876,
        },
        partnerY: {
          id: 2877,
        },
        round_number: 11,
        event_id: 238,
      },
      {
        partnerX: {
          id: 2716,
        },
        partnerY: {
          id: 2873,
        },
        round_number: 11,
        event_id: 238,
      },
      {
        partnerX: {
          id: 2714,
        },
        partnerY: {
          id: 2841,
        },
        round_number: 13,
        event_id: 238,
      },
      {
        partnerX: {
          id: 2714,
        },
        partnerY: {
          id: 2880,
        },
        round_number: 12,
        event_id: 238,
      },
      {
        partnerX: {
          id: 2783,
        },
        partnerY: {
          id: 2873,
        },
        round_number: 12,
        event_id: 238,
      },
      {
        partnerX: {
          id: 2847,
        },
        partnerY: {
          id: 2868,
        },
        round_number: 12,
        event_id: 238,
      },
      {
        partnerX: {
          id: 2778,
        },
        partnerY: {
          id: 2897,
        },
        round_number: 12,
        event_id: 238,
      },
      {
        partnerX: {
          id: 2717,
        },
        partnerY: {
          id: 2729,
        },
        round_number: 14,
        event_id: 238,
      },
      {
        partnerX: {
          id: 2876,
        },
        partnerY: {
          id: 2880,
        },
        round_number: 14,
        event_id: 238,
      },
      {
        partnerX: {
          id: 2717,
        },
        partnerY: {
          id: 2723,
        },
        round_number: 13,
        event_id: 238,
      },
      {
        partnerX: {
          id: 2408,
        },
        partnerY: {
          id: 2783,
        },
        round_number: 14,
        event_id: 238,
      },
      {
        partnerX: {
          id: 2783,
        },
        partnerY: {
          id: 2877,
        },
        round_number: 13,
        event_id: 238,
      },
      {
        partnerX: {
          id: 2408,
        },
        partnerY: {
          id: 2897,
        },
        round_number: 13,
        event_id: 238,
      },
      {
        partnerX: {
          id: 2716,
        },
        partnerY: {
          id: 2778,
        },
        round_number: 13,
        event_id: 238,
      },
      {
        partnerX: {
          id: 2873,
        },
        partnerY: {
          id: 2899,
        },
        round_number: 13,
        event_id: 238,
      },
      {
        partnerX: {
          id: 2841,
        },
        partnerY: {
          id: 2864,
        },
        round_number: 14,
        event_id: 238,
      },
      {
        partnerX: {
          id: 2716,
        },
        partnerY: {
          id: 2897,
        },
        round_number: 14,
        event_id: 238,
      },
      {
        partnerX: {
          id: 2847,
        },
        partnerY: {
          id: 2873,
        },
        round_number: 14,
        event_id: 238,
      },
      {
        partnerX: {
          id: 2848,
        },
        partnerY: {
          id: 2877,
        },
        round_number: 14,
        event_id: 238,
      },
      {
        partnerX: {
          id: 115,
        },
        partnerY: {
          id: 12,
        },
        round_number: 1,
        event_id: 276,
      },
      {
        partnerX: {
          id: 2925,
        },
        partnerY: {
          id: 513,
        },
        round_number: 1,
        event_id: 276,
      },
      {
        partnerX: {
          id: 2861,
        },
        partnerY: {
          id: 3043,
        },
        round_number: 2,
        event_id: 248,
      },
      {
        partnerX: {
          id: 115,
        },
        partnerY: {
          id: 513,
        },
        round_number: 2,
        event_id: 276,
      },
      {
        partnerX: {
          id: 12,
        },
        partnerY: {
          id: 513,
        },
        round_number: 3,
        event_id: 276,
      },
      {
        partnerX: {
          id: 2152,
        },
        partnerY: {
          id: 2854,
        },
        round_number: 2,
        event_id: 246,
      },
      {
        partnerX: {
          id: 2436,
        },
        partnerY: {
          id: 2854,
        },
        round_number: 3,
        event_id: 246,
      },
      {
        partnerX: {
          id: 3039,
        },
        partnerY: {
          id: 3040,
        },
        round_number: 1,
        event_id: 248,
      },
      {
        partnerX: {
          id: 2861,
        },
        partnerY: {
          id: 3037,
        },
        round_number: 1,
        event_id: 248,
      },
      {
        partnerX: {
          id: 2333,
        },
        partnerY: {
          id: 2927,
        },
        round_number: 1,
        event_id: 248,
      },
      {
        partnerX: {
          id: 3037,
        },
        partnerY: {
          id: 3043,
        },
        round_number: 3,
        event_id: 248,
      },
      {
        partnerX: {
          id: 2927,
        },
        partnerY: {
          id: 3040,
        },
        round_number: 2,
        event_id: 248,
      },
      {
        partnerX: {
          id: 3037,
        },
        partnerY: {
          id: 3039,
        },
        round_number: 2,
        event_id: 248,
      },
      {
        partnerX: {
          id: 2927,
        },
        partnerY: {
          id: 3039,
        },
        round_number: 3,
        event_id: 248,
      },
      {
        partnerX: {
          id: 2861,
        },
        partnerY: {
          id: 3040,
        },
        round_number: 3,
        event_id: 248,
      },
      {
        partnerX: {
          id: 2927,
        },
        partnerY: {
          id: 3037,
        },
        round_number: 6,
        event_id: 248,
      },
      {
        partnerX: {
          id: 2333,
        },
        partnerY: {
          id: 3039,
        },
        round_number: 5,
        event_id: 248,
      },
      {
        partnerX: {
          id: 2861,
        },
        partnerY: {
          id: 3039,
        },
        round_number: 4,
        event_id: 248,
      },
      {
        partnerX: {
          id: 3040,
        },
        partnerY: {
          id: 3043,
        },
        round_number: 4,
        event_id: 248,
      },
      {
        partnerX: {
          id: 2333,
        },
        partnerY: {
          id: 3037,
        },
        round_number: 4,
        event_id: 248,
      },
      {
        partnerX: {
          id: 3039,
        },
        partnerY: {
          id: 3043,
        },
        round_number: 6,
        event_id: 248,
      },
      {
        partnerX: {
          id: 2927,
        },
        partnerY: {
          id: 3043,
        },
        round_number: 5,
        event_id: 248,
      },
      {
        partnerX: {
          id: 12,
        },
        partnerY: {
          id: 3062,
        },
        round_number: 2,
        event_id: 231,
      },
      {
        partnerX: {
          id: 1918,
        },
        partnerY: {
          id: 1933,
        },
        round_number: 1,
        event_id: 231,
      },
      {
        partnerX: {
          id: 2916,
        },
        partnerY: {
          id: 513,
        },
        round_number: 1,
        event_id: 231,
      },
      {
        partnerX: {
          id: 3059,
        },
        partnerY: {
          id: 3062,
        },
        round_number: 1,
        event_id: 231,
      },
      {
        partnerX: {
          id: 1933,
        },
        partnerY: {
          id: 3059,
        },
        round_number: 2,
        event_id: 231,
      },
      {
        partnerX: {
          id: 34,
        },
        partnerY: {
          id: 513,
        },
        round_number: 2,
        event_id: 231,
      },
      {
        partnerX: {
          id: 1635,
        },
        partnerY: {
          id: 2916,
        },
        round_number: 2,
        event_id: 231,
      },
      {
        partnerX: {
          id: 1933,
        },
        partnerY: {
          id: 3062,
        },
        round_number: 3,
        event_id: 231,
      },
      {
        partnerX: {
          id: 2809,
        },
        partnerY: {
          id: 3059,
        },
        round_number: 3,
        event_id: 231,
      },
      {
        partnerX: {
          id: 12,
        },
        partnerY: {
          id: 513,
        },
        round_number: 3,
        event_id: 231,
      },
      {
        partnerX: {
          id: 1808,
        },
        partnerY: {
          id: 2916,
        },
        round_number: 3,
        event_id: 231,
      },
      {
        partnerX: {
          id: 1918,
        },
        partnerY: {
          id: 2916,
        },
        round_number: 4,
        event_id: 231,
      },
      {
        partnerX: {
          id: 12,
        },
        partnerY: {
          id: 1933,
        },
        round_number: 4,
        event_id: 231,
      },
      {
        partnerX: {
          id: 2196,
        },
        partnerY: {
          id: 2809,
        },
        round_number: 5,
        event_id: 231,
      },
      {
        partnerX: {
          id: 3059,
        },
        partnerY: {
          id: 513,
        },
        round_number: 5,
        event_id: 231,
      },
      {
        partnerX: {
          id: 2916,
        },
        partnerY: {
          id: 3062,
        },
        round_number: 5,
        event_id: 231,
      },
      {
        partnerX: {
          id: 1933,
        },
        partnerY: {
          id: 2916,
        },
        round_number: 6,
        event_id: 231,
      },
      {
        partnerX: {
          id: 2196,
        },
        partnerY: {
          id: 513,
        },
        round_number: 6,
        event_id: 231,
      },
      {
        partnerX: {
          id: 1635,
        },
        partnerY: {
          id: 3062,
        },
        round_number: 6,
        event_id: 231,
      },
      {
        partnerX: {
          id: 1933,
        },
        partnerY: {
          id: 2809,
        },
        round_number: 7,
        event_id: 231,
      },
      {
        partnerX: {
          id: 1808,
        },
        partnerY: {
          id: 2412,
        },
        round_number: 6,
        event_id: 232,
      },
      {
        partnerX: {
          id: 1918,
        },
        partnerY: {
          id: 3062,
        },
        round_number: 7,
        event_id: 231,
      },
      {
        partnerX: {
          id: 1635,
        },
        partnerY: {
          id: 2196,
        },
        round_number: 7,
        event_id: 231,
      },
      {
        partnerX: {
          id: 1933,
        },
        partnerY: {
          id: 513,
        },
        round_number: 8,
        event_id: 231,
      },
      {
        partnerX: {
          id: 513,
        },
        partnerY: {
          id: 8,
        },
        round_number: 3,
        event_id: 232,
      },
      {
        partnerX: {
          id: 1585,
        },
        partnerY: {
          id: 1808,
        },
        round_number: 5,
        event_id: 232,
      },
      {
        partnerX: {
          id: 12,
        },
        partnerY: {
          id: 2809,
        },
        round_number: 8,
        event_id: 231,
      },
      {
        partnerX: {
          id: 3062,
        },
        partnerY: {
          id: 34,
        },
        round_number: 8,
        event_id: 231,
      },
      {
        partnerX: {
          id: 1918,
        },
        partnerY: {
          id: 2196,
        },
        round_number: 8,
        event_id: 231,
      },
      {
        partnerX: {
          id: 1560,
        },
        partnerY: {
          id: 1585,
        },
        round_number: 3,
        event_id: 232,
      },
      {
        partnerX: {
          id: 1313,
        },
        partnerY: {
          id: 513,
        },
        round_number: 6,
        event_id: 232,
      },
      {
        partnerX: {
          id: 2196,
        },
        partnerY: {
          id: 3059,
        },
        round_number: 9,
        event_id: 231,
      },
      {
        partnerX: {
          id: 1918,
        },
        partnerY: {
          id: 34,
        },
        round_number: 9,
        event_id: 231,
      },
      {
        partnerX: {
          id: 1578,
        },
        partnerY: {
          id: 1808,
        },
        round_number: 3,
        event_id: 232,
      },
      {
        partnerX: {
          id: 2247,
        },
        partnerY: {
          id: 513,
        },
        round_number: 1,
        event_id: 232,
      },
      {
        partnerX: {
          id: 115,
        },
        partnerY: {
          id: 1901,
        },
        round_number: 3,
        event_id: 232,
      },
      {
        partnerX: {
          id: 12,
        },
        partnerY: {
          id: 2412,
        },
        round_number: 1,
        event_id: 232,
      },
      {
        partnerX: {
          id: 1560,
        },
        partnerY: {
          id: 1808,
        },
        round_number: 1,
        event_id: 232,
      },
      {
        partnerX: {
          id: 1933,
        },
        partnerY: {
          id: 2859,
        },
        round_number: 1,
        event_id: 232,
      },
      {
        partnerX: {
          id: 1585,
        },
        partnerY: {
          id: 1901,
        },
        round_number: 1,
        event_id: 232,
      },
      {
        partnerX: {
          id: 2571,
        },
        partnerY: {
          id: 8,
        },
        round_number: 5,
        event_id: 232,
      },
      {
        partnerX: {
          id: 1933,
        },
        partnerY: {
          id: 2247,
        },
        round_number: 5,
        event_id: 232,
      },
      {
        partnerX: {
          id: 1808,
        },
        partnerY: {
          id: 8,
        },
        round_number: 4,
        event_id: 232,
      },
      {
        partnerX: {
          id: 1901,
        },
        partnerY: {
          id: 2788,
        },
        round_number: 5,
        event_id: 232,
      },
      {
        partnerX: {
          id: 1933,
        },
        partnerY: {
          id: 2571,
        },
        round_number: 4,
        event_id: 232,
      },
      {
        partnerX: {
          id: 1560,
        },
        partnerY: {
          id: 2247,
        },
        round_number: 4,
        event_id: 232,
      },
      {
        partnerX: {
          id: 2359,
        },
        partnerY: {
          id: 513,
        },
        round_number: 4,
        event_id: 232,
      },
      {
        partnerX: {
          id: 12,
        },
        partnerY: {
          id: 1901,
        },
        round_number: 4,
        event_id: 232,
      },
      {
        partnerX: {
          id: 115,
        },
        partnerY: {
          id: 2859,
        },
        round_number: 5,
        event_id: 232,
      },
      {
        partnerX: {
          id: 12,
        },
        partnerY: {
          id: 513,
        },
        round_number: 5,
        event_id: 232,
      },
      {
        partnerX: {
          id: 1585,
        },
        partnerY: {
          id: 2571,
        },
        round_number: 7,
        event_id: 232,
      },
      {
        partnerX: {
          id: 12,
        },
        partnerY: {
          id: 2247,
        },
        round_number: 6,
        event_id: 232,
      },
      {
        partnerX: {
          id: 1901,
        },
        partnerY: {
          id: 8,
        },
        round_number: 6,
        event_id: 232,
      },
      {
        partnerX: {
          id: 115,
        },
        partnerY: {
          id: 2571,
        },
        round_number: 6,
        event_id: 232,
      },
      {
        partnerX: {
          id: 1313,
        },
        partnerY: {
          id: 2859,
        },
        round_number: 7,
        event_id: 232,
      },
      {
        partnerX: {
          id: 12,
        },
        partnerY: {
          id: 8,
        },
        round_number: 7,
        event_id: 232,
      },
      {
        partnerX: {
          id: 2571,
        },
        partnerY: {
          id: 513,
        },
        round_number: 8,
        event_id: 232,
      },
      {
        partnerX: {
          id: 115,
        },
        partnerY: {
          id: 1808,
        },
        round_number: 7,
        event_id: 232,
      },
      {
        partnerX: {
          id: 1933,
        },
        partnerY: {
          id: 513,
        },
        round_number: 7,
        event_id: 232,
      },
      {
        partnerX: {
          id: 1313,
        },
        partnerY: {
          id: 1585,
        },
        round_number: 9,
        event_id: 232,
      },
      {
        partnerX: {
          id: 1313,
        },
        partnerY: {
          id: 1808,
        },
        round_number: 8,
        event_id: 232,
      },
      {
        partnerX: {
          id: 1901,
        },
        partnerY: {
          id: 2247,
        },
        round_number: 8,
        event_id: 232,
      },
      {
        partnerX: {
          id: 2859,
        },
        partnerY: {
          id: 8,
        },
        round_number: 8,
        event_id: 232,
      },
      {
        partnerX: {
          id: 1901,
        },
        partnerY: {
          id: 2571,
        },
        round_number: 9,
        event_id: 232,
      },
      {
        partnerX: {
          id: 115,
        },
        partnerY: {
          id: 8,
        },
        round_number: 9,
        event_id: 232,
      },
      {
        partnerX: {
          id: 12,
        },
        partnerY: {
          id: 1933,
        },
        round_number: 9,
        event_id: 232,
      },
      {
        partnerX: {
          id: 2247,
        },
        partnerY: {
          id: 2859,
        },
        round_number: 9,
        event_id: 232,
      },
      {
        partnerX: {
          id: 115,
        },
        partnerY: {
          id: 3095,
        },
        round_number: 4,
        event_id: 233,
      },
      {
        partnerX: {
          id: 2362,
        },
        partnerY: {
          id: 2808,
        },
        round_number: 4,
        event_id: 233,
      },
      {
        partnerX: {
          id: 2382,
        },
        partnerY: {
          id: 2563,
        },
        round_number: 3,
        event_id: 233,
      },
      {
        partnerX: {
          id: 2862,
        },
        partnerY: {
          id: 8,
        },
        round_number: 4,
        event_id: 233,
      },
      {
        partnerX: {
          id: 1808,
        },
        partnerY: {
          id: 2552,
        },
        round_number: 1,
        event_id: 233,
      },
      {
        partnerX: {
          id: 2362,
        },
        partnerY: {
          id: 506,
        },
        round_number: 5,
        event_id: 233,
      },
      {
        partnerX: {
          id: 1071,
        },
        partnerY: {
          id: 2387,
        },
        round_number: 4,
        event_id: 233,
      },
      {
        partnerX: {
          id: 2865,
        },
        partnerY: {
          id: 8,
        },
        round_number: 3,
        event_id: 233,
      },
      {
        partnerX: {
          id: 1933,
        },
        partnerY: {
          id: 506,
        },
        round_number: 1,
        event_id: 233,
      },
      {
        partnerX: {
          id: 1071,
        },
        partnerY: {
          id: 2552,
        },
        round_number: 3,
        event_id: 233,
      },
      {
        partnerX: {
          id: 1808,
        },
        partnerY: {
          id: 2787,
        },
        round_number: 3,
        event_id: 233,
      },
      {
        partnerX: {
          id: 12,
        },
        partnerY: {
          id: 3030,
        },
        round_number: 1,
        event_id: 233,
      },
      {
        partnerX: {
          id: 1071,
        },
        partnerY: {
          id: 2362,
        },
        round_number: 1,
        event_id: 233,
      },
      {
        partnerX: {
          id: 2540,
        },
        partnerY: {
          id: 8,
        },
        round_number: 1,
        event_id: 233,
      },
      {
        partnerX: {
          id: 2333,
        },
        partnerY: {
          id: 2862,
        },
        round_number: 1,
        event_id: 233,
      },
      {
        partnerX: {
          id: 115,
        },
        partnerY: {
          id: 2444,
        },
        round_number: 1,
        event_id: 233,
      },
      {
        partnerX: {
          id: 115,
        },
        partnerY: {
          id: 1933,
        },
        round_number: 3,
        event_id: 233,
      },
      {
        partnerX: {
          id: 2563,
        },
        partnerY: {
          id: 2787,
        },
        round_number: 1,
        event_id: 233,
      },
      {
        partnerX: {
          id: 1645,
        },
        partnerY: {
          id: 1901,
        },
        round_number: 1,
        event_id: 233,
      },
      {
        partnerX: {
          id: 2387,
        },
        partnerY: {
          id: 3030,
        },
        round_number: 3,
        event_id: 233,
      },
      {
        partnerX: {
          id: 1617,
        },
        partnerY: {
          id: 2382,
        },
        round_number: 1,
        event_id: 233,
      },
      {
        partnerX: {
          id: 2227,
        },
        partnerY: {
          id: 3091,
        },
        round_number: 1,
        event_id: 233,
      },
      {
        partnerX: {
          id: 2333,
        },
        partnerY: {
          id: 591,
        },
        round_number: 3,
        event_id: 233,
      },
      {
        partnerX: {
          id: 1645,
        },
        partnerY: {
          id: 2808,
        },
        round_number: 3,
        event_id: 233,
      },
      {
        partnerX: {
          id: 2362,
        },
        partnerY: {
          id: 3095,
        },
        round_number: 2,
        event_id: 233,
      },
      {
        partnerX: {
          id: 2552,
        },
        partnerY: {
          id: 506,
        },
        round_number: 2,
        event_id: 233,
      },
      {
        partnerX: {
          id: 2227,
        },
        partnerY: {
          id: 3095,
        },
        round_number: 3,
        event_id: 233,
      },
      {
        partnerX: {
          id: 2178,
        },
        partnerY: {
          id: 2552,
        },
        round_number: 4,
        event_id: 233,
      },
      {
        partnerX: {
          id: 1645,
        },
        partnerY: {
          id: 3030,
        },
        round_number: 2,
        event_id: 233,
      },
      {
        partnerX: {
          id: 2865,
        },
        partnerY: {
          id: 591,
        },
        round_number: 2,
        event_id: 233,
      },
      {
        partnerX: {
          id: 1933,
        },
        partnerY: {
          id: 2227,
        },
        round_number: 2,
        event_id: 233,
      },
      {
        partnerX: {
          id: 2444,
        },
        partnerY: {
          id: 506,
        },
        round_number: 3,
        event_id: 233,
      },
      {
        partnerX: {
          id: 12,
        },
        partnerY: {
          id: 2045,
        },
        round_number: 3,
        event_id: 233,
      },
      {
        partnerX: {
          id: 1533,
        },
        partnerY: {
          id: 2862,
        },
        round_number: 3,
        event_id: 233,
      },
      {
        partnerX: {
          id: 2333,
        },
        partnerY: {
          id: 2444,
        },
        round_number: 2,
        event_id: 233,
      },
      {
        partnerX: {
          id: 2178,
        },
        partnerY: {
          id: 2540,
        },
        round_number: 3,
        event_id: 233,
      },
      {
        partnerX: {
          id: 115,
        },
        partnerY: {
          id: 1617,
        },
        round_number: 2,
        event_id: 233,
      },
      {
        partnerX: {
          id: 2382,
        },
        partnerY: {
          id: 8,
        },
        round_number: 2,
        event_id: 233,
      },
      {
        partnerX: {
          id: 1808,
        },
        partnerY: {
          id: 2808,
        },
        round_number: 2,
        event_id: 233,
      },
      {
        partnerX: {
          id: 1071,
        },
        partnerY: {
          id: 2563,
        },
        round_number: 2,
        event_id: 233,
      },
      {
        partnerX: {
          id: 2387,
        },
        partnerY: {
          id: 3091,
        },
        round_number: 2,
        event_id: 233,
      },
      {
        partnerX: {
          id: 1533,
        },
        partnerY: {
          id: 1901,
        },
        round_number: 2,
        event_id: 233,
      },
      {
        partnerX: {
          id: 2387,
        },
        partnerY: {
          id: 591,
        },
        round_number: 5,
        event_id: 233,
      },
      {
        partnerX: {
          id: 2382,
        },
        partnerY: {
          id: 2865,
        },
        round_number: 4,
        event_id: 233,
      },
      {
        partnerX: {
          id: 12,
        },
        partnerY: {
          id: 1933,
        },
        round_number: 4,
        event_id: 233,
      },
      {
        partnerX: {
          id: 1901,
        },
        partnerY: {
          id: 3030,
        },
        round_number: 4,
        event_id: 233,
      },
      {
        partnerX: {
          id: 2563,
        },
        partnerY: {
          id: 506,
        },
        round_number: 4,
        event_id: 233,
      },
      {
        partnerX: {
          id: 2227,
        },
        partnerY: {
          id: 2333,
        },
        round_number: 4,
        event_id: 233,
      },
      {
        partnerX: {
          id: 1808,
        },
        partnerY: {
          id: 3091,
        },
        round_number: 4,
        event_id: 233,
      },
      {
        partnerX: {
          id: 1933,
        },
        partnerY: {
          id: 2787,
        },
        round_number: 5,
        event_id: 233,
      },
      {
        partnerX: {
          id: 1645,
        },
        partnerY: {
          id: 2382,
        },
        round_number: 5,
        event_id: 233,
      },
      {
        partnerX: {
          id: 2362,
        },
        partnerY: {
          id: 2787,
        },
        round_number: 6,
        event_id: 233,
      },
      {
        partnerX: {
          id: 2178,
        },
        partnerY: {
          id: 2865,
        },
        round_number: 6,
        event_id: 233,
      },
      {
        partnerX: {
          id: 1071,
        },
        partnerY: {
          id: 115,
        },
        round_number: 5,
        event_id: 233,
      },
      {
        partnerX: {
          id: 3030,
        },
        partnerY: {
          id: 8,
        },
        round_number: 5,
        event_id: 233,
      },
      {
        partnerX: {
          id: 1533,
        },
        partnerY: {
          id: 2178,
        },
        round_number: 5,
        event_id: 233,
      },
      {
        partnerX: {
          id: 2227,
        },
        partnerY: {
          id: 2563,
        },
        round_number: 5,
        event_id: 233,
      },
      {
        partnerX: {
          id: 2444,
        },
        partnerY: {
          id: 3091,
        },
        round_number: 7,
        event_id: 233,
      },
      {
        partnerX: {
          id: 1933,
        },
        partnerY: {
          id: 591,
        },
        round_number: 6,
        event_id: 233,
      },
      {
        partnerX: {
          id: 2045,
        },
        partnerY: {
          id: 3091,
        },
        round_number: 6,
        event_id: 233,
      },
      {
        partnerX: {
          id: 2387,
        },
        partnerY: {
          id: 2862,
        },
        round_number: 6,
        event_id: 233,
      },
      {
        partnerX: {
          id: 3030,
        },
        partnerY: {
          id: 506,
        },
        round_number: 6,
        event_id: 233,
      },
      {
        partnerX: {
          id: 115,
        },
        partnerY: {
          id: 2382,
        },
        round_number: 6,
        event_id: 233,
      },
      {
        partnerX: {
          id: 1901,
        },
        partnerY: {
          id: 2563,
        },
        round_number: 6,
        event_id: 233,
      },
      {
        partnerX: {
          id: 1645,
        },
        partnerY: {
          id: 2444,
        },
        round_number: 6,
        event_id: 233,
      },
      {
        partnerX: {
          id: 1533,
        },
        partnerY: {
          id: 1617,
        },
        round_number: 6,
        event_id: 233,
      },
      {
        partnerX: {
          id: 1071,
        },
        partnerY: {
          id: 1808,
        },
        round_number: 6,
        event_id: 233,
      },
      {
        partnerX: {
          id: 2808,
        },
        partnerY: {
          id: 8,
        },
        round_number: 6,
        event_id: 233,
      },
      {
        partnerX: {
          id: 2227,
        },
        partnerY: {
          id: 2808,
        },
        round_number: 7,
        event_id: 233,
      },
      {
        partnerX: {
          id: 1645,
        },
        partnerY: {
          id: 2540,
        },
        round_number: 7,
        event_id: 233,
      },
      {
        partnerX: {
          id: 1533,
        },
        partnerY: {
          id: 8,
        },
        round_number: 7,
        event_id: 233,
      },
      {
        partnerX: {
          id: 1071,
        },
        partnerY: {
          id: 319,
        },
        round_number: 7,
        event_id: 233,
      },
      {
        partnerX: {
          id: 115,
        },
        partnerY: {
          id: 591,
        },
        round_number: 7,
        event_id: 233,
      },
      {
        partnerX: {
          id: 1901,
        },
        partnerY: {
          id: 2787,
        },
        round_number: 7,
        event_id: 233,
      },
      {
        partnerX: {
          id: 2552,
        },
        partnerY: {
          id: 2865,
        },
        round_number: 7,
        event_id: 233,
      },
      {
        partnerX: {
          id: 2387,
        },
        partnerY: {
          id: 506,
        },
        round_number: 7,
        event_id: 233,
      },
      {
        partnerX: {
          id: 1808,
        },
        partnerY: {
          id: 2362,
        },
        round_number: 7,
        event_id: 233,
      },
      {
        partnerX: {
          id: 2178,
        },
        partnerY: {
          id: 2382,
        },
        round_number: 7,
        event_id: 233,
      },
      {
        partnerX: {
          id: 2865,
        },
        partnerY: {
          id: 3030,
        },
        round_number: 8,
        event_id: 233,
      },
      {
        partnerX: {
          id: 2227,
        },
        partnerY: {
          id: 2382,
        },
        round_number: 8,
        event_id: 233,
      },
      {
        partnerX: {
          id: 1808,
        },
        partnerY: {
          id: 2387,
        },
        round_number: 8,
        event_id: 233,
      },
      {
        partnerX: {
          id: 1933,
        },
        partnerY: {
          id: 2552,
        },
        round_number: 8,
        event_id: 233,
      },
      {
        partnerX: {
          id: 1533,
        },
        partnerY: {
          id: 2444,
        },
        round_number: 8,
        event_id: 233,
      },
      {
        partnerX: {
          id: 1645,
        },
        partnerY: {
          id: 2787,
        },
        round_number: 8,
        event_id: 233,
      },
      {
        partnerX: {
          id: 1901,
        },
        partnerY: {
          id: 8,
        },
        round_number: 8,
        event_id: 233,
      },
      {
        partnerX: {
          id: 1071,
        },
        partnerY: {
          id: 2808,
        },
        round_number: 8,
        event_id: 233,
      },
      {
        partnerX: {
          id: 2045,
        },
        partnerY: {
          id: 591,
        },
        round_number: 8,
        event_id: 233,
      },
      {
        partnerX: {
          id: 2362,
        },
        partnerY: {
          id: 2552,
        },
        round_number: 9,
        event_id: 233,
      },
      {
        partnerX: {
          id: 2382,
        },
        partnerY: {
          id: 2862,
        },
        round_number: 9,
        event_id: 233,
      },
      {
        partnerX: {
          id: 1808,
        },
        partnerY: {
          id: 3030,
        },
        round_number: 9,
        event_id: 233,
      },
      {
        partnerX: {
          id: 1071,
        },
        partnerY: {
          id: 2045,
        },
        round_number: 9,
        event_id: 233,
      },
      {
        partnerX: {
          id: 2227,
        },
        partnerY: {
          id: 2444,
        },
        round_number: 9,
        event_id: 233,
      },
      {
        partnerX: {
          id: 1533,
        },
        partnerY: {
          id: 506,
        },
        round_number: 9,
        event_id: 233,
      },
      {
        partnerX: {
          id: 2787,
        },
        partnerY: {
          id: 3095,
        },
        round_number: 9,
        event_id: 233,
      },
      {
        partnerX: {
          id: 591,
        },
        partnerY: {
          id: 8,
        },
        round_number: 9,
        event_id: 233,
      },
      {
        partnerX: {
          id: 1617,
        },
        partnerY: {
          id: 2808,
        },
        round_number: 9,
        event_id: 233,
      },
      {
        partnerX: {
          id: 1933,
        },
        partnerY: {
          id: 3091,
        },
        round_number: 9,
        event_id: 233,
      },
      {
        partnerX: {
          id: 2178,
        },
        partnerY: {
          id: 8,
        },
        round_number: 4,
        event_id: 234,
      },
      {
        partnerX: {
          id: 1901,
        },
        partnerY: {
          id: 3076,
        },
        round_number: 1,
        event_id: 234,
      },
      {
        partnerX: {
          id: 2345,
        },
        partnerY: {
          id: 2905,
        },
        round_number: 1,
        event_id: 234,
      },
      {
        partnerX: {
          id: 2816,
        },
        partnerY: {
          id: 319,
        },
        round_number: 1,
        event_id: 234,
      },
      {
        partnerX: {
          id: 1071,
        },
        partnerY: {
          id: 2904,
        },
        round_number: 1,
        event_id: 234,
      },
      {
        partnerX: {
          id: 2178,
        },
        partnerY: {
          id: 2227,
        },
        round_number: 1,
        event_id: 234,
      },
      {
        partnerX: {
          id: 1906,
        },
        partnerY: {
          id: 8,
        },
        round_number: 1,
        event_id: 234,
      },
      {
        partnerX: {
          id: 1071,
        },
        partnerY: {
          id: 2345,
        },
        round_number: 2,
        event_id: 234,
      },
      {
        partnerX: {
          id: 1635,
        },
        partnerY: {
          id: 1906,
        },
        round_number: 2,
        event_id: 234,
      },
      {
        partnerX: {
          id: 2571,
        },
        partnerY: {
          id: 2816,
        },
        round_number: 2,
        event_id: 234,
      },
      {
        partnerX: {
          id: 2905,
        },
        partnerY: {
          id: 8,
        },
        round_number: 2,
        event_id: 234,
      },
      {
        partnerX: {
          id: 2382,
        },
        partnerY: {
          id: 3030,
        },
        round_number: 2,
        event_id: 234,
      },
      {
        partnerX: {
          id: 2227,
        },
        partnerY: {
          id: 3026,
        },
        round_number: 2,
        event_id: 234,
      },
      {
        partnerX: {
          id: 3036,
        },
        partnerY: {
          id: 3086,
        },
        round_number: 2,
        event_id: 234,
      },
      {
        partnerX: {
          id: 1901,
        },
        partnerY: {
          id: 2790,
        },
        round_number: 2,
        event_id: 234,
      },
      {
        partnerX: {
          id: 2178,
        },
        partnerY: {
          id: 2904,
        },
        round_number: 2,
        event_id: 234,
      },
      {
        partnerX: {
          id: 1071,
        },
        partnerY: {
          id: 2816,
        },
        round_number: 5,
        event_id: 234,
      },
      {
        partnerX: {
          id: 2382,
        },
        partnerY: {
          id: 3076,
        },
        round_number: 5,
        event_id: 234,
      },
      {
        partnerX: {
          id: 2227,
        },
        partnerY: {
          id: 3036,
        },
        round_number: 3,
        event_id: 234,
      },
      {
        partnerX: {
          id: 1906,
        },
        partnerY: {
          id: 3076,
        },
        round_number: 3,
        event_id: 234,
      },
      {
        partnerX: {
          id: 2905,
        },
        partnerY: {
          id: 3026,
        },
        round_number: 3,
        event_id: 234,
      },
      {
        partnerX: {
          id: 2571,
        },
        partnerY: {
          id: 3036,
        },
        round_number: 5,
        event_id: 234,
      },
      {
        partnerX: {
          id: 2904,
        },
        partnerY: {
          id: 3026,
        },
        round_number: 5,
        event_id: 234,
      },
      {
        partnerX: {
          id: 1906,
        },
        partnerY: {
          id: 2178,
        },
        round_number: 5,
        event_id: 234,
      },
      {
        partnerX: {
          id: 1071,
        },
        partnerY: {
          id: 2790,
        },
        round_number: 4,
        event_id: 234,
      },
      {
        partnerX: {
          id: 2227,
        },
        partnerY: {
          id: 3086,
        },
        round_number: 4,
        event_id: 234,
      },
      {
        partnerX: {
          id: 1901,
        },
        partnerY: {
          id: 2818,
        },
        round_number: 4,
        event_id: 234,
      },
      {
        partnerX: {
          id: 2571,
        },
        partnerY: {
          id: 2904,
        },
        round_number: 4,
        event_id: 234,
      },
      {
        partnerX: {
          id: 2382,
        },
        partnerY: {
          id: 3026,
        },
        round_number: 4,
        event_id: 234,
      },
      {
        partnerX: {
          id: 1906,
        },
        partnerY: {
          id: 2822,
        },
        round_number: 4,
        event_id: 234,
      },
      {
        partnerX: {
          id: 2816,
        },
        partnerY: {
          id: 2904,
        },
        round_number: 9,
        event_id: 234,
      },
      {
        partnerX: {
          id: 2227,
        },
        partnerY: {
          id: 2816,
        },
        round_number: 6,
        event_id: 234,
      },
      {
        partnerX: {
          id: 1906,
        },
        partnerY: {
          id: 2904,
        },
        round_number: 6,
        event_id: 234,
      },
      {
        partnerX: {
          id: 2345,
        },
        partnerY: {
          id: 8,
        },
        round_number: 6,
        event_id: 234,
      },
      {
        partnerX: {
          id: 2382,
        },
        partnerY: {
          id: 2816,
        },
        round_number: 7,
        event_id: 234,
      },
      {
        partnerX: {
          id: 1071,
        },
        partnerY: {
          id: 2227,
        },
        round_number: 8,
        event_id: 234,
      },
      {
        partnerX: {
          id: 2345,
        },
        partnerY: {
          id: 2571,
        },
        round_number: 7,
        event_id: 234,
      },
      {
        partnerX: {
          id: 2345,
        },
        partnerY: {
          id: 2816,
        },
        round_number: 8,
        event_id: 234,
      },
      {
        partnerX: {
          id: 1901,
        },
        partnerY: {
          id: 2905,
        },
        round_number: 7,
        event_id: 234,
      },
      {
        partnerX: {
          id: 2571,
        },
        partnerY: {
          id: 3076,
        },
        round_number: 9,
        event_id: 234,
      },
      {
        partnerX: {
          id: 2904,
        },
        partnerY: {
          id: 8,
        },
        round_number: 7,
        event_id: 234,
      },
      {
        partnerX: {
          id: 1071,
        },
        partnerY: {
          id: 1906,
        },
        round_number: 7,
        event_id: 234,
      },
      {
        partnerX: {
          id: 1906,
        },
        partnerY: {
          id: 2382,
        },
        round_number: 8,
        event_id: 234,
      },
      {
        partnerX: {
          id: 1901,
        },
        partnerY: {
          id: 2345,
        },
        round_number: 9,
        event_id: 234,
      },
      {
        partnerX: {
          id: 1071,
        },
        partnerY: {
          id: 8,
        },
        round_number: 9,
        event_id: 234,
      },
      {
        partnerX: {
          id: 2157,
        },
        partnerY: {
          id: 2922,
        },
        round_number: 5,
        event_id: 241,
      },
      {
        partnerX: {
          id: 2922,
        },
        partnerY: {
          id: 3216,
        },
        round_number: 3,
        event_id: 241,
      },
      {
        partnerX: {
          id: 2157,
        },
        partnerY: {
          id: 2911,
        },
        round_number: 3,
        event_id: 241,
      },
      {
        partnerX: {
          id: 2123,
        },
        partnerY: {
          id: 2408,
        },
        round_number: 1,
        event_id: 241,
      },
      {
        partnerX: {
          id: 3097,
        },
        partnerY: {
          id: 3215,
        },
        round_number: 3,
        event_id: 241,
      },
      {
        partnerX: {
          id: 2908,
        },
        partnerY: {
          id: 3196,
        },
        round_number: 1,
        event_id: 241,
      },
      {
        partnerX: {
          id: 3168,
        },
        partnerY: {
          id: 3209,
        },
        round_number: 3,
        event_id: 241,
      },
      {
        partnerX: {
          id: 2718,
        },
        partnerY: {
          id: 2721,
        },
        round_number: 1,
        event_id: 241,
      },
      {
        partnerX: {
          id: 3209,
        },
        partnerY: {
          id: 3216,
        },
        round_number: 1,
        event_id: 241,
      },
      {
        partnerX: {
          id: 2123,
        },
        partnerY: {
          id: 2846,
        },
        round_number: 2,
        event_id: 241,
      },
      {
        partnerX: {
          id: 2408,
        },
        partnerY: {
          id: 3216,
        },
        round_number: 2,
        event_id: 241,
      },
      {
        partnerX: {
          id: 2907,
        },
        partnerY: {
          id: 3196,
        },
        round_number: 2,
        event_id: 241,
      },
      {
        partnerX: {
          id: 2911,
        },
        partnerY: {
          id: 2922,
        },
        round_number: 2,
        event_id: 241,
      },
      {
        partnerX: {
          id: 2721,
        },
        partnerY: {
          id: 3213,
        },
        round_number: 2,
        event_id: 241,
      },
      {
        partnerX: {
          id: 3168,
        },
        partnerY: {
          id: 3195,
        },
        round_number: 2,
        event_id: 241,
      },
      {
        partnerX: {
          id: 3195,
        },
        partnerY: {
          id: 3213,
        },
        round_number: 3,
        event_id: 241,
      },
      {
        partnerX: {
          id: 3196,
        },
        partnerY: {
          id: 3217,
        },
        round_number: 3,
        event_id: 241,
      },
      {
        partnerX: {
          id: 2718,
        },
        partnerY: {
          id: 3217,
        },
        round_number: 6,
        event_id: 241,
      },
      {
        partnerX: {
          id: 3195,
        },
        partnerY: {
          id: 3220,
        },
        round_number: 5,
        event_id: 241,
      },
      {
        partnerX: {
          id: 3209,
        },
        partnerY: {
          id: 3217,
        },
        round_number: 4,
        event_id: 241,
      },
      {
        partnerX: {
          id: 2777,
        },
        partnerY: {
          id: 3217,
        },
        round_number: 5,
        event_id: 241,
      },
      {
        partnerX: {
          id: 2907,
        },
        partnerY: {
          id: 3199,
        },
        round_number: 4,
        event_id: 241,
      },
      {
        partnerX: {
          id: 2846,
        },
        partnerY: {
          id: 3097,
        },
        round_number: 4,
        event_id: 241,
      },
      {
        partnerX: {
          id: 2408,
        },
        partnerY: {
          id: 3195,
        },
        round_number: 4,
        event_id: 241,
      },
      {
        partnerX: {
          id: 3168,
        },
        partnerY: {
          id: 3215,
        },
        round_number: 5,
        event_id: 241,
      },
      {
        partnerX: {
          id: 3097,
        },
        partnerY: {
          id: 3213,
        },
        round_number: 5,
        event_id: 241,
      },
      {
        partnerX: {
          id: 2721,
        },
        partnerY: {
          id: 2911,
        },
        round_number: 5,
        event_id: 241,
      },
      {
        partnerX: {
          id: 2908,
        },
        partnerY: {
          id: 3199,
        },
        round_number: 5,
        event_id: 241,
      },
      {
        partnerX: {
          id: 2907,
        },
        partnerY: {
          id: 3209,
        },
        round_number: 5,
        event_id: 241,
      },
      {
        partnerX: {
          id: 2157,
        },
        partnerY: {
          id: 2721,
        },
        round_number: 6,
        event_id: 241,
      },
      {
        partnerX: {
          id: 3199,
        },
        partnerY: {
          id: 3209,
        },
        round_number: 6,
        event_id: 241,
      },
      {
        partnerX: {
          id: 2922,
        },
        partnerY: {
          id: 3195,
        },
        round_number: 6,
        event_id: 241,
      },
      {
        partnerX: {
          id: 3168,
        },
        partnerY: {
          id: 3196,
        },
        round_number: 6,
        event_id: 241,
      },
      {
        partnerX: {
          id: 2811,
        },
        partnerY: {
          id: 3220,
        },
        round_number: 6,
        event_id: 241,
      },
      {
        partnerX: {
          id: 2123,
        },
        partnerY: {
          id: 3216,
        },
        round_number: 7,
        event_id: 241,
      },
      {
        partnerX: {
          id: 2721,
        },
        partnerY: {
          id: 3217,
        },
        round_number: 7,
        event_id: 241,
      },
      {
        partnerX: {
          id: 2408,
        },
        partnerY: {
          id: 3097,
        },
        round_number: 7,
        event_id: 241,
      },
      {
        partnerX: {
          id: 2157,
        },
        partnerY: {
          id: 2846,
        },
        round_number: 7,
        event_id: 241,
      },
      {
        partnerX: {
          id: 2811,
        },
        partnerY: {
          id: 3199,
        },
        round_number: 7,
        event_id: 241,
      },
      {
        partnerX: {
          id: 2721,
        },
        partnerY: {
          id: 2908,
        },
        round_number: 10,
        event_id: 241,
      },
      {
        partnerX: {
          id: 2123,
        },
        partnerY: {
          id: 3215,
        },
        round_number: 10,
        event_id: 241,
      },
      {
        partnerX: {
          id: 2718,
        },
        partnerY: {
          id: 2811,
        },
        round_number: 8,
        event_id: 241,
      },
      {
        partnerX: {
          id: 2721,
        },
        partnerY: {
          id: 3199,
        },
        round_number: 8,
        event_id: 241,
      },
      {
        partnerX: {
          id: 3097,
        },
        partnerY: {
          id: 3217,
        },
        round_number: 8,
        event_id: 241,
      },
      {
        partnerX: {
          id: 2911,
        },
        partnerY: {
          id: 3168,
        },
        round_number: 8,
        event_id: 241,
      },
      {
        partnerX: {
          id: 2846,
        },
        partnerY: {
          id: 3216,
        },
        round_number: 8,
        event_id: 241,
      },
      {
        partnerX: {
          id: 2907,
        },
        partnerY: {
          id: 3168,
        },
        round_number: 10,
        event_id: 241,
      },
      {
        partnerX: {
          id: 2846,
        },
        partnerY: {
          id: 3213,
        },
        round_number: 10,
        event_id: 241,
      },
      {
        partnerX: {
          id: 2408,
        },
        partnerY: {
          id: 3217,
        },
        round_number: 10,
        event_id: 241,
      },
      {
        partnerX: {
          id: 2846,
        },
        partnerY: {
          id: 2907,
        },
        round_number: 9,
        event_id: 241,
      },
      {
        partnerX: {
          id: 3195,
        },
        partnerY: {
          id: 3217,
        },
        round_number: 9,
        event_id: 241,
      },
      {
        partnerX: {
          id: 2721,
        },
        partnerY: {
          id: 3216,
        },
        round_number: 9,
        event_id: 241,
      },
      {
        partnerX: {
          id: 3097,
        },
        partnerY: {
          id: 3209,
        },
        round_number: 9,
        event_id: 241,
      },
      {
        partnerX: {
          id: 3196,
        },
        partnerY: {
          id: 3213,
        },
        round_number: 9,
        event_id: 241,
      },
      {
        partnerX: {
          id: 2408,
        },
        partnerY: {
          id: 2811,
        },
        round_number: 9,
        event_id: 241,
      },
      {
        partnerX: {
          id: 2408,
        },
        partnerY: {
          id: 3215,
        },
        round_number: 13,
        event_id: 241,
      },
      {
        partnerX: {
          id: 2846,
        },
        partnerY: {
          id: 3217,
        },
        round_number: 11,
        event_id: 241,
      },
      {
        partnerX: {
          id: 2123,
        },
        partnerY: {
          id: 2721,
        },
        round_number: 13,
        event_id: 241,
      },
      {
        partnerX: {
          id: 2908,
        },
        partnerY: {
          id: 3213,
        },
        round_number: 11,
        event_id: 241,
      },
      {
        partnerX: {
          id: 3196,
        },
        partnerY: {
          id: 3209,
        },
        round_number: 11,
        event_id: 241,
      },
      {
        partnerX: {
          id: 2123,
        },
        partnerY: {
          id: 2911,
        },
        round_number: 11,
        event_id: 241,
      },
      {
        partnerX: {
          id: 3097,
        },
        partnerY: {
          id: 3195,
        },
        round_number: 12,
        event_id: 241,
      },
      {
        partnerX: {
          id: 2909,
        },
        partnerY: {
          id: 3196,
        },
        round_number: 12,
        event_id: 241,
      },
      {
        partnerX: {
          id: 2408,
        },
        partnerY: {
          id: 3168,
        },
        round_number: 12,
        event_id: 241,
      },
      {
        partnerX: {
          id: 2908,
        },
        partnerY: {
          id: 3209,
        },
        round_number: 12,
        event_id: 241,
      },
      {
        partnerX: {
          id: 3216,
        },
        partnerY: {
          id: 3222,
        },
        round_number: 12,
        event_id: 241,
      },
      {
        partnerX: {
          id: 2922,
        },
        partnerY: {
          id: 3199,
        },
        round_number: 12,
        event_id: 241,
      },
      {
        partnerX: {
          id: 2909,
        },
        partnerY: {
          id: 3216,
        },
        round_number: 13,
        event_id: 241,
      },
      {
        partnerX: {
          id: 3199,
        },
        partnerY: {
          id: 3217,
        },
        round_number: 13,
        event_id: 241,
      },
      {
        partnerX: {
          id: 2911,
        },
        partnerY: {
          id: 3216,
        },
        round_number: 14,
        event_id: 241,
      },
      {
        partnerX: {
          id: 2811,
        },
        partnerY: {
          id: 2846,
        },
        round_number: 14,
        event_id: 241,
      },
      {
        partnerX: {
          id: 2721,
        },
        partnerY: {
          id: 3195,
        },
        round_number: 14,
        event_id: 241,
      },
      {
        partnerX: {
          id: 2811,
        },
        partnerY: {
          id: 3209,
        },
        round_number: 15,
        event_id: 241,
      },
      {
        partnerX: {
          id: 2721,
        },
        partnerY: {
          id: 2907,
        },
        round_number: 15,
        event_id: 241,
      },
      {
        partnerX: {
          id: 2911,
        },
        partnerY: {
          id: 3097,
        },
        round_number: 15,
        event_id: 241,
      },
      {
        partnerX: {
          id: 2123,
        },
        partnerY: {
          id: 2907,
        },
        round_number: 18,
        event_id: 241,
      },
      {
        partnerX: {
          id: 2408,
        },
        partnerY: {
          id: 2846,
        },
        round_number: 15,
        event_id: 241,
      },
      {
        partnerX: {
          id: 3195,
        },
        partnerY: {
          id: 3196,
        },
        round_number: 15,
        event_id: 241,
      },
      {
        partnerX: {
          id: 2846,
        },
        partnerY: {
          id: 3195,
        },
        round_number: 18,
        event_id: 241,
      },
      {
        partnerX: {
          id: 2123,
        },
        partnerY: {
          id: 3097,
        },
        round_number: 16,
        event_id: 241,
      },
      {
        partnerX: {
          id: 2811,
        },
        partnerY: {
          id: 3168,
        },
        round_number: 18,
        event_id: 241,
      },
      {
        partnerX: {
          id: 3195,
        },
        partnerY: {
          id: 3216,
        },
        round_number: 16,
        event_id: 241,
      },
      {
        partnerX: {
          id: 2721,
        },
        partnerY: {
          id: 3196,
        },
        round_number: 16,
        event_id: 241,
      },
      {
        partnerX: {
          id: 2811,
        },
        partnerY: {
          id: 3213,
        },
        round_number: 16,
        event_id: 241,
      },
      {
        partnerX: {
          id: 2909,
        },
        partnerY: {
          id: 3217,
        },
        round_number: 16,
        event_id: 241,
      },
      {
        partnerX: {
          id: 2911,
        },
        partnerY: {
          id: 3209,
        },
        round_number: 16,
        event_id: 241,
      },
      {
        partnerX: {
          id: 2811,
        },
        partnerY: {
          id: 3195,
        },
        round_number: 17,
        event_id: 241,
      },
      {
        partnerX: {
          id: 3215,
        },
        partnerY: {
          id: 3216,
        },
        round_number: 17,
        event_id: 241,
      },
      {
        partnerX: {
          id: 2911,
        },
        partnerY: {
          id: 3213,
        },
        round_number: 17,
        event_id: 241,
      },
      {
        partnerX: {
          id: 2846,
        },
        partnerY: {
          id: 3105,
        },
        round_number: 17,
        event_id: 241,
      },
      {
        partnerX: {
          id: 3168,
        },
        partnerY: {
          id: 3217,
        },
        round_number: 17,
        event_id: 241,
      },
      {
        partnerX: {
          id: 2123,
        },
        partnerY: {
          id: 3105,
        },
        round_number: 19,
        event_id: 241,
      },
      {
        partnerX: {
          id: 2922,
        },
        partnerY: {
          id: 3213,
        },
        round_number: 19,
        event_id: 241,
      },
      {
        partnerX: {
          id: 3215,
        },
        partnerY: {
          id: 3217,
        },
        round_number: 19,
        event_id: 241,
      },
      {
        partnerX: {
          id: 2911,
        },
        partnerY: {
          id: 3195,
        },
        round_number: 19,
        event_id: 241,
      },
      {
        partnerX: {
          id: 2846,
        },
        partnerY: {
          id: 3209,
        },
        round_number: 19,
        event_id: 241,
      },
      {
        partnerX: {
          id: 3199,
        },
        partnerY: {
          id: 3222,
        },
        round_number: 19,
        event_id: 241,
      },
      {
        partnerX: {
          id: 3209,
        },
        partnerY: {
          id: 3213,
        },
        round_number: 18,
        event_id: 241,
      },
      {
        partnerX: {
          id: 2922,
        },
        partnerY: {
          id: 3097,
        },
        round_number: 18,
        event_id: 241,
      },
      {
        partnerX: {
          id: 3199,
        },
        partnerY: {
          id: 3216,
        },
        round_number: 20,
        event_id: 241,
      },
      {
        partnerX: {
          id: 3105,
        },
        partnerY: {
          id: 3215,
        },
        round_number: 20,
        event_id: 241,
      },
      {
        partnerX: {
          id: 2911,
        },
        partnerY: {
          id: 3217,
        },
        round_number: 20,
        event_id: 241,
      },
      {
        partnerX: {
          id: 2926,
        },
        partnerY: {
          id: 3232,
        },
        round_number: 2,
        event_id: 314,
      },
      {
        partnerX: {
          id: 3212,
        },
        partnerY: {
          id: 3261,
        },
        round_number: 1,
        event_id: 304,
      },
      {
        partnerX: {
          id: 3117,
        },
        partnerY: {
          id: 3134,
        },
        round_number: 3,
        event_id: 304,
      },
      {
        partnerX: {
          id: 3268,
        },
        partnerY: {
          id: 3302,
        },
        round_number: 1,
        event_id: 304,
      },
      {
        partnerX: {
          id: 3111,
        },
        partnerY: {
          id: 3189,
        },
        round_number: 1,
        event_id: 304,
      },
      {
        partnerX: {
          id: 3115,
        },
        partnerY: {
          id: 3133,
        },
        round_number: 1,
        event_id: 304,
      },
      {
        partnerX: {
          id: 3246,
        },
        partnerY: {
          id: 3268,
        },
        round_number: 4,
        event_id: 304,
      },
      {
        partnerX: {
          id: 3268,
        },
        partnerY: {
          id: 3272,
        },
        round_number: 3,
        event_id: 304,
      },
      {
        partnerX: {
          id: 3133,
        },
        partnerY: {
          id: 3236,
        },
        round_number: 4,
        event_id: 304,
      },
      {
        partnerX: {
          id: 3212,
        },
        partnerY: {
          id: 3286,
        },
        round_number: 3,
        event_id: 304,
      },
      {
        partnerX: {
          id: 3111,
        },
        partnerY: {
          id: 3119,
        },
        round_number: 2,
        event_id: 304,
      },
      {
        partnerX: {
          id: 3268,
        },
        partnerY: {
          id: 3303,
        },
        round_number: 2,
        event_id: 304,
      },
      {
        partnerX: {
          id: 3128,
        },
        partnerY: {
          id: 3133,
        },
        round_number: 2,
        event_id: 304,
      },
      {
        partnerX: {
          id: 3299,
        },
        partnerY: {
          id: 3302,
        },
        round_number: 2,
        event_id: 304,
      },
      {
        partnerX: {
          id: 3212,
        },
        partnerY: {
          id: 3239,
        },
        round_number: 2,
        event_id: 304,
      },
      {
        partnerX: {
          id: 3113,
        },
        partnerY: {
          id: 3180,
        },
        round_number: 3,
        event_id: 304,
      },
      {
        partnerX: {
          id: 3239,
        },
        partnerY: {
          id: 3302,
        },
        round_number: 3,
        event_id: 304,
      },
      {
        partnerX: {
          id: 3115,
        },
        partnerY: {
          id: 3174,
        },
        round_number: 2,
        event_id: 304,
      },
      {
        partnerX: {
          id: 3113,
        },
        partnerY: {
          id: 3294,
        },
        round_number: 2,
        event_id: 304,
      },
      {
        partnerX: {
          id: 2631,
        },
        partnerY: {
          id: 3286,
        },
        round_number: 2,
        event_id: 304,
      },
      {
        partnerX: {
          id: 3117,
        },
        partnerY: {
          id: 3285,
        },
        round_number: 2,
        event_id: 304,
      },
      {
        partnerX: {
          id: 3134,
        },
        partnerY: {
          id: 3189,
        },
        round_number: 2,
        event_id: 304,
      },
      {
        partnerX: {
          id: 3119,
        },
        partnerY: {
          id: 3261,
        },
        round_number: 3,
        event_id: 304,
      },
      {
        partnerX: {
          id: 3180,
        },
        partnerY: {
          id: 3302,
        },
        round_number: 4,
        event_id: 304,
      },
      {
        partnerX: {
          id: 3128,
        },
        partnerY: {
          id: 3236,
        },
        round_number: 6,
        event_id: 304,
      },
      {
        partnerX: {
          id: 3115,
        },
        partnerY: {
          id: 3299,
        },
        round_number: 3,
        event_id: 304,
      },
      {
        partnerX: {
          id: 3236,
        },
        partnerY: {
          id: 3301,
        },
        round_number: 3,
        event_id: 304,
      },
      {
        partnerX: {
          id: 3128,
        },
        partnerY: {
          id: 3189,
        },
        round_number: 3,
        event_id: 304,
      },
      {
        partnerX: {
          id: 3117,
        },
        partnerY: {
          id: 3128,
        },
        round_number: 5,
        event_id: 304,
      },
      {
        partnerX: {
          id: 3111,
        },
        partnerY: {
          id: 3115,
        },
        round_number: 4,
        event_id: 304,
      },
      {
        partnerX: {
          id: 3133,
        },
        partnerY: {
          id: 3174,
        },
        round_number: 5,
        event_id: 304,
      },
      {
        partnerX: {
          id: 3114,
        },
        partnerY: {
          id: 3299,
        },
        round_number: 4,
        event_id: 304,
      },
      {
        partnerX: {
          id: 3113,
        },
        partnerY: {
          id: 3212,
        },
        round_number: 4,
        event_id: 304,
      },
      {
        partnerX: {
          id: 3179,
        },
        partnerY: {
          id: 3189,
        },
        round_number: 5,
        event_id: 304,
      },
      {
        partnerX: {
          id: 3111,
        },
        partnerY: {
          id: 3113,
        },
        round_number: 5,
        event_id: 304,
      },
      {
        partnerX: {
          id: 3119,
        },
        partnerY: {
          id: 3268,
        },
        round_number: 5,
        event_id: 304,
      },
      {
        partnerX: {
          id: 3173,
        },
        partnerY: {
          id: 3272,
        },
        round_number: 5,
        event_id: 304,
      },
      {
        partnerX: {
          id: 3134,
        },
        partnerY: {
          id: 3285,
        },
        round_number: 5,
        event_id: 304,
      },
      {
        partnerX: {
          id: 3239,
        },
        partnerY: {
          id: 3261,
        },
        round_number: 5,
        event_id: 304,
      },
      {
        partnerX: {
          id: 3115,
        },
        partnerY: {
          id: 3243,
        },
        round_number: 5,
        event_id: 304,
      },
      {
        partnerX: {
          id: 3157,
        },
        partnerY: {
          id: 3286,
        },
        round_number: 5,
        event_id: 304,
      },
      {
        partnerX: {
          id: 3115,
        },
        partnerY: {
          id: 3261,
        },
        round_number: 6,
        event_id: 304,
      },
      {
        partnerX: {
          id: 3114,
        },
        partnerY: {
          id: 3243,
        },
        round_number: 6,
        event_id: 304,
      },
      {
        partnerX: {
          id: 3157,
        },
        partnerY: {
          id: 3239,
        },
        round_number: 6,
        event_id: 304,
      },
      {
        partnerX: {
          id: 3174,
        },
        partnerY: {
          id: 3272,
        },
        round_number: 6,
        event_id: 304,
      },
      {
        partnerX: {
          id: 3180,
        },
        partnerY: {
          id: 3285,
        },
        round_number: 6,
        event_id: 304,
      },
      {
        partnerX: {
          id: 3133,
        },
        partnerY: {
          id: 3173,
        },
        round_number: 6,
        event_id: 304,
      },
      {
        partnerX: {
          id: 3179,
        },
        partnerY: {
          id: 3294,
        },
        round_number: 6,
        event_id: 304,
      },
      {
        partnerX: {
          id: 3236,
        },
        partnerY: {
          id: 3268,
        },
        round_number: 10,
        event_id: 304,
      },
      {
        partnerX: {
          id: 3180,
        },
        partnerY: {
          id: 3268,
        },
        round_number: 9,
        event_id: 304,
      },
      {
        partnerX: {
          id: 3117,
        },
        partnerY: {
          id: 3236,
        },
        round_number: 9,
        event_id: 304,
      },
      {
        partnerX: {
          id: 3119,
        },
        partnerY: {
          id: 3179,
        },
        round_number: 7,
        event_id: 304,
      },
      {
        partnerX: {
          id: 3236,
        },
        partnerY: {
          id: 3272,
        },
        round_number: 7,
        event_id: 304,
      },
      {
        partnerX: {
          id: 3173,
        },
        partnerY: {
          id: 3201,
        },
        round_number: 7,
        event_id: 304,
      },
      {
        partnerX: {
          id: 3285,
        },
        partnerY: {
          id: 3299,
        },
        round_number: 7,
        event_id: 304,
      },
      {
        partnerX: {
          id: 3128,
        },
        partnerY: {
          id: 3302,
        },
        round_number: 7,
        event_id: 304,
      },
      {
        partnerX: {
          id: 2631,
        },
        partnerY: {
          id: 3189,
        },
        round_number: 7,
        event_id: 304,
      },
      {
        partnerX: {
          id: 3180,
        },
        partnerY: {
          id: 3243,
        },
        round_number: 7,
        event_id: 304,
      },
      {
        partnerX: {
          id: 3243,
        },
        partnerY: {
          id: 3246,
        },
        round_number: 9,
        event_id: 304,
      },
      {
        partnerX: {
          id: 3133,
        },
        partnerY: {
          id: 3201,
        },
        round_number: 8,
        event_id: 304,
      },
      {
        partnerX: {
          id: 3286,
        },
        partnerY: {
          id: 3302,
        },
        round_number: 9,
        event_id: 304,
      },
      {
        partnerX: {
          id: 3134,
        },
        partnerY: {
          id: 3268,
        },
        round_number: 8,
        event_id: 304,
      },
      {
        partnerX: {
          id: 3114,
        },
        partnerY: {
          id: 3128,
        },
        round_number: 10,
        event_id: 304,
      },
      {
        partnerX: {
          id: 2631,
        },
        partnerY: {
          id: 3119,
        },
        round_number: 9,
        event_id: 304,
      },
      {
        partnerX: {
          id: 3179,
        },
        partnerY: {
          id: 3253,
        },
        round_number: 8,
        event_id: 304,
      },
      {
        partnerX: {
          id: 3111,
        },
        partnerY: {
          id: 3114,
        },
        round_number: 8,
        event_id: 304,
      },
      {
        partnerX: {
          id: 2631,
        },
        partnerY: {
          id: 3157,
        },
        round_number: 8,
        event_id: 304,
      },
      {
        partnerX: {
          id: 3246,
        },
        partnerY: {
          id: 3302,
        },
        round_number: 8,
        event_id: 304,
      },
      {
        partnerX: {
          id: 3128,
        },
        partnerY: {
          id: 3286,
        },
        round_number: 8,
        event_id: 304,
      },
      {
        partnerX: {
          id: 3189,
        },
        partnerY: {
          id: 3294,
        },
        round_number: 8,
        event_id: 304,
      },
      {
        partnerX: {
          id: 3239,
        },
        partnerY: {
          id: 3272,
        },
        round_number: 9,
        event_id: 304,
      },
      {
        partnerX: {
          id: 3128,
        },
        partnerY: {
          id: 3134,
        },
        round_number: 9,
        event_id: 304,
      },
      {
        partnerX: {
          id: 3261,
        },
        partnerY: {
          id: 3294,
        },
        round_number: 9,
        event_id: 304,
      },
      {
        partnerX: {
          id: 3157,
        },
        partnerY: {
          id: 3272,
        },
        round_number: 10,
        event_id: 304,
      },
      {
        partnerX: {
          id: 3285,
        },
        partnerY: {
          id: 3302,
        },
        round_number: 10,
        event_id: 304,
      },
      {
        partnerX: {
          id: 3189,
        },
        partnerY: {
          id: 3212,
        },
        round_number: 10,
        event_id: 304,
      },
      {
        partnerX: {
          id: 3113,
        },
        partnerY: {
          id: 3243,
        },
        round_number: 10,
        event_id: 304,
      },
      {
        partnerX: {
          id: 3117,
        },
        partnerY: {
          id: 3261,
        },
        round_number: 10,
        event_id: 304,
      },
      {
        partnerX: {
          id: 2631,
        },
        partnerY: {
          id: 3299,
        },
        round_number: 10,
        event_id: 304,
      },
      {
        partnerX: {
          id: 2333,
        },
        partnerY: {
          id: 3317,
        },
        round_number: 1,
        event_id: 316,
      },
      {
        partnerX: {
          id: 2861,
        },
        partnerY: {
          id: 3358,
        },
        round_number: 2,
        event_id: 316,
      },
      {
        partnerX: {
          id: 3361,
        },
        partnerY: {
          id: 3362,
        },
        round_number: 3,
        event_id: 316,
      },
      {
        partnerX: {
          id: 2861,
        },
        partnerY: {
          id: 3317,
        },
        round_number: 3,
        event_id: 316,
      },
      {
        partnerX: {
          id: 3358,
        },
        partnerY: {
          id: 3360,
        },
        round_number: 3,
        event_id: 316,
      },
      {
        partnerX: {
          id: 2861,
        },
        partnerY: {
          id: 3357,
        },
        round_number: 4,
        event_id: 316,
      },
      {
        partnerX: {
          id: 2333,
        },
        partnerY: {
          id: 3362,
        },
        round_number: 4,
        event_id: 316,
      },
      {
        partnerX: {
          id: 2861,
        },
        partnerY: {
          id: 3362,
        },
        round_number: 5,
        event_id: 316,
      },
      {
        partnerX: {
          id: 3037,
        },
        partnerY: {
          id: 3360,
        },
        round_number: 5,
        event_id: 316,
      },
      {
        partnerX: {
          id: 3357,
        },
        partnerY: {
          id: 3358,
        },
        round_number: 6,
        event_id: 316,
      },
      {
        partnerX: {
          id: 3317,
        },
        partnerY: {
          id: 3361,
        },
        round_number: 6,
        event_id: 316,
      },
      {
        partnerX: {
          id: 2861,
        },
        partnerY: {
          id: 3037,
        },
        round_number: 6,
        event_id: 316,
      },
      {
        partnerX: {
          id: 3037,
        },
        partnerY: {
          id: 3317,
        },
        round_number: 8,
        event_id: 316,
      },
      {
        partnerX: {
          id: 2333,
        },
        partnerY: {
          id: 2861,
        },
        round_number: 8,
        event_id: 316,
      },
      {
        partnerX: {
          id: 3360,
        },
        partnerY: {
          id: 3362,
        },
        round_number: 6,
        event_id: 316,
      },
      {
        partnerX: {
          id: 1933,
        },
        partnerY: {
          id: 2650,
        },
        round_number: 2,
        event_id: 293,
      },
      {
        partnerX: {
          id: 12,
        },
        partnerY: {
          id: 2659,
        },
        round_number: 2,
        event_id: 293,
      },
      {
        partnerX: {
          id: 3337,
        },
        partnerY: {
          id: 34,
        },
        round_number: 2,
        event_id: 293,
      },
      {
        partnerX: {
          id: 3317,
        },
        partnerY: {
          id: 3360,
        },
        round_number: 7,
        event_id: 316,
      },
      {
        partnerX: {
          id: 2861,
        },
        partnerY: {
          id: 3361,
        },
        round_number: 7,
        event_id: 316,
      },
      {
        partnerX: {
          id: 2333,
        },
        partnerY: {
          id: 3358,
        },
        round_number: 7,
        event_id: 316,
      },
      {
        partnerX: {
          id: 3321,
        },
        partnerY: {
          id: 513,
        },
        round_number: 2,
        event_id: 293,
      },
      {
        partnerX: {
          id: 3358,
        },
        partnerY: {
          id: 3361,
        },
        round_number: 9,
        event_id: 316,
      },
      {
        partnerX: {
          id: 2333,
        },
        partnerY: {
          id: 3360,
        },
        round_number: 9,
        event_id: 316,
      },
      {
        partnerX: {
          id: 3037,
        },
        partnerY: {
          id: 3357,
        },
        round_number: 9,
        event_id: 316,
      },
      {
        partnerX: {
          id: 3037,
        },
        partnerY: {
          id: 3361,
        },
        round_number: 10,
        event_id: 316,
      },
      {
        partnerX: {
          id: 2247,
        },
        partnerY: {
          id: 3208,
        },
        round_number: 1,
        event_id: 279,
      },
      {
        partnerX: {
          id: 3231,
        },
        partnerY: {
          id: 3334,
        },
        round_number: 1,
        event_id: 279,
      },
      {
        partnerX: {
          id: 1933,
        },
        partnerY: {
          id: 34,
        },
        round_number: 6,
        event_id: 293,
      },
      {
        partnerX: {
          id: 2247,
        },
        partnerY: {
          id: 3231,
        },
        round_number: 2,
        event_id: 279,
      },
      {
        partnerX: {
          id: 12,
        },
        partnerY: {
          id: 2329,
        },
        round_number: 6,
        event_id: 293,
      },
      {
        partnerX: {
          id: 2982,
        },
        partnerY: {
          id: 3208,
        },
        round_number: 2,
        event_id: 279,
      },
      {
        partnerX: {
          id: 3184,
        },
        partnerY: {
          id: 3334,
        },
        round_number: 2,
        event_id: 279,
      },
      {
        partnerX: {
          id: 3289,
        },
        partnerY: {
          id: 3321,
        },
        round_number: 6,
        event_id: 293,
      },
      {
        partnerX: {
          id: 2982,
        },
        partnerY: {
          id: 3231,
        },
        round_number: 3,
        event_id: 279,
      },
      {
        partnerX: {
          id: 2247,
        },
        partnerY: {
          id: 3334,
        },
        round_number: 4,
        event_id: 279,
      },
      {
        partnerX: {
          id: 3321,
        },
        partnerY: {
          id: 3337,
        },
        round_number: 3,
        event_id: 293,
      },
      {
        partnerX: {
          id: 2329,
        },
        partnerY: {
          id: 513,
        },
        round_number: 3,
        event_id: 293,
      },
      {
        partnerX: {
          id: 2861,
        },
        partnerY: {
          id: 3039,
        },
        round_number: 1,
        event_id: 315,
      },
      {
        partnerX: {
          id: 12,
        },
        partnerY: {
          id: 1933,
        },
        round_number: 3,
        event_id: 293,
      },
      {
        partnerX: {
          id: 2333,
        },
        partnerY: {
          id: 2861,
        },
        round_number: 4,
        event_id: 315,
      },
      {
        partnerX: {
          id: 2659,
        },
        partnerY: {
          id: 34,
        },
        round_number: 3,
        event_id: 293,
      },
      {
        partnerX: {
          id: 34,
        },
        partnerY: {
          id: 513,
        },
        round_number: 1,
        event_id: 293,
      },
      {
        partnerX: {
          id: 12,
        },
        partnerY: {
          id: 2650,
        },
        round_number: 1,
        event_id: 293,
      },
      {
        partnerX: {
          id: 2329,
        },
        partnerY: {
          id: 3321,
        },
        round_number: 1,
        event_id: 293,
      },
      {
        partnerX: {
          id: 1933,
        },
        partnerY: {
          id: 3391,
        },
        round_number: 1,
        event_id: 293,
      },
      {
        partnerX: {
          id: 2659,
        },
        partnerY: {
          id: 3337,
        },
        round_number: 4,
        event_id: 293,
      },
      {
        partnerX: {
          id: 1933,
        },
        partnerY: {
          id: 3321,
        },
        round_number: 4,
        event_id: 293,
      },
      {
        partnerX: {
          id: 12,
        },
        partnerY: {
          id: 513,
        },
        round_number: 4,
        event_id: 293,
      },
      {
        partnerX: {
          id: 1933,
        },
        partnerY: {
          id: 3337,
        },
        round_number: 5,
        event_id: 293,
      },
      {
        partnerX: {
          id: 1933,
        },
        partnerY: {
          id: 2329,
        },
        round_number: 7,
        event_id: 293,
      },
      {
        partnerX: {
          id: 2659,
        },
        partnerY: {
          id: 3321,
        },
        round_number: 5,
        event_id: 293,
      },
      {
        partnerX: {
          id: 3337,
        },
        partnerY: {
          id: 513,
        },
        round_number: 7,
        event_id: 293,
      },
      {
        partnerX: {
          id: 2329,
        },
        partnerY: {
          id: 3289,
        },
        round_number: 5,
        event_id: 293,
      },
      {
        partnerX: {
          id: 2659,
        },
        partnerY: {
          id: 3289,
        },
        round_number: 7,
        event_id: 293,
      },
      {
        partnerX: {
          id: 2659,
        },
        partnerY: {
          id: 513,
        },
        round_number: 6,
        event_id: 293,
      },
      {
        partnerX: {
          id: 1933,
        },
        partnerY: {
          id: 2659,
        },
        round_number: 8,
        event_id: 293,
      },
      {
        partnerX: {
          id: 3289,
        },
        partnerY: {
          id: 34,
        },
        round_number: 8,
        event_id: 293,
      },
      {
        partnerX: {
          id: 2329,
        },
        partnerY: {
          id: 3337,
        },
        round_number: 8,
        event_id: 293,
      },
      {
        partnerX: {
          id: 2952,
        },
        partnerY: {
          id: 3410,
        },
        round_number: 1,
        event_id: 257,
      },
      {
        partnerX: {
          id: 2974,
        },
        partnerY: {
          id: 2981,
        },
        round_number: 1,
        event_id: 257,
      },
      {
        partnerX: {
          id: 2939,
        },
        partnerY: {
          id: 3190,
        },
        round_number: 1,
        event_id: 257,
      },
      {
        partnerX: {
          id: 2932,
        },
        partnerY: {
          id: 3409,
        },
        round_number: 1,
        event_id: 257,
      },
      {
        partnerX: {
          id: 3022,
        },
        partnerY: {
          id: 3197,
        },
        round_number: 1,
        event_id: 257,
      },
      {
        partnerX: {
          id: 2951,
        },
        partnerY: {
          id: 3035,
        },
        round_number: 1,
        event_id: 257,
      },
      {
        partnerX: {
          id: 2943,
        },
        partnerY: {
          id: 2977,
        },
        round_number: 1,
        event_id: 257,
      },
      {
        partnerX: {
          id: 3245,
        },
        partnerY: {
          id: 3388,
        },
        round_number: 1,
        event_id: 257,
      },
      {
        partnerX: {
          id: 3191,
        },
        partnerY: {
          id: 3412,
        },
        round_number: 1,
        event_id: 257,
      },
      {
        partnerX: {
          id: 2971,
        },
        partnerY: {
          id: 3089,
        },
        round_number: 1,
        event_id: 257,
      },
      {
        partnerX: {
          id: 2943,
        },
        partnerY: {
          id: 2952,
        },
        round_number: 2,
        event_id: 257,
      },
      {
        partnerX: {
          id: 3102,
        },
        partnerY: {
          id: 3410,
        },
        round_number: 2,
        event_id: 257,
      },
      {
        partnerX: {
          id: 2930,
        },
        partnerY: {
          id: 2941,
        },
        round_number: 2,
        event_id: 257,
      },
      {
        partnerX: {
          id: 3044,
        },
        partnerY: {
          id: 3089,
        },
        round_number: 2,
        event_id: 257,
      },
      {
        partnerX: {
          id: 2971,
        },
        partnerY: {
          id: 3325,
        },
        round_number: 2,
        event_id: 257,
      },
      {
        partnerX: {
          id: 2932,
        },
        partnerY: {
          id: 3190,
        },
        round_number: 2,
        event_id: 257,
      },
      {
        partnerX: {
          id: 2951,
        },
        partnerY: {
          id: 3022,
        },
        round_number: 2,
        event_id: 257,
      },
      {
        partnerX: {
          id: 2974,
        },
        partnerY: {
          id: 2977,
        },
        round_number: 2,
        event_id: 257,
      },
      {
        partnerX: {
          id: 2941,
        },
        partnerY: {
          id: 2986,
        },
        round_number: 1,
        event_id: 257,
      },
      {
        partnerX: {
          id: 2939,
        },
        partnerY: {
          id: 2981,
        },
        round_number: 2,
        event_id: 257,
      },
      {
        partnerX: {
          id: 3100,
        },
        partnerY: {
          id: 3412,
        },
        round_number: 2,
        event_id: 257,
      },
      {
        partnerX: {
          id: 3005,
        },
        partnerY: {
          id: 3388,
        },
        round_number: 2,
        event_id: 257,
      },
      {
        partnerX: {
          id: 3245,
        },
        partnerY: {
          id: 3407,
        },
        round_number: 2,
        event_id: 257,
      },
      {
        partnerX: {
          id: 2988,
        },
        partnerY: {
          id: 3102,
        },
        round_number: 1,
        event_id: 257,
      },
      {
        partnerX: {
          id: 3005,
        },
        partnerY: {
          id: 3022,
        },
        round_number: 3,
        event_id: 257,
      },
      {
        partnerX: {
          id: 2930,
        },
        partnerY: {
          id: 2974,
        },
        round_number: 3,
        event_id: 257,
      },
      {
        partnerX: {
          id: 2932,
        },
        partnerY: {
          id: 3410,
        },
        round_number: 3,
        event_id: 257,
      },
      {
        partnerX: {
          id: 3089,
        },
        partnerY: {
          id: 3412,
        },
        round_number: 3,
        event_id: 257,
      },
      {
        partnerX: {
          id: 2977,
        },
        partnerY: {
          id: 3014,
        },
        round_number: 3,
        event_id: 257,
      },
      {
        partnerX: {
          id: 3044,
        },
        partnerY: {
          id: 3102,
        },
        round_number: 3,
        event_id: 257,
      },
      {
        partnerX: {
          id: 2988,
        },
        partnerY: {
          id: 3325,
        },
        round_number: 3,
        event_id: 257,
      },
      {
        partnerX: {
          id: 2952,
        },
        partnerY: {
          id: 3190,
        },
        round_number: 3,
        event_id: 257,
      },
      {
        partnerX: {
          id: 2999,
        },
        partnerY: {
          id: 3245,
        },
        round_number: 3,
        event_id: 257,
      },
      {
        partnerX: {
          id: 2951,
        },
        partnerY: {
          id: 3191,
        },
        round_number: 3,
        event_id: 257,
      },
      {
        partnerX: {
          id: 3035,
        },
        partnerY: {
          id: 3388,
        },
        round_number: 3,
        event_id: 257,
      },
      {
        partnerX: {
          id: 2971,
        },
        partnerY: {
          id: 3197,
        },
        round_number: 3,
        event_id: 257,
      },
      {
        partnerX: {
          id: 2941,
        },
        partnerY: {
          id: 3421,
        },
        round_number: 3,
        event_id: 257,
      },
      {
        partnerX: {
          id: 2939,
        },
        partnerY: {
          id: 3005,
        },
        round_number: 4,
        event_id: 257,
      },
      {
        partnerX: {
          id: 2941,
        },
        partnerY: {
          id: 2943,
        },
        round_number: 4,
        event_id: 257,
      },
      {
        partnerX: {
          id: 3044,
        },
        partnerY: {
          id: 3421,
        },
        round_number: 4,
        event_id: 257,
      },
      {
        partnerX: {
          id: 2952,
        },
        partnerY: {
          id: 2977,
        },
        round_number: 4,
        event_id: 257,
      },
      {
        partnerX: {
          id: 2951,
        },
        partnerY: {
          id: 2974,
        },
        round_number: 4,
        event_id: 257,
      },
      {
        partnerX: {
          id: 2988,
        },
        partnerY: {
          id: 3022,
        },
        round_number: 4,
        event_id: 257,
      },
      {
        partnerX: {
          id: 3102,
        },
        partnerY: {
          id: 3191,
        },
        round_number: 4,
        event_id: 257,
      },
      {
        partnerX: {
          id: 3089,
        },
        partnerY: {
          id: 3410,
        },
        round_number: 4,
        event_id: 257,
      },
      {
        partnerX: {
          id: 2999,
        },
        partnerY: {
          id: 3409,
        },
        round_number: 4,
        event_id: 257,
      },
      {
        partnerX: {
          id: 2930,
        },
        partnerY: {
          id: 3412,
        },
        round_number: 4,
        event_id: 257,
      },
      {
        partnerX: {
          id: 2932,
        },
        partnerY: {
          id: 3035,
        },
        round_number: 4,
        event_id: 257,
      },
      {
        partnerX: {
          id: 3014,
        },
        partnerY: {
          id: 3402,
        },
        round_number: 4,
        event_id: 257,
      },
      {
        partnerX: {
          id: 2981,
        },
        partnerY: {
          id: 3197,
        },
        round_number: 4,
        event_id: 257,
      },
      {
        partnerX: {
          id: 3044,
        },
        partnerY: {
          id: 3410,
        },
        round_number: 5,
        event_id: 257,
      },
      {
        partnerX: {
          id: 2951,
        },
        partnerY: {
          id: 3421,
        },
        round_number: 5,
        event_id: 257,
      },
      {
        partnerX: {
          id: 2999,
        },
        partnerY: {
          id: 3005,
        },
        round_number: 5,
        event_id: 257,
      },
      {
        partnerX: {
          id: 2932,
        },
        partnerY: {
          id: 3388,
        },
        round_number: 5,
        event_id: 257,
      },
      {
        partnerX: {
          id: 2943,
        },
        partnerY: {
          id: 3022,
        },
        round_number: 5,
        event_id: 257,
      },
      {
        partnerX: {
          id: 2941,
        },
        partnerY: {
          id: 3014,
        },
        round_number: 5,
        event_id: 257,
      },
      {
        partnerX: {
          id: 2952,
        },
        partnerY: {
          id: 3191,
        },
        round_number: 5,
        event_id: 257,
      },
      {
        partnerX: {
          id: 3089,
        },
        partnerY: {
          id: 3407,
        },
        round_number: 5,
        event_id: 257,
      },
      {
        partnerX: {
          id: 2977,
        },
        partnerY: {
          id: 2986,
        },
        round_number: 5,
        event_id: 257,
      },
      {
        partnerX: {
          id: 2988,
        },
        partnerY: {
          id: 3412,
        },
        round_number: 5,
        event_id: 257,
      },
      {
        partnerX: {
          id: 2971,
        },
        partnerY: {
          id: 3409,
        },
        round_number: 5,
        event_id: 257,
      },
      {
        partnerX: {
          id: 2974,
        },
        partnerY: {
          id: 3197,
        },
        round_number: 5,
        event_id: 257,
      },
      {
        partnerX: {
          id: 2930,
        },
        partnerY: {
          id: 2939,
        },
        round_number: 5,
        event_id: 257,
      },
      {
        partnerX: {
          id: 2943,
        },
        partnerY: {
          id: 2951,
        },
        round_number: 6,
        event_id: 257,
      },
      {
        partnerX: {
          id: 2941,
        },
        partnerY: {
          id: 2981,
        },
        round_number: 6,
        event_id: 257,
      },
      {
        partnerX: {
          id: 2939,
        },
        partnerY: {
          id: 2999,
        },
        round_number: 6,
        event_id: 257,
      },
      {
        partnerX: {
          id: 3102,
        },
        partnerY: {
          id: 3407,
        },
        round_number: 6,
        event_id: 257,
      },
      {
        partnerX: {
          id: 2986,
        },
        partnerY: {
          id: 3410,
        },
        round_number: 6,
        event_id: 257,
      },
      {
        partnerX: {
          id: 2932,
        },
        partnerY: {
          id: 2977,
        },
        round_number: 6,
        event_id: 257,
      },
      {
        partnerX: {
          id: 2974,
        },
        partnerY: {
          id: 3388,
        },
        round_number: 6,
        event_id: 257,
      },
      {
        partnerX: {
          id: 3014,
        },
        partnerY: {
          id: 3089,
        },
        round_number: 6,
        event_id: 257,
      },
      {
        partnerX: {
          id: 3044,
        },
        partnerY: {
          id: 3197,
        },
        round_number: 6,
        event_id: 257,
      },
      {
        partnerX: {
          id: 3005,
        },
        partnerY: {
          id: 3409,
        },
        round_number: 6,
        event_id: 257,
      },
      {
        partnerX: {
          id: 2952,
        },
        partnerY: {
          id: 3325,
        },
        round_number: 6,
        event_id: 257,
      },
      {
        partnerX: {
          id: 3035,
        },
        partnerY: {
          id: 3191,
        },
        round_number: 6,
        event_id: 257,
      },
      {
        partnerX: {
          id: 3022,
        },
        partnerY: {
          id: 3245,
        },
        round_number: 6,
        event_id: 257,
      },
      {
        partnerX: {
          id: 2971,
        },
        partnerY: {
          id: 3412,
        },
        round_number: 6,
        event_id: 257,
      },
      {
        partnerX: {
          id: 115,
        },
        partnerY: {
          id: 1901,
        },
        round_number: 1,
        event_id: 294,
      },
      {
        partnerX: {
          id: 12,
        },
        partnerY: {
          id: 2329,
        },
        round_number: 1,
        event_id: 294,
      },
      {
        partnerX: {
          id: 3373,
        },
        partnerY: {
          id: 8,
        },
        round_number: 1,
        event_id: 294,
      },
      {
        partnerX: {
          id: 2920,
        },
        partnerY: {
          id: 34,
        },
        round_number: 1,
        event_id: 294,
      },
      {
        partnerX: {
          id: 506,
        },
        partnerY: {
          id: 590,
        },
        round_number: 1,
        event_id: 294,
      },
      {
        partnerX: {
          id: 115,
        },
        partnerY: {
          id: 506,
        },
        round_number: 2,
        event_id: 294,
      },
      {
        partnerX: {
          id: 1901,
        },
        partnerY: {
          id: 513,
        },
        round_number: 2,
        event_id: 294,
      },
      {
        partnerX: {
          id: 34,
        },
        partnerY: {
          id: 590,
        },
        round_number: 2,
        event_id: 294,
      },
      {
        partnerX: {
          id: 1933,
        },
        partnerY: {
          id: 3425,
        },
        round_number: 2,
        event_id: 294,
      },
      {
        partnerX: {
          id: 2329,
        },
        partnerY: {
          id: 8,
        },
        round_number: 2,
        event_id: 294,
      },
      {
        partnerX: {
          id: 1808,
        },
        partnerY: {
          id: 2178,
        },
        round_number: 2,
        event_id: 294,
      },
      {
        partnerX: {
          id: 2982,
        },
        partnerY: {
          id: 513,
        },
        round_number: 3,
        event_id: 294,
      },
      {
        partnerX: {
          id: 115,
        },
        partnerY: {
          id: 590,
        },
        round_number: 3,
        event_id: 294,
      },
      {
        partnerX: {
          id: 1933,
        },
        partnerY: {
          id: 8,
        },
        round_number: 3,
        event_id: 294,
      },
      {
        partnerX: {
          id: 34,
        },
        partnerY: {
          id: 3425,
        },
        round_number: 3,
        event_id: 294,
      },
      {
        partnerX: {
          id: 12,
        },
        partnerY: {
          id: 1901,
        },
        round_number: 3,
        event_id: 294,
      },
      {
        partnerX: {
          id: 2178,
        },
        partnerY: {
          id: 3228,
        },
        round_number: 3,
        event_id: 294,
      },
      {
        partnerX: {
          id: 2247,
        },
        partnerY: {
          id: 8,
        },
        round_number: 4,
        event_id: 294,
      },
      {
        partnerX: {
          id: 12,
        },
        partnerY: {
          id: 506,
        },
        round_number: 4,
        event_id: 294,
      },
      {
        partnerX: {
          id: 115,
        },
        partnerY: {
          id: 3228,
        },
        round_number: 4,
        event_id: 294,
      },
      {
        partnerX: {
          id: 1808,
        },
        partnerY: {
          id: 2329,
        },
        round_number: 4,
        event_id: 294,
      },
      {
        partnerX: {
          id: 1901,
        },
        partnerY: {
          id: 2982,
        },
        round_number: 4,
        event_id: 294,
      },
      {
        partnerX: {
          id: 1933,
        },
        partnerY: {
          id: 590,
        },
        round_number: 4,
        event_id: 294,
      },
      {
        partnerX: {
          id: 3228,
        },
        partnerY: {
          id: 590,
        },
        round_number: 5,
        event_id: 294,
      },
      {
        partnerX: {
          id: 115,
        },
        partnerY: {
          id: 1808,
        },
        round_number: 5,
        event_id: 294,
      },
      {
        partnerX: {
          id: 1933,
        },
        partnerY: {
          id: 2247,
        },
        round_number: 5,
        event_id: 294,
      },
      {
        partnerX: {
          id: 1901,
        },
        partnerY: {
          id: 506,
        },
        round_number: 5,
        event_id: 294,
      },
      {
        partnerX: {
          id: 2329,
        },
        partnerY: {
          id: 513,
        },
        round_number: 5,
        event_id: 294,
      },
      {
        partnerX: {
          id: 12,
        },
        partnerY: {
          id: 8,
        },
        round_number: 5,
        event_id: 294,
      },
      {
        partnerX: {
          id: 1933,
        },
        partnerY: {
          id: 34,
        },
        round_number: 6,
        event_id: 294,
      },
      {
        partnerX: {
          id: 3425,
        },
        partnerY: {
          id: 8,
        },
        round_number: 6,
        event_id: 294,
      },
      {
        partnerX: {
          id: 115,
        },
        partnerY: {
          id: 2329,
        },
        round_number: 6,
        event_id: 294,
      },
      {
        partnerX: {
          id: 12,
        },
        partnerY: {
          id: 590,
        },
        round_number: 6,
        event_id: 294,
      },
      {
        partnerX: {
          id: 3373,
        },
        partnerY: {
          id: 513,
        },
        round_number: 6,
        event_id: 294,
      },
      {
        partnerX: {
          id: 2247,
        },
        partnerY: {
          id: 506,
        },
        round_number: 6,
        event_id: 294,
      },
      {
        partnerX: {
          id: 1901,
        },
        partnerY: {
          id: 3228,
        },
        round_number: 6,
        event_id: 294,
      },
      {
        partnerX: {
          id: 2178,
        },
        partnerY: {
          id: 2982,
        },
        round_number: 6,
        event_id: 294,
      },
      {
        partnerX: {
          id: 115,
        },
        partnerY: {
          id: 2247,
        },
        round_number: 7,
        event_id: 294,
      },
      {
        partnerX: {
          id: 506,
        },
        partnerY: {
          id: 8,
        },
        round_number: 7,
        event_id: 294,
      },
      {
        partnerX: {
          id: 3373,
        },
        partnerY: {
          id: 590,
        },
        round_number: 7,
        event_id: 294,
      },
      {
        partnerX: {
          id: 1901,
        },
        partnerY: {
          id: 2329,
        },
        round_number: 7,
        event_id: 294,
      },
      {
        partnerX: {
          id: 1808,
        },
        partnerY: {
          id: 3425,
        },
        round_number: 7,
        event_id: 294,
      },
      {
        partnerX: {
          id: 1933,
        },
        partnerY: {
          id: 2982,
        },
        round_number: 7,
        event_id: 294,
      },
      {
        partnerX: {
          id: 3228,
        },
        partnerY: {
          id: 34,
        },
        round_number: 7,
        event_id: 294,
      },
      {
        partnerX: {
          id: 3228,
        },
        partnerY: {
          id: 8,
        },
        round_number: 9,
        event_id: 294,
      },
      {
        partnerX: {
          id: 12,
        },
        partnerY: {
          id: 1933,
        },
        round_number: 9,
        event_id: 294,
      },
      {
        partnerX: {
          id: 3425,
        },
        partnerY: {
          id: 513,
        },
        round_number: 9,
        event_id: 294,
      },
      {
        partnerX: {
          id: 34,
        },
        partnerY: {
          id: 506,
        },
        round_number: 9,
        event_id: 294,
      },
      {
        partnerX: {
          id: 1808,
        },
        partnerY: {
          id: 1901,
        },
        round_number: 9,
        event_id: 294,
      },
      {
        partnerX: {
          id: 12,
        },
        partnerY: {
          id: 513,
        },
        round_number: 7,
        event_id: 294,
      },
      {
        partnerX: {
          id: 2552,
        },
        partnerY: {
          id: 3030,
        },
        round_number: 3,
        event_id: 295,
      },
      {
        partnerX: {
          id: 115,
        },
        partnerY: {
          id: 3373,
        },
        round_number: 8,
        event_id: 294,
      },
      {
        partnerX: {
          id: 12,
        },
        partnerY: {
          id: 3425,
        },
        round_number: 8,
        event_id: 294,
      },
      {
        partnerX: {
          id: 1901,
        },
        partnerY: {
          id: 34,
        },
        round_number: 8,
        event_id: 294,
      },
      {
        partnerX: {
          id: 2247,
        },
        partnerY: {
          id: 2329,
        },
        round_number: 8,
        event_id: 294,
      },
      {
        partnerX: {
          id: 1808,
        },
        partnerY: {
          id: 590,
        },
        round_number: 8,
        event_id: 294,
      },
      {
        partnerX: {
          id: 2178,
        },
        partnerY: {
          id: 506,
        },
        round_number: 8,
        event_id: 294,
      },
      {
        partnerX: {
          id: 1933,
        },
        partnerY: {
          id: 3228,
        },
        round_number: 8,
        event_id: 294,
      },
      {
        partnerX: {
          id: 12,
        },
        partnerY: {
          id: 2227,
        },
        round_number: 1,
        event_id: 295,
      },
      {
        partnerX: {
          id: 2552,
        },
        partnerY: {
          id: 8,
        },
        round_number: 1,
        event_id: 295,
      },
      {
        partnerX: {
          id: 115,
        },
        partnerY: {
          id: 3385,
        },
        round_number: 1,
        event_id: 295,
      },
      {
        partnerX: {
          id: 3227,
        },
        partnerY: {
          id: 3315,
        },
        round_number: 1,
        event_id: 295,
      },
      {
        partnerX: {
          id: 2329,
        },
        partnerY: {
          id: 3030,
        },
        round_number: 1,
        event_id: 295,
      },
      {
        partnerX: {
          id: 1933,
        },
        partnerY: {
          id: 2387,
        },
        round_number: 1,
        event_id: 295,
      },
      {
        partnerX: {
          id: 1933,
        },
        partnerY: {
          id: 8,
        },
        round_number: 2,
        event_id: 295,
      },
      {
        partnerX: {
          id: 115,
        },
        partnerY: {
          id: 2382,
        },
        round_number: 2,
        event_id: 295,
      },
      {
        partnerX: {
          id: 2329,
        },
        partnerY: {
          id: 3385,
        },
        round_number: 2,
        event_id: 295,
      },
      {
        partnerX: {
          id: 12,
        },
        partnerY: {
          id: 3315,
        },
        round_number: 2,
        event_id: 295,
      },
      {
        partnerX: {
          id: 2227,
        },
        partnerY: {
          id: 2552,
        },
        round_number: 2,
        event_id: 295,
      },
      {
        partnerX: {
          id: 2387,
        },
        partnerY: {
          id: 2713,
        },
        round_number: 2,
        event_id: 295,
      },
      {
        partnerX: {
          id: 3187,
        },
        partnerY: {
          id: 3227,
        },
        round_number: 2,
        event_id: 295,
      },
      {
        partnerX: {
          id: 513,
        },
        partnerY: {
          id: 579,
        },
        round_number: 3,
        event_id: 295,
      },
      {
        partnerX: {
          id: 3315,
        },
        partnerY: {
          id: 8,
        },
        round_number: 3,
        event_id: 295,
      },
      {
        partnerX: {
          id: 115,
        },
        partnerY: {
          id: 2329,
        },
        round_number: 3,
        event_id: 295,
      },
      {
        partnerX: {
          id: 1933,
        },
        partnerY: {
          id: 3385,
        },
        round_number: 3,
        event_id: 295,
      },
      {
        partnerX: {
          id: 12,
        },
        partnerY: {
          id: 3187,
        },
        round_number: 3,
        event_id: 295,
      },
      {
        partnerX: {
          id: 2713,
        },
        partnerY: {
          id: 3227,
        },
        round_number: 3,
        event_id: 295,
      },
      {
        partnerX: {
          id: 2382,
        },
        partnerY: {
          id: 2387,
        },
        round_number: 3,
        event_id: 295,
      },
      {
        partnerX: {
          id: 3385,
        },
        partnerY: {
          id: 513,
        },
        round_number: 4,
        event_id: 295,
      },
      {
        partnerX: {
          id: 2329,
        },
        partnerY: {
          id: 2571,
        },
        round_number: 4,
        event_id: 295,
      },
      {
        partnerX: {
          id: 3030,
        },
        partnerY: {
          id: 3315,
        },
        round_number: 4,
        event_id: 295,
      },
      {
        partnerX: {
          id: 1933,
        },
        partnerY: {
          id: 3227,
        },
        round_number: 4,
        event_id: 295,
      },
      {
        partnerX: {
          id: 12,
        },
        partnerY: {
          id: 2552,
        },
        round_number: 4,
        event_id: 295,
      },
      {
        partnerX: {
          id: 3315,
        },
        partnerY: {
          id: 579,
        },
        round_number: 5,
        event_id: 295,
      },
      {
        partnerX: {
          id: 2109,
        },
        partnerY: {
          id: 513,
        },
        round_number: 5,
        event_id: 295,
      },
      {
        partnerX: {
          id: 115,
        },
        partnerY: {
          id: 3227,
        },
        round_number: 5,
        event_id: 295,
      },
      {
        partnerX: {
          id: 2382,
        },
        partnerY: {
          id: 3187,
        },
        round_number: 5,
        event_id: 295,
      },
      {
        partnerX: {
          id: 2552,
        },
        partnerY: {
          id: 2571,
        },
        round_number: 5,
        event_id: 295,
      },
      {
        partnerX: {
          id: 2227,
        },
        partnerY: {
          id: 3385,
        },
        round_number: 5,
        event_id: 295,
      },
      {
        partnerX: {
          id: 12,
        },
        partnerY: {
          id: 2387,
        },
        round_number: 5,
        event_id: 295,
      },
      {
        partnerX: {
          id: 3030,
        },
        partnerY: {
          id: 8,
        },
        round_number: 5,
        event_id: 295,
      },
      {
        partnerX: {
          id: 2227,
        },
        partnerY: {
          id: 3030,
        },
        round_number: 6,
        event_id: 295,
      },
      {
        partnerX: {
          id: 1933,
        },
        partnerY: {
          id: 2713,
        },
        round_number: 6,
        event_id: 295,
      },
      {
        partnerX: {
          id: 3227,
        },
        partnerY: {
          id: 513,
        },
        round_number: 6,
        event_id: 295,
      },
      {
        partnerX: {
          id: 2329,
        },
        partnerY: {
          id: 3315,
        },
        round_number: 6,
        event_id: 295,
      },
      {
        partnerX: {
          id: 12,
        },
        partnerY: {
          id: 579,
        },
        round_number: 6,
        event_id: 295,
      },
      {
        partnerX: {
          id: 115,
        },
        partnerY: {
          id: 2109,
        },
        round_number: 6,
        event_id: 295,
      },
      {
        partnerX: {
          id: 3003,
        },
        partnerY: {
          id: 3324,
        },
        round_number: 1,
        event_id: 258,
      },
      {
        partnerX: {
          id: 3202,
        },
        partnerY: {
          id: 3407,
        },
        round_number: 1,
        event_id: 258,
      },
      {
        partnerX: {
          id: 2994,
        },
        partnerY: {
          id: 3029,
        },
        round_number: 1,
        event_id: 258,
      },
      {
        partnerX: {
          id: 2942,
        },
        partnerY: {
          id: 3140,
        },
        round_number: 1,
        event_id: 258,
      },
      {
        partnerX: {
          id: 2947,
        },
        partnerY: {
          id: 3102,
        },
        round_number: 1,
        event_id: 258,
      },
      {
        partnerX: {
          id: 2939,
        },
        partnerY: {
          id: 2989,
        },
        round_number: 1,
        event_id: 258,
      },
      {
        partnerX: {
          id: 3008,
        },
        partnerY: {
          id: 3108,
        },
        round_number: 1,
        event_id: 258,
      },
      {
        partnerX: {
          id: 2949,
        },
        partnerY: {
          id: 3022,
        },
        round_number: 1,
        event_id: 258,
      },
      {
        partnerX: {
          id: 2981,
        },
        partnerY: {
          id: 2987,
        },
        round_number: 1,
        event_id: 258,
      },
      {
        partnerX: {
          id: 3193,
        },
        partnerY: {
          id: 3412,
        },
        round_number: 1,
        event_id: 258,
      },
      {
        partnerX: {
          id: 3020,
        },
        partnerY: {
          id: 3410,
        },
        round_number: 1,
        event_id: 258,
      },
      {
        partnerX: {
          id: 2977,
        },
        partnerY: {
          id: 3072,
        },
        round_number: 1,
        event_id: 258,
      },
      {
        partnerX: {
          id: 2975,
        },
        partnerY: {
          id: 2998,
        },
        round_number: 1,
        event_id: 258,
      },
      {
        partnerX: {
          id: 3078,
        },
        partnerY: {
          id: 3148,
        },
        round_number: 1,
        event_id: 258,
      },
      {
        partnerX: {
          id: 2961,
        },
        partnerY: {
          id: 3433,
        },
        round_number: 1,
        event_id: 258,
      },
      {
        partnerX: {
          id: 2957,
        },
        partnerY: {
          id: 3169,
        },
        round_number: 1,
        event_id: 258,
      },
      {
        partnerX: {
          id: 2974,
        },
        partnerY: {
          id: 3382,
        },
        round_number: 1,
        event_id: 258,
      },
      {
        partnerX: {
          id: 3033,
        },
        partnerY: {
          id: 3402,
        },
        round_number: 1,
        event_id: 258,
      },
      {
        partnerX: {
          id: 2999,
        },
        partnerY: {
          id: 3313,
        },
        round_number: 1,
        event_id: 258,
      },
      {
        partnerX: {
          id: 2939,
        },
        partnerY: {
          id: 2961,
        },
        round_number: 2,
        event_id: 258,
      },
      {
        partnerX: {
          id: 2997,
        },
        partnerY: {
          id: 3049,
        },
        round_number: 2,
        event_id: 258,
      },
      {
        partnerX: {
          id: 2975,
        },
        partnerY: {
          id: 3003,
        },
        round_number: 2,
        event_id: 258,
      },
      {
        partnerX: {
          id: 2977,
        },
        partnerY: {
          id: 3033,
        },
        round_number: 2,
        event_id: 258,
      },
      {
        partnerX: {
          id: 2981,
        },
        partnerY: {
          id: 3407,
        },
        round_number: 2,
        event_id: 258,
      },
      {
        partnerX: {
          id: 2998,
        },
        partnerY: {
          id: 3022,
        },
        round_number: 2,
        event_id: 258,
      },
      {
        partnerX: {
          id: 2938,
        },
        partnerY: {
          id: 2957,
        },
        round_number: 2,
        event_id: 258,
      },
      {
        partnerX: {
          id: 3020,
        },
        partnerY: {
          id: 3148,
        },
        round_number: 2,
        event_id: 258,
      },
      {
        partnerX: {
          id: 2987,
        },
        partnerY: {
          id: 3435,
        },
        round_number: 2,
        event_id: 258,
      },
      {
        partnerX: {
          id: 2942,
        },
        partnerY: {
          id: 3182,
        },
        round_number: 2,
        event_id: 258,
      },
      {
        partnerX: {
          id: 2928,
        },
        partnerY: {
          id: 3410,
        },
        round_number: 2,
        event_id: 258,
      },
      {
        partnerX: {
          id: 3072,
        },
        partnerY: {
          id: 3169,
        },
        round_number: 2,
        event_id: 258,
      },
      {
        partnerX: {
          id: 2973,
        },
        partnerY: {
          id: 3324,
        },
        round_number: 2,
        event_id: 258,
      },
      {
        partnerX: {
          id: 2972,
        },
        partnerY: {
          id: 3029,
        },
        round_number: 2,
        event_id: 258,
      },
      {
        partnerX: {
          id: 2949,
        },
        partnerY: {
          id: 3434,
        },
        round_number: 2,
        event_id: 258,
      },
      {
        partnerX: {
          id: 3412,
        },
        partnerY: {
          id: 3432,
        },
        round_number: 2,
        event_id: 258,
      },
      {
        partnerX: {
          id: 3008,
        },
        partnerY: {
          id: 3429,
        },
        round_number: 2,
        event_id: 258,
      },
      {
        partnerX: {
          id: 2994,
        },
        partnerY: {
          id: 2996,
        },
        round_number: 2,
        event_id: 258,
      },
      {
        partnerX: {
          id: 3007,
        },
        partnerY: {
          id: 3193,
        },
        round_number: 2,
        event_id: 258,
      },
      {
        partnerX: {
          id: 3313,
        },
        partnerY: {
          id: 3408,
        },
        round_number: 2,
        event_id: 258,
      },
      {
        partnerX: {
          id: 3144,
        },
        partnerY: {
          id: 3159,
        },
        round_number: 2,
        event_id: 258,
      },
      {
        partnerX: {
          id: 2999,
        },
        partnerY: {
          id: 3102,
        },
        round_number: 2,
        event_id: 258,
      },
      {
        partnerX: {
          id: 2960,
        },
        partnerY: {
          id: 3108,
        },
        round_number: 2,
        event_id: 258,
      },
      {
        partnerX: {
          id: 2974,
        },
        partnerY: {
          id: 3081,
        },
        round_number: 2,
        event_id: 258,
      },
      {
        partnerX: {
          id: 3003,
        },
        partnerY: {
          id: 3022,
        },
        round_number: 3,
        event_id: 258,
      },
      {
        partnerX: {
          id: 2928,
        },
        partnerY: {
          id: 3313,
        },
        round_number: 3,
        event_id: 258,
      },
      {
        partnerX: {
          id: 3144,
        },
        partnerY: {
          id: 3410,
        },
        round_number: 3,
        event_id: 258,
      },
      {
        partnerX: {
          id: 2942,
        },
        partnerY: {
          id: 2960,
        },
        round_number: 3,
        event_id: 258,
      },
      {
        partnerX: {
          id: 2938,
        },
        partnerY: {
          id: 3049,
        },
        round_number: 3,
        event_id: 258,
      },
      {
        partnerX: {
          id: 3102,
        },
        partnerY: {
          id: 3159,
        },
        round_number: 3,
        event_id: 258,
      },
      {
        partnerX: {
          id: 2973,
        },
        partnerY: {
          id: 3407,
        },
        round_number: 3,
        event_id: 258,
      },
      {
        partnerX: {
          id: 2961,
        },
        partnerY: {
          id: 2981,
        },
        round_number: 3,
        event_id: 258,
      },
      {
        partnerX: {
          id: 3202,
        },
        partnerY: {
          id: 3347,
        },
        round_number: 2,
        event_id: 258,
      },
      {
        partnerX: {
          id: 2957,
        },
        partnerY: {
          id: 3182,
        },
        round_number: 3,
        event_id: 258,
      },
      {
        partnerX: {
          id: 3029,
        },
        partnerY: {
          id: 3347,
        },
        round_number: 3,
        event_id: 258,
      },
      {
        partnerX: {
          id: 2987,
        },
        partnerY: {
          id: 3169,
        },
        round_number: 3,
        event_id: 258,
      },
      {
        partnerX: {
          id: 3412,
        },
        partnerY: {
          id: 3433,
        },
        round_number: 5,
        event_id: 258,
      },
      {
        partnerX: {
          id: 3347,
        },
        partnerY: {
          id: 3407,
        },
        round_number: 5,
        event_id: 258,
      },
      {
        partnerX: {
          id: 2957,
        },
        partnerY: {
          id: 3313,
        },
        round_number: 5,
        event_id: 258,
      },
      {
        partnerX: {
          id: 3033,
        },
        partnerY: {
          id: 3193,
        },
        round_number: 5,
        event_id: 258,
      },
      {
        partnerX: {
          id: 3382,
        },
        partnerY: {
          id: 3408,
        },
        round_number: 5,
        event_id: 258,
      },
      {
        partnerX: {
          id: 2949,
        },
        partnerY: {
          id: 2961,
        },
        round_number: 5,
        event_id: 258,
      },
      {
        partnerX: {
          id: 2960,
        },
        partnerY: {
          id: 3008,
        },
        round_number: 5,
        event_id: 258,
      },
      {
        partnerX: {
          id: 3022,
        },
        partnerY: {
          id: 3202,
        },
        round_number: 5,
        event_id: 258,
      },
      {
        partnerX: {
          id: 3072,
        },
        partnerY: {
          id: 3108,
        },
        round_number: 5,
        event_id: 258,
      },
      {
        partnerX: {
          id: 2972,
        },
        partnerY: {
          id: 3102,
        },
        round_number: 5,
        event_id: 258,
      },
      {
        partnerX: {
          id: 2977,
        },
        partnerY: {
          id: 3020,
        },
        round_number: 5,
        event_id: 258,
      },
      {
        partnerX: {
          id: 3144,
        },
        partnerY: {
          id: 3402,
        },
        round_number: 5,
        event_id: 258,
      },
      {
        partnerX: {
          id: 2942,
        },
        partnerY: {
          id: 3003,
        },
        round_number: 5,
        event_id: 258,
      },
      {
        partnerX: {
          id: 2996,
        },
        partnerY: {
          id: 2997,
        },
        round_number: 5,
        event_id: 258,
      },
      {
        partnerX: {
          id: 2947,
        },
        partnerY: {
          id: 3434,
        },
        round_number: 5,
        event_id: 258,
      },
      {
        partnerX: {
          id: 2998,
        },
        partnerY: {
          id: 3140,
        },
        round_number: 5,
        event_id: 258,
      },
      {
        partnerX: {
          id: 2938,
        },
        partnerY: {
          id: 2994,
        },
        round_number: 5,
        event_id: 258,
      },
      {
        partnerX: {
          id: 3029,
        },
        partnerY: {
          id: 3410,
        },
        round_number: 5,
        event_id: 258,
      },
      {
        partnerX: {
          id: 2973,
        },
        partnerY: {
          id: 3049,
        },
        round_number: 5,
        event_id: 258,
      },
      {
        partnerX: {
          id: 2977,
        },
        partnerY: {
          id: 3434,
        },
        round_number: 3,
        event_id: 258,
      },
      {
        partnerX: {
          id: 3033,
        },
        partnerY: {
          id: 3081,
        },
        round_number: 3,
        event_id: 258,
      },
      {
        partnerX: {
          id: 2972,
        },
        partnerY: {
          id: 3072,
        },
        round_number: 3,
        event_id: 258,
      },
      {
        partnerX: {
          id: 3148,
        },
        partnerY: {
          id: 3324,
        },
        round_number: 3,
        event_id: 258,
      },
      {
        partnerX: {
          id: 3408,
        },
        partnerY: {
          id: 3435,
        },
        round_number: 3,
        event_id: 258,
      },
      {
        partnerX: {
          id: 2974,
        },
        partnerY: {
          id: 3412,
        },
        round_number: 3,
        event_id: 258,
      },
      {
        partnerX: {
          id: 2942,
        },
        partnerY: {
          id: 3407,
        },
        round_number: 6,
        event_id: 258,
      },
      {
        partnerX: {
          id: 2949,
        },
        partnerY: {
          id: 3078,
        },
        round_number: 6,
        event_id: 258,
      },
      {
        partnerX: {
          id: 2928,
        },
        partnerY: {
          id: 3033,
        },
        round_number: 6,
        event_id: 258,
      },
      {
        partnerX: {
          id: 2987,
        },
        partnerY: {
          id: 3022,
        },
        round_number: 6,
        event_id: 258,
      },
      {
        partnerX: {
          id: 2938,
        },
        partnerY: {
          id: 2947,
        },
        round_number: 6,
        event_id: 258,
      },
      {
        partnerX: {
          id: 3008,
        },
        partnerY: {
          id: 3072,
        },
        round_number: 6,
        event_id: 258,
      },
      {
        partnerX: {
          id: 2961,
        },
        partnerY: {
          id: 2994,
        },
        round_number: 6,
        event_id: 258,
      },
      {
        partnerX: {
          id: 2977,
        },
        partnerY: {
          id: 3313,
        },
        round_number: 6,
        event_id: 258,
      },
      {
        partnerX: {
          id: 2997,
        },
        partnerY: {
          id: 3435,
        },
        round_number: 6,
        event_id: 258,
      },
      {
        partnerX: {
          id: 3081,
        },
        partnerY: {
          id: 3169,
        },
        round_number: 6,
        event_id: 258,
      },
      {
        partnerX: {
          id: 3003,
        },
        partnerY: {
          id: 3140,
        },
        round_number: 6,
        event_id: 258,
      },
      {
        partnerX: {
          id: 2981,
        },
        partnerY: {
          id: 3324,
        },
        round_number: 6,
        event_id: 258,
      },
      {
        partnerX: {
          id: 2939,
        },
        partnerY: {
          id: 2972,
        },
        round_number: 6,
        event_id: 258,
      },
      {
        partnerX: {
          id: 3029,
        },
        partnerY: {
          id: 3108,
        },
        round_number: 6,
        event_id: 258,
      },
      {
        partnerX: {
          id: 3020,
        },
        partnerY: {
          id: 3347,
        },
        round_number: 6,
        event_id: 258,
      },
      {
        partnerX: {
          id: 3049,
        },
        partnerY: {
          id: 3102,
        },
        round_number: 6,
        event_id: 258,
      },
      {
        partnerX: {
          id: 3410,
        },
        partnerY: {
          id: 3433,
        },
        round_number: 6,
        event_id: 258,
      },
      {
        partnerX: {
          id: 2960,
        },
        partnerY: {
          id: 3434,
        },
        round_number: 6,
        event_id: 258,
      },
      {
        partnerX: {
          id: 3159,
        },
        partnerY: {
          id: 3202,
        },
        round_number: 6,
        event_id: 258,
      },
      {
        partnerX: {
          id: 3193,
        },
        partnerY: {
          id: 3402,
        },
        round_number: 6,
        event_id: 258,
      },
      {
        partnerX: {
          id: 2999,
        },
        partnerY: {
          id: 3408,
        },
        round_number: 6,
        event_id: 258,
      },
      {
        partnerX: {
          id: 2939,
        },
        partnerY: {
          id: 3438,
        },
        round_number: 3,
        event_id: 258,
      },
      {
        partnerX: {
          id: 2999,
        },
        partnerY: {
          id: 3108,
        },
        round_number: 3,
        event_id: 258,
      },
      {
        partnerX: {
          id: 2994,
        },
        partnerY: {
          id: 3429,
        },
        round_number: 3,
        event_id: 258,
      },
      {
        partnerX: {
          id: 2949,
        },
        partnerY: {
          id: 3193,
        },
        round_number: 3,
        event_id: 258,
      },
      {
        partnerX: {
          id: 2997,
        },
        partnerY: {
          id: 2999,
        },
        round_number: 4,
        event_id: 258,
      },
      {
        partnerX: {
          id: 3049,
        },
        partnerY: {
          id: 3159,
        },
        round_number: 4,
        event_id: 258,
      },
      {
        partnerX: {
          id: 3020,
        },
        partnerY: {
          id: 3072,
        },
        round_number: 4,
        event_id: 258,
      },
      {
        partnerX: {
          id: 3347,
        },
        partnerY: {
          id: 3412,
        },
        round_number: 4,
        event_id: 258,
      },
      {
        partnerX: {
          id: 2938,
        },
        partnerY: {
          id: 2987,
        },
        round_number: 4,
        event_id: 258,
      },
      {
        partnerX: {
          id: 3182,
        },
        partnerY: {
          id: 3193,
        },
        round_number: 4,
        event_id: 258,
      },
      {
        partnerX: {
          id: 3407,
        },
        partnerY: {
          id: 3435,
        },
        round_number: 4,
        event_id: 258,
      },
      {
        partnerX: {
          id: 3078,
        },
        partnerY: {
          id: 3102,
        },
        round_number: 4,
        event_id: 258,
      },
      {
        partnerX: {
          id: 3324,
        },
        partnerY: {
          id: 3402,
        },
        round_number: 4,
        event_id: 258,
      },
      {
        partnerX: {
          id: 3144,
        },
        partnerY: {
          id: 3313,
        },
        round_number: 4,
        event_id: 258,
      },
      {
        partnerX: {
          id: 2989,
        },
        partnerY: {
          id: 3022,
        },
        round_number: 4,
        event_id: 258,
      },
      {
        partnerX: {
          id: 2949,
        },
        partnerY: {
          id: 3169,
        },
        round_number: 4,
        event_id: 258,
      },
      {
        partnerX: {
          id: 3081,
        },
        partnerY: {
          id: 3148,
        },
        round_number: 4,
        event_id: 258,
      },
      {
        partnerX: {
          id: 3202,
        },
        partnerY: {
          id: 3408,
        },
        round_number: 4,
        event_id: 258,
      },
      {
        partnerX: {
          id: 2981,
        },
        partnerY: {
          id: 3003,
        },
        round_number: 4,
        event_id: 258,
      },
      {
        partnerX: {
          id: 2947,
        },
        partnerY: {
          id: 2977,
        },
        round_number: 4,
        event_id: 258,
      },
      {
        partnerX: {
          id: 2942,
        },
        partnerY: {
          id: 2975,
        },
        round_number: 4,
        event_id: 258,
      },
      {
        partnerX: {
          id: 2973,
        },
        partnerY: {
          id: 3140,
        },
        round_number: 4,
        event_id: 258,
      },
      {
        partnerX: {
          id: 2939,
        },
        partnerY: {
          id: 3433,
        },
        round_number: 4,
        event_id: 258,
      },
      {
        partnerX: {
          id: 2928,
        },
        partnerY: {
          id: 3029,
        },
        round_number: 4,
        event_id: 258,
      },
      {
        partnerX: {
          id: 1933,
        },
        partnerY: {
          id: 2571,
        },
        round_number: 1,
        event_id: 296,
      },
      {
        partnerX: {
          id: 12,
        },
        partnerY: {
          id: 3333,
        },
        round_number: 1,
        event_id: 296,
      },
      {
        partnerX: {
          id: 2382,
        },
        partnerY: {
          id: 3400,
        },
        round_number: 1,
        event_id: 296,
      },
      {
        partnerX: {
          id: 115,
        },
        partnerY: {
          id: 3349,
        },
        round_number: 1,
        event_id: 296,
      },
      {
        partnerX: {
          id: 2345,
        },
        partnerY: {
          id: 2883,
        },
        round_number: 1,
        event_id: 296,
      },
      {
        partnerX: {
          id: 115,
        },
        partnerY: {
          id: 1933,
        },
        round_number: 2,
        event_id: 296,
      },
      {
        partnerX: {
          id: 2227,
        },
        partnerY: {
          id: 3030,
        },
        round_number: 2,
        event_id: 296,
      },
      {
        partnerX: {
          id: 2345,
        },
        partnerY: {
          id: 3156,
        },
        round_number: 2,
        event_id: 296,
      },
      {
        partnerX: {
          id: 2883,
        },
        partnerY: {
          id: 8,
        },
        round_number: 2,
        event_id: 296,
      },
      {
        partnerX: {
          id: 1901,
        },
        partnerY: {
          id: 3400,
        },
        round_number: 2,
        event_id: 296,
      },
      {
        partnerX: {
          id: 2152,
        },
        partnerY: {
          id: 2382,
        },
        round_number: 2,
        event_id: 296,
      },
      {
        partnerX: {
          id: 2220,
        },
        partnerY: {
          id: 2571,
        },
        round_number: 2,
        event_id: 296,
      },
      {
        partnerX: {
          id: 1933,
        },
        partnerY: {
          id: 3340,
        },
        round_number: 3,
        event_id: 296,
      },
      {
        partnerX: {
          id: 115,
        },
        partnerY: {
          id: 2152,
        },
        round_number: 3,
        event_id: 296,
      },
      {
        partnerX: {
          id: 2220,
        },
        partnerY: {
          id: 3030,
        },
        round_number: 3,
        event_id: 296,
      },
      {
        partnerX: {
          id: 12,
        },
        partnerY: {
          id: 2382,
        },
        round_number: 3,
        event_id: 296,
      },
      {
        partnerX: {
          id: 2345,
        },
        partnerY: {
          id: 8,
        },
        round_number: 3,
        event_id: 296,
      },
      {
        partnerX: {
          id: 2227,
        },
        partnerY: {
          id: 2883,
        },
        round_number: 3,
        event_id: 296,
      },
      {
        partnerX: {
          id: 2152,
        },
        partnerY: {
          id: 3156,
        },
        round_number: 4,
        event_id: 296,
      },
      {
        partnerX: {
          id: 1906,
        },
        partnerY: {
          id: 3030,
        },
        round_number: 4,
        event_id: 296,
      },
      {
        partnerX: {
          id: 115,
        },
        partnerY: {
          id: 2220,
        },
        round_number: 4,
        event_id: 296,
      },
      {
        partnerX: {
          id: 2382,
        },
        partnerY: {
          id: 3333,
        },
        round_number: 4,
        event_id: 296,
      },
      {
        partnerX: {
          id: 12,
        },
        partnerY: {
          id: 8,
        },
        round_number: 4,
        event_id: 296,
      },
      {
        partnerX: {
          id: 2657,
        },
        partnerY: {
          id: 2883,
        },
        round_number: 4,
        event_id: 296,
      },
      {
        partnerX: {
          id: 1901,
        },
        partnerY: {
          id: 1933,
        },
        round_number: 4,
        event_id: 296,
      },
      {
        partnerX: {
          id: 2345,
        },
        partnerY: {
          id: 2571,
        },
        round_number: 4,
        event_id: 296,
      },
      {
        partnerX: {
          id: 2227,
        },
        partnerY: {
          id: 3333,
        },
        round_number: 5,
        event_id: 296,
      },
      {
        partnerX: {
          id: 115,
        },
        partnerY: {
          id: 12,
        },
        round_number: 5,
        event_id: 296,
      },
      {
        partnerX: {
          id: 1933,
        },
        partnerY: {
          id: 2345,
        },
        round_number: 5,
        event_id: 296,
      },
      {
        partnerX: {
          id: 2152,
        },
        partnerY: {
          id: 3030,
        },
        round_number: 5,
        event_id: 296,
      },
      {
        partnerX: {
          id: 1901,
        },
        partnerY: {
          id: 2883,
        },
        round_number: 5,
        event_id: 296,
      },
      {
        partnerX: {
          id: 2657,
        },
        partnerY: {
          id: 8,
        },
        round_number: 5,
        event_id: 296,
      },
      {
        partnerX: {
          id: 1906,
        },
        partnerY: {
          id: 2220,
        },
        round_number: 5,
        event_id: 296,
      },
      {
        partnerX: {
          id: 2382,
        },
        partnerY: {
          id: 2883,
        },
        round_number: 6,
        event_id: 296,
      },
      {
        partnerX: {
          id: 2152,
        },
        partnerY: {
          id: 2571,
        },
        round_number: 6,
        event_id: 296,
      },
      {
        partnerX: {
          id: 1933,
        },
        partnerY: {
          id: 2220,
        },
        round_number: 6,
        event_id: 296,
      },
      {
        partnerX: {
          id: 1906,
        },
        partnerY: {
          id: 2345,
        },
        round_number: 6,
        event_id: 296,
      },
      {
        partnerX: {
          id: 3030,
        },
        partnerY: {
          id: 8,
        },
        round_number: 6,
        event_id: 296,
      },
      {
        partnerX: {
          id: 115,
        },
        partnerY: {
          id: 2227,
        },
        round_number: 6,
        event_id: 296,
      },
      {
        partnerX: {
          id: 2657,
        },
        partnerY: {
          id: 3400,
        },
        round_number: 6,
        event_id: 296,
      },
      {
        partnerX: {
          id: 1901,
        },
        partnerY: {
          id: 3156,
        },
        round_number: 6,
        event_id: 296,
      },
      {
        partnerX: {
          id: 2345,
        },
        partnerY: {
          id: 3030,
        },
        round_number: 7,
        event_id: 296,
      },
      {
        partnerX: {
          id: 1906,
        },
        partnerY: {
          id: 2227,
        },
        round_number: 7,
        event_id: 296,
      },
      {
        partnerX: {
          id: 2152,
        },
        partnerY: {
          id: 3400,
        },
        round_number: 7,
        event_id: 296,
      },
      {
        partnerX: {
          id: 2571,
        },
        partnerY: {
          id: 3333,
        },
        round_number: 7,
        event_id: 296,
      },
      {
        partnerX: {
          id: 12,
        },
        partnerY: {
          id: 1933,
        },
        round_number: 7,
        event_id: 296,
      },
      {
        partnerX: {
          id: 2227,
        },
        partnerY: {
          id: 2571,
        },
        round_number: 8,
        event_id: 296,
      },
      {
        partnerX: {
          id: 12,
        },
        partnerY: {
          id: 2883,
        },
        round_number: 8,
        event_id: 296,
      },
      {
        partnerX: {
          id: 3030,
        },
        partnerY: {
          id: 3333,
        },
        round_number: 8,
        event_id: 296,
      },
      {
        partnerX: {
          id: 1933,
        },
        partnerY: {
          id: 2657,
        },
        round_number: 8,
        event_id: 296,
      },
      {
        partnerX: {
          id: 2152,
        },
        partnerY: {
          id: 2220,
        },
        round_number: 8,
        event_id: 296,
      },
      {
        partnerX: {
          id: 3156,
        },
        partnerY: {
          id: 8,
        },
        round_number: 8,
        event_id: 296,
      },
      {
        partnerX: {
          id: 115,
        },
        partnerY: {
          id: 3156,
        },
        round_number: 9,
        event_id: 296,
      },
      {
        partnerX: {
          id: 506,
        },
        partnerY: {
          id: 8,
        },
        round_number: 1,
        event_id: 346,
      },
      {
        partnerX: {
          id: 2567,
        },
        partnerY: {
          id: 513,
        },
        round_number: 1,
        event_id: 346,
      },
      {
        partnerX: {
          id: 115,
        },
        partnerY: {
          id: 12,
        },
        round_number: 1,
        event_id: 346,
      },
      {
        partnerX: {
          id: 2571,
        },
        partnerY: {
          id: 3030,
        },
        round_number: 9,
        event_id: 296,
      },
      {
        partnerX: {
          id: 1933,
        },
        partnerY: {
          id: 2227,
        },
        round_number: 9,
        event_id: 296,
      },
      {
        partnerX: {
          id: 3333,
        },
        partnerY: {
          id: 3400,
        },
        round_number: 9,
        event_id: 296,
      },
      {
        partnerX: {
          id: 2220,
        },
        partnerY: {
          id: 319,
        },
        round_number: 9,
        event_id: 296,
      },
      {
        partnerX: {
          id: 1906,
        },
        partnerY: {
          id: 2883,
        },
        round_number: 9,
        event_id: 296,
      },
      {
        partnerX: {
          id: 2345,
        },
        partnerY: {
          id: 2657,
        },
        round_number: 9,
        event_id: 296,
      },
      {
        partnerX: {
          id: 3447,
        },
        partnerY: {
          id: 3449,
        },
        round_number: 1,
        event_id: 310,
      },
      {
        partnerX: {
          id: 1293,
        },
        partnerY: {
          id: 3447,
        },
        round_number: 2,
        event_id: 310,
      },
      {
        partnerX: {
          id: 3393,
        },
        partnerY: {
          id: 3450,
        },
        round_number: 2,
        event_id: 310,
      },
      {
        partnerX: {
          id: 3091,
        },
        partnerY: {
          id: 513,
        },
        round_number: 2,
        event_id: 346,
      },
      {
        partnerX: {
          id: 3393,
        },
        partnerY: {
          id: 3449,
        },
        round_number: 3,
        event_id: 310,
      },
      {
        partnerX: {
          id: 2247,
        },
        partnerY: {
          id: 2329,
        },
        round_number: 5,
        event_id: 312,
      },
      {
        partnerX: {
          id: 115,
        },
        partnerY: {
          id: 2567,
        },
        round_number: 2,
        event_id: 346,
      },
      {
        partnerX: {
          id: 3393,
        },
        partnerY: {
          id: 3447,
        },
        round_number: 4,
        event_id: 310,
      },
      {
        partnerX: {
          id: 1293,
        },
        partnerY: {
          id: 3449,
        },
        round_number: 4,
        event_id: 310,
      },
      {
        partnerX: {
          id: 12,
        },
        partnerY: {
          id: 8,
        },
        round_number: 2,
        event_id: 346,
      },
      {
        partnerX: {
          id: 3449,
        },
        partnerY: {
          id: 3453,
        },
        round_number: 5,
        event_id: 310,
      },
      {
        partnerX: {
          id: 3449,
        },
        partnerY: {
          id: 3450,
        },
        round_number: 6,
        event_id: 310,
      },
      {
        partnerX: {
          id: 3393,
        },
        partnerY: {
          id: 3453,
        },
        round_number: 6,
        event_id: 310,
      },
      {
        partnerX: {
          id: 1933,
        },
        partnerY: {
          id: 2247,
        },
        round_number: 1,
        event_id: 312,
      },
      {
        partnerX: {
          id: 2170,
        },
        partnerY: {
          id: 3468,
        },
        round_number: 3,
        event_id: 347,
      },
      {
        partnerX: {
          id: 12,
        },
        partnerY: {
          id: 513,
        },
        round_number: 3,
        event_id: 346,
      },
      {
        partnerX: {
          id: 2567,
        },
        partnerY: {
          id: 8,
        },
        round_number: 3,
        event_id: 346,
      },
      {
        partnerX: {
          id: 3091,
        },
        partnerY: {
          id: 506,
        },
        round_number: 3,
        event_id: 346,
      },
      {
        partnerX: {
          id: 2178,
        },
        partnerY: {
          id: 2247,
        },
        round_number: 2,
        event_id: 312,
      },
      {
        partnerX: {
          id: 115,
        },
        partnerY: {
          id: 3091,
        },
        round_number: 4,
        event_id: 346,
      },
      {
        partnerX: {
          id: 12,
        },
        partnerY: {
          id: 506,
        },
        round_number: 4,
        event_id: 346,
      },
      {
        partnerX: {
          id: 513,
        },
        partnerY: {
          id: 8,
        },
        round_number: 4,
        event_id: 346,
      },
      {
        partnerX: {
          id: 115,
        },
        partnerY: {
          id: 513,
        },
        round_number: 5,
        event_id: 346,
      },
      {
        partnerX: {
          id: 12,
        },
        partnerY: {
          id: 3091,
        },
        round_number: 5,
        event_id: 346,
      },
      {
        partnerX: {
          id: 2567,
        },
        partnerY: {
          id: 506,
        },
        round_number: 5,
        event_id: 346,
      },
      {
        partnerX: {
          id: 3091,
        },
        partnerY: {
          id: 8,
        },
        round_number: 6,
        event_id: 346,
      },
      {
        partnerX: {
          id: 115,
        },
        partnerY: {
          id: 506,
        },
        round_number: 6,
        event_id: 346,
      },
      {
        partnerX: {
          id: 12,
        },
        partnerY: {
          id: 2567,
        },
        round_number: 6,
        event_id: 346,
      },
      {
        partnerX: {
          id: 1933,
        },
        partnerY: {
          id: 2178,
        },
        round_number: 4,
        event_id: 312,
      },
      {
        partnerX: {
          id: 2920,
        },
        partnerY: {
          id: 3404,
        },
        round_number: 2,
        event_id: 338,
      },
      {
        partnerX: {
          id: 2169,
        },
        partnerY: {
          id: 2170,
        },
        round_number: 2,
        event_id: 347,
      },
      {
        partnerX: {
          id: 2169,
        },
        partnerY: {
          id: 2171,
        },
        round_number: 3,
        event_id: 347,
      },
      {
        partnerX: {
          id: 2170,
        },
        partnerY: {
          id: 2171,
        },
        round_number: 1,
        event_id: 347,
      },
      {
        partnerX: {
          id: 3468,
        },
        partnerY: {
          id: 3469,
        },
        round_number: 2,
        event_id: 347,
      },
      {
        partnerX: {
          id: 2415,
        },
        partnerY: {
          id: 2552,
        },
        round_number: 1,
        event_id: 307,
      },
      {
        partnerX: {
          id: 2571,
        },
        partnerY: {
          id: 3276,
        },
        round_number: 1,
        event_id: 307,
      },
      {
        partnerX: {
          id: 3276,
        },
        partnerY: {
          id: 3387,
        },
        round_number: 2,
        event_id: 307,
      },
      {
        partnerX: {
          id: 2152,
        },
        partnerY: {
          id: 2571,
        },
        round_number: 2,
        event_id: 307,
      },
      {
        partnerX: {
          id: 2552,
        },
        partnerY: {
          id: 2854,
        },
        round_number: 2,
        event_id: 307,
      },
      {
        partnerX: {
          id: 2152,
        },
        partnerY: {
          id: 3276,
        },
        round_number: 3,
        event_id: 307,
      },
      {
        partnerX: {
          id: 2415,
        },
        partnerY: {
          id: 2571,
        },
        round_number: 3,
        event_id: 307,
      },
      {
        partnerX: {
          id: 2552,
        },
        partnerY: {
          id: 3387,
        },
        round_number: 3,
        event_id: 307,
      },
      {
        partnerX: {
          id: 2552,
        },
        partnerY: {
          id: 3276,
        },
        round_number: 4,
        event_id: 307,
      },
      {
        partnerX: {
          id: 2152,
        },
        partnerY: {
          id: 2415,
        },
        round_number: 4,
        event_id: 307,
      },
      {
        partnerX: {
          id: 2415,
        },
        partnerY: {
          id: 2854,
        },
        round_number: 5,
        event_id: 307,
      },
      {
        partnerX: {
          id: 2152,
        },
        partnerY: {
          id: 2552,
        },
        round_number: 5,
        event_id: 307,
      },
      {
        partnerX: {
          id: 2854,
        },
        partnerY: {
          id: 3387,
        },
        round_number: 4,
        event_id: 307,
      },
      {
        partnerX: {
          id: 2571,
        },
        partnerY: {
          id: 2854,
        },
        round_number: 6,
        event_id: 307,
      },
      {
        partnerX: {
          id: 2152,
        },
        partnerY: {
          id: 3387,
        },
        round_number: 6,
        event_id: 307,
      },
      {
        partnerX: {
          id: 2552,
        },
        partnerY: {
          id: 2571,
        },
        round_number: 7,
        event_id: 307,
      },
      {
        partnerX: {
          id: 2854,
        },
        partnerY: {
          id: 3276,
        },
        round_number: 7,
        event_id: 307,
      },
      {
        partnerX: {
          id: 2422,
        },
        partnerY: {
          id: 2530,
        },
        round_number: 2,
        event_id: 326,
      },
      {
        partnerX: {
          id: 2171,
        },
        partnerY: {
          id: 3485,
        },
        round_number: 3,
        event_id: 349,
      },
      {
        partnerX: {
          id: 3486,
        },
        partnerY: {
          id: 3488,
        },
        round_number: 3,
        event_id: 349,
      },
      {
        partnerX: {
          id: 3483,
        },
        partnerY: {
          id: 3493,
        },
        round_number: 3,
        event_id: 349,
      },
      {
        partnerX: {
          id: 3484,
        },
        partnerY: {
          id: 3494,
        },
        round_number: 3,
        event_id: 349,
      },
      {
        partnerX: {
          id: 3086,
        },
        partnerY: {
          id: 3506,
        },
        round_number: 1,
        event_id: 313,
      },
      {
        partnerX: {
          id: 1933,
        },
        partnerY: {
          id: 3103,
        },
        round_number: 4,
        event_id: 325,
      },
      {
        partnerX: {
          id: 3461,
        },
        partnerY: {
          id: 3506,
        },
        round_number: 2,
        event_id: 313,
      },
      {
        partnerX: {
          id: 3483,
        },
        partnerY: {
          id: 3492,
        },
        round_number: 1,
        event_id: 349,
      },
      {
        partnerX: {
          id: 3485,
        },
        partnerY: {
          id: 3493,
        },
        round_number: 1,
        event_id: 349,
      },
      {
        partnerX: {
          id: 3486,
        },
        partnerY: {
          id: 3494,
        },
        round_number: 1,
        event_id: 349,
      },
      {
        partnerX: {
          id: 3488,
        },
        partnerY: {
          id: 3489,
        },
        round_number: 1,
        event_id: 349,
      },
      {
        partnerX: {
          id: 3086,
        },
        partnerY: {
          id: 3500,
        },
        round_number: 2,
        event_id: 313,
      },
      {
        partnerX: {
          id: 2171,
        },
        partnerY: {
          id: 3496,
        },
        round_number: 1,
        event_id: 349,
      },
      {
        partnerX: {
          id: 3448,
        },
        partnerY: {
          id: 3511,
        },
        round_number: 4,
        event_id: 325,
      },
      {
        partnerX: {
          id: 3086,
        },
        partnerY: {
          id: 3461,
        },
        round_number: 3,
        event_id: 313,
      },
      {
        partnerX: {
          id: 3500,
        },
        partnerY: {
          id: 3506,
        },
        round_number: 3,
        event_id: 313,
      },
      {
        partnerX: {
          id: 3461,
        },
        partnerY: {
          id: 3500,
        },
        round_number: 4,
        event_id: 313,
      },
      {
        partnerX: {
          id: 3485,
        },
        partnerY: {
          id: 3492,
        },
        round_number: 2,
        event_id: 349,
      },
      {
        partnerX: {
          id: 3486,
        },
        partnerY: {
          id: 3493,
        },
        round_number: 2,
        event_id: 349,
      },
      {
        partnerX: {
          id: 2171,
        },
        partnerY: {
          id: 3494,
        },
        round_number: 2,
        event_id: 349,
      },
      {
        partnerX: {
          id: 3484,
        },
        partnerY: {
          id: 3489,
        },
        round_number: 2,
        event_id: 349,
      },
      {
        partnerX: {
          id: 3488,
        },
        partnerY: {
          id: 3496,
        },
        round_number: 2,
        event_id: 349,
      },
      {
        partnerX: {
          id: 3483,
        },
        partnerY: {
          id: 3487,
        },
        round_number: 2,
        event_id: 349,
      },
      {
        partnerX: {
          id: 3440,
        },
        partnerY: {
          id: 3511,
        },
        round_number: 1,
        event_id: 325,
      },
      {
        partnerX: {
          id: 1933,
        },
        partnerY: {
          id: 2926,
        },
        round_number: 1,
        event_id: 325,
      },
      {
        partnerX: {
          id: 2926,
        },
        partnerY: {
          id: 3448,
        },
        round_number: 2,
        event_id: 325,
      },
      {
        partnerX: {
          id: 3440,
        },
        partnerY: {
          id: 3448,
        },
        round_number: 5,
        event_id: 325,
      },
      {
        partnerX: {
          id: 3103,
        },
        partnerY: {
          id: 3511,
        },
        round_number: 2,
        event_id: 325,
      },
      {
        partnerX: {
          id: 1933,
        },
        partnerY: {
          id: 3511,
        },
        round_number: 3,
        event_id: 325,
      },
      {
        partnerX: {
          id: 2926,
        },
        partnerY: {
          id: 3440,
        },
        round_number: 3,
        event_id: 325,
      },
      {
        partnerX: {
          id: 1933,
        },
        partnerY: {
          id: 3440,
        },
        round_number: 6,
        event_id: 325,
      },
      {
        partnerX: {
          id: 3103,
        },
        partnerY: {
          id: 3448,
        },
        round_number: 6,
        event_id: 325,
      },
      {
        partnerX: {
          id: 2926,
        },
        partnerY: {
          id: 3511,
        },
        round_number: 7,
        event_id: 325,
      },
      {
        partnerX: {
          id: 3103,
        },
        partnerY: {
          id: 3440,
        },
        round_number: 7,
        event_id: 325,
      },
      {
        partnerX: {
          id: 1933,
        },
        partnerY: {
          id: 3448,
        },
        round_number: 7,
        event_id: 325,
      },
      {
        partnerX: {
          id: 12,
        },
        partnerY: {
          id: 3527,
        },
        round_number: 2,
        event_id: 353,
      },
      {
        partnerX: {
          id: 12,
        },
        partnerY: {
          id: 3525,
        },
        round_number: 1,
        event_id: 353,
      },
      {
        partnerX: {
          id: 3526,
        },
        partnerY: {
          id: 3527,
        },
        round_number: 1,
        event_id: 353,
      },
      {
        partnerX: {
          id: 12,
        },
        partnerY: {
          id: 2403,
        },
        round_number: 1,
        event_id: 320,
      },
      {
        partnerX: {
          id: 3525,
        },
        partnerY: {
          id: 3526,
        },
        round_number: 2,
        event_id: 353,
      },
      {
        partnerX: {
          id: 3528,
        },
        partnerY: {
          id: 3553,
        },
        round_number: 1,
        event_id: 320,
      },
      {
        partnerX: {
          id: 12,
        },
        partnerY: {
          id: 3526,
        },
        round_number: 3,
        event_id: 353,
      },
      {
        partnerX: {
          id: 2403,
        },
        partnerY: {
          id: 3524,
        },
        round_number: 2,
        event_id: 320,
      },
      {
        partnerX: {
          id: 3551,
        },
        partnerY: {
          id: 3553,
        },
        round_number: 2,
        event_id: 320,
      },
      {
        partnerX: {
          id: 12,
        },
        partnerY: {
          id: 3553,
        },
        round_number: 3,
        event_id: 320,
      },
      {
        partnerX: {
          id: 3524,
        },
        partnerY: {
          id: 3551,
        },
        round_number: 3,
        event_id: 320,
      },
      {
        partnerX: {
          id: 2403,
        },
        partnerY: {
          id: 3551,
        },
        round_number: 4,
        event_id: 320,
      },
      {
        partnerX: {
          id: 2403,
        },
        partnerY: {
          id: 3553,
        },
        round_number: 5,
        event_id: 320,
      },
      {
        partnerX: {
          id: 12,
        },
        partnerY: {
          id: 3551,
        },
        round_number: 5,
        event_id: 320,
      },
      {
        partnerX: {
          id: 3037,
        },
        partnerY: {
          id: 3358,
        },
        round_number: 1,
        event_id: 352,
      },
      {
        partnerX: {
          id: 2333,
        },
        partnerY: {
          id: 3559,
        },
        round_number: 1,
        event_id: 352,
      },
      {
        partnerX: {
          id: 1939,
        },
        partnerY: {
          id: 34,
        },
        round_number: 5,
        event_id: 328,
      },
      {
        partnerX: {
          id: 2333,
        },
        partnerY: {
          id: 3552,
        },
        round_number: 2,
        event_id: 352,
      },
      {
        partnerX: {
          id: 3358,
        },
        partnerY: {
          id: 3552,
        },
        round_number: 3,
        event_id: 352,
      },
      {
        partnerX: {
          id: 2333,
        },
        partnerY: {
          id: 3560,
        },
        round_number: 3,
        event_id: 352,
      },
      {
        partnerX: {
          id: 3037,
        },
        partnerY: {
          id: 3536,
        },
        round_number: 3,
        event_id: 352,
      },
      {
        partnerX: {
          id: 3516,
        },
        partnerY: {
          id: 3559,
        },
        round_number: 3,
        event_id: 352,
      },
      {
        partnerX: {
          id: 1808,
        },
        partnerY: {
          id: 3552,
        },
        round_number: 3,
        event_id: 328,
      },
      {
        partnerX: {
          id: 1847,
        },
        partnerY: {
          id: 34,
        },
        round_number: 3,
        event_id: 328,
      },
      {
        partnerX: {
          id: 3358,
        },
        partnerY: {
          id: 3536,
        },
        round_number: 4,
        event_id: 352,
      },
      {
        partnerX: {
          id: 3515,
        },
        partnerY: {
          id: 3571,
        },
        round_number: 3,
        event_id: 328,
      },
      {
        partnerX: {
          id: 3559,
        },
        partnerY: {
          id: 3560,
        },
        round_number: 4,
        event_id: 352,
      },
      {
        partnerX: {
          id: 3516,
        },
        partnerY: {
          id: 3552,
        },
        round_number: 4,
        event_id: 352,
      },
      {
        partnerX: {
          id: 3037,
        },
        partnerY: {
          id: 3513,
        },
        round_number: 4,
        event_id: 352,
      },
      {
        partnerX: {
          id: 1933,
        },
        partnerY: {
          id: 513,
        },
        round_number: 3,
        event_id: 328,
      },
      {
        partnerX: {
          id: 3358,
        },
        partnerY: {
          id: 3516,
        },
        round_number: 5,
        event_id: 352,
      },
      {
        partnerX: {
          id: 12,
        },
        partnerY: {
          id: 3575,
        },
        round_number: 3,
        event_id: 328,
      },
      {
        partnerX: {
          id: 3513,
        },
        partnerY: {
          id: 3559,
        },
        round_number: 5,
        event_id: 352,
      },
      {
        partnerX: {
          id: 2333,
        },
        partnerY: {
          id: 3536,
        },
        round_number: 5,
        event_id: 352,
      },
      {
        partnerX: {
          id: 2333,
        },
        partnerY: {
          id: 3516,
        },
        round_number: 6,
        event_id: 352,
      },
      {
        partnerX: {
          id: 3536,
        },
        partnerY: {
          id: 3552,
        },
        round_number: 6,
        event_id: 352,
      },
      {
        partnerX: {
          id: 2333,
        },
        partnerY: {
          id: 3513,
        },
        round_number: 7,
        event_id: 352,
      },
      {
        partnerX: {
          id: 3358,
        },
        partnerY: {
          id: 3559,
        },
        round_number: 7,
        event_id: 352,
      },
      {
        partnerX: {
          id: 3515,
        },
        partnerY: {
          id: 3552,
        },
        round_number: 8,
        event_id: 328,
      },
      {
        partnerX: {
          id: 12,
        },
        partnerY: {
          id: 3552,
        },
        round_number: 1,
        event_id: 328,
      },
      {
        partnerX: {
          id: 34,
        },
        partnerY: {
          id: 3552,
        },
        round_number: 6,
        event_id: 328,
      },
      {
        partnerX: {
          id: 1939,
        },
        partnerY: {
          id: 3515,
        },
        round_number: 1,
        event_id: 328,
      },
      {
        partnerX: {
          id: 1847,
        },
        partnerY: {
          id: 1933,
        },
        round_number: 1,
        event_id: 328,
      },
      {
        partnerX: {
          id: 1578,
        },
        partnerY: {
          id: 34,
        },
        round_number: 1,
        event_id: 328,
      },
      {
        partnerX: {
          id: 1808,
        },
        partnerY: {
          id: 2262,
        },
        round_number: 1,
        event_id: 328,
      },
      {
        partnerX: {
          id: 1808,
        },
        partnerY: {
          id: 513,
        },
        round_number: 6,
        event_id: 328,
      },
      {
        partnerX: {
          id: 1847,
        },
        partnerY: {
          id: 1939,
        },
        round_number: 2,
        event_id: 328,
      },
      {
        partnerX: {
          id: 12,
        },
        partnerY: {
          id: 513,
        },
        round_number: 2,
        event_id: 328,
      },
      {
        partnerX: {
          id: 1939,
        },
        partnerY: {
          id: 2329,
        },
        round_number: 6,
        event_id: 328,
      },
      {
        partnerX: {
          id: 1578,
        },
        partnerY: {
          id: 3515,
        },
        round_number: 2,
        event_id: 328,
      },
      {
        partnerX: {
          id: 1933,
        },
        partnerY: {
          id: 1939,
        },
        round_number: 4,
        event_id: 328,
      },
      {
        partnerX: {
          id: 1808,
        },
        partnerY: {
          id: 3571,
        },
        round_number: 2,
        event_id: 328,
      },
      {
        partnerX: {
          id: 1933,
        },
        partnerY: {
          id: 2262,
        },
        round_number: 6,
        event_id: 328,
      },
      {
        partnerX: {
          id: 12,
        },
        partnerY: {
          id: 3515,
        },
        round_number: 4,
        event_id: 328,
      },
      {
        partnerX: {
          id: 2262,
        },
        partnerY: {
          id: 513,
        },
        round_number: 4,
        event_id: 328,
      },
      {
        partnerX: {
          id: 34,
        },
        partnerY: {
          id: 3571,
        },
        round_number: 4,
        event_id: 328,
      },
      {
        partnerX: {
          id: 1808,
        },
        partnerY: {
          id: 2329,
        },
        round_number: 4,
        event_id: 328,
      },
      {
        partnerX: {
          id: 1578,
        },
        partnerY: {
          id: 3575,
        },
        round_number: 4,
        event_id: 328,
      },
      {
        partnerX: {
          id: 1808,
        },
        partnerY: {
          id: 34,
        },
        round_number: 8,
        event_id: 328,
      },
      {
        partnerX: {
          id: 12,
        },
        partnerY: {
          id: 1578,
        },
        round_number: 6,
        event_id: 328,
      },
      {
        partnerX: {
          id: 1578,
        },
        partnerY: {
          id: 1933,
        },
        round_number: 5,
        event_id: 328,
      },
      {
        partnerX: {
          id: 3552,
        },
        partnerY: {
          id: 513,
        },
        round_number: 5,
        event_id: 328,
      },
      {
        partnerX: {
          id: 1808,
        },
        partnerY: {
          id: 3515,
        },
        round_number: 5,
        event_id: 328,
      },
      {
        partnerX: {
          id: 1847,
        },
        partnerY: {
          id: 2329,
        },
        round_number: 5,
        event_id: 328,
      },
      {
        partnerX: {
          id: 2262,
        },
        partnerY: {
          id: 3575,
        },
        round_number: 5,
        event_id: 328,
      },
      {
        partnerX: {
          id: 12,
        },
        partnerY: {
          id: 3571,
        },
        round_number: 5,
        event_id: 328,
      },
      {
        partnerX: {
          id: 3515,
        },
        partnerY: {
          id: 3575,
        },
        round_number: 6,
        event_id: 328,
      },
      {
        partnerX: {
          id: 1808,
        },
        partnerY: {
          id: 1933,
        },
        round_number: 7,
        event_id: 328,
      },
      {
        partnerX: {
          id: 1578,
        },
        partnerY: {
          id: 513,
        },
        round_number: 8,
        event_id: 328,
      },
      {
        partnerX: {
          id: 1933,
        },
        partnerY: {
          id: 3571,
        },
        round_number: 8,
        event_id: 328,
      },
      {
        partnerX: {
          id: 34,
        },
        partnerY: {
          id: 3515,
        },
        round_number: 7,
        event_id: 328,
      },
      {
        partnerX: {
          id: 12,
        },
        partnerY: {
          id: 1847,
        },
        round_number: 7,
        event_id: 328,
      },
      {
        partnerX: {
          id: 1847,
        },
        partnerY: {
          id: 3575,
        },
        round_number: 9,
        event_id: 328,
      },
      {
        partnerX: {
          id: 3552,
        },
        partnerY: {
          id: 3571,
        },
        round_number: 9,
        event_id: 328,
      },
      {
        partnerX: {
          id: 2329,
        },
        partnerY: {
          id: 3515,
        },
        round_number: 9,
        event_id: 328,
      },
      {
        partnerX: {
          id: 2074,
        },
        partnerY: {
          id: 34,
        },
        round_number: 9,
        event_id: 328,
      },
      {
        partnerX: {
          id: 12,
        },
        partnerY: {
          id: 1808,
        },
        round_number: 9,
        event_id: 328,
      },
      {
        partnerX: {
          id: 506,
        },
        partnerY: {
          id: 8,
        },
        round_number: 1,
        event_id: 364,
      },
      {
        partnerX: {
          id: 12,
        },
        partnerY: {
          id: 8,
        },
        round_number: 2,
        event_id: 364,
      },
      {
        partnerX: {
          id: 506,
        },
        partnerY: {
          id: 513,
        },
        round_number: 2,
        event_id: 364,
      },
      {
        partnerX: {
          id: 115,
        },
        partnerY: {
          id: 513,
        },
        round_number: 3,
        event_id: 364,
      },
      {
        partnerX: {
          id: 12,
        },
        partnerY: {
          id: 506,
        },
        round_number: 3,
        event_id: 364,
      },
      {
        partnerX: {
          id: 3091,
        },
        partnerY: {
          id: 506,
        },
        round_number: 4,
        event_id: 364,
      },
      {
        partnerX: {
          id: 12,
        },
        partnerY: {
          id: 513,
        },
        round_number: 4,
        event_id: 364,
      },
      {
        partnerX: {
          id: 115,
        },
        partnerY: {
          id: 8,
        },
        round_number: 4,
        event_id: 364,
      },
      {
        partnerX: {
          id: 3091,
        },
        partnerY: {
          id: 513,
        },
        round_number: 5,
        event_id: 364,
      },
      {
        partnerX: {
          id: 1847,
        },
        partnerY: {
          id: 513,
        },
        round_number: 1,
        event_id: 329,
      },
      {
        partnerX: {
          id: 2110,
        },
        partnerY: {
          id: 2362,
        },
        round_number: 1,
        event_id: 329,
      },
      {
        partnerX: {
          id: 1585,
        },
        partnerY: {
          id: 3425,
        },
        round_number: 1,
        event_id: 329,
      },
      {
        partnerX: {
          id: 1901,
        },
        partnerY: {
          id: 3518,
        },
        round_number: 1,
        event_id: 329,
      },
      {
        partnerX: {
          id: 12,
        },
        partnerY: {
          id: 3428,
        },
        round_number: 1,
        event_id: 329,
      },
      {
        partnerX: {
          id: 1933,
        },
        partnerY: {
          id: 3558,
        },
        round_number: 1,
        event_id: 329,
      },
      {
        partnerX: {
          id: 3552,
        },
        partnerY: {
          id: 3582,
        },
        round_number: 1,
        event_id: 329,
      },
      {
        partnerX: {
          id: 115,
        },
        partnerY: {
          id: 12,
        },
        round_number: 5,
        event_id: 364,
      },
      {
        partnerX: {
          id: 1901,
        },
        partnerY: {
          id: 3425,
        },
        round_number: 6,
        event_id: 329,
      },
      {
        partnerX: {
          id: 115,
        },
        partnerY: {
          id: 506,
        },
        round_number: 6,
        event_id: 364,
      },
      {
        partnerX: {
          id: 12,
        },
        partnerY: {
          id: 2567,
        },
        round_number: 6,
        event_id: 364,
      },
      {
        partnerX: {
          id: 3091,
        },
        partnerY: {
          id: 8,
        },
        round_number: 6,
        event_id: 364,
      },
      {
        partnerX: {
          id: 1585,
        },
        partnerY: {
          id: 3582,
        },
        round_number: 6,
        event_id: 329,
      },
      {
        partnerX: {
          id: 2362,
        },
        partnerY: {
          id: 513,
        },
        round_number: 2,
        event_id: 329,
      },
      {
        partnerX: {
          id: 12,
        },
        partnerY: {
          id: 1847,
        },
        round_number: 2,
        event_id: 329,
      },
      {
        partnerX: {
          id: 3552,
        },
        partnerY: {
          id: 8,
        },
        round_number: 2,
        event_id: 329,
      },
      {
        partnerX: {
          id: 1933,
        },
        partnerY: {
          id: 3518,
        },
        round_number: 2,
        event_id: 329,
      },
      {
        partnerX: {
          id: 1901,
        },
        partnerY: {
          id: 3428,
        },
        round_number: 2,
        event_id: 329,
      },
      {
        partnerX: {
          id: 3425,
        },
        partnerY: {
          id: 8,
        },
        round_number: 3,
        event_id: 329,
      },
      {
        partnerX: {
          id: 2110,
        },
        partnerY: {
          id: 513,
        },
        round_number: 3,
        event_id: 329,
      },
      {
        partnerX: {
          id: 1585,
        },
        partnerY: {
          id: 3518,
        },
        round_number: 3,
        event_id: 329,
      },
      {
        partnerX: {
          id: 12,
        },
        partnerY: {
          id: 1933,
        },
        round_number: 3,
        event_id: 329,
      },
      {
        partnerX: {
          id: 3428,
        },
        partnerY: {
          id: 3582,
        },
        round_number: 3,
        event_id: 329,
      },
      {
        partnerX: {
          id: 1901,
        },
        partnerY: {
          id: 2362,
        },
        round_number: 3,
        event_id: 329,
      },
      {
        partnerX: {
          id: 1585,
        },
        partnerY: {
          id: 1847,
        },
        round_number: 4,
        event_id: 329,
      },
      {
        partnerX: {
          id: 1933,
        },
        partnerY: {
          id: 3428,
        },
        round_number: 4,
        event_id: 329,
      },
      {
        partnerX: {
          id: 3518,
        },
        partnerY: {
          id: 3552,
        },
        round_number: 4,
        event_id: 329,
      },
      {
        partnerX: {
          id: 2362,
        },
        partnerY: {
          id: 3425,
        },
        round_number: 7,
        event_id: 329,
      },
      {
        partnerX: {
          id: 1901,
        },
        partnerY: {
          id: 3582,
        },
        round_number: 4,
        event_id: 329,
      },
      {
        partnerX: {
          id: 2110,
        },
        partnerY: {
          id: 3428,
        },
        round_number: 7,
        event_id: 329,
      },
      {
        partnerX: {
          id: 2110,
        },
        partnerY: {
          id: 8,
        },
        round_number: 4,
        event_id: 329,
      },
      {
        partnerX: {
          id: 3425,
        },
        partnerY: {
          id: 3558,
        },
        round_number: 4,
        event_id: 329,
      },
      {
        partnerX: {
          id: 1540,
        },
        partnerY: {
          id: 3518,
        },
        round_number: 7,
        event_id: 329,
      },
      {
        partnerX: {
          id: 12,
        },
        partnerY: {
          id: 1901,
        },
        round_number: 7,
        event_id: 329,
      },
      {
        partnerX: {
          id: 12,
        },
        partnerY: {
          id: 3552,
        },
        round_number: 5,
        event_id: 329,
      },
      {
        partnerX: {
          id: 3425,
        },
        partnerY: {
          id: 3428,
        },
        round_number: 5,
        event_id: 329,
      },
      {
        partnerX: {
          id: 1847,
        },
        partnerY: {
          id: 2362,
        },
        round_number: 5,
        event_id: 329,
      },
      {
        partnerX: {
          id: 1901,
        },
        partnerY: {
          id: 8,
        },
        round_number: 5,
        event_id: 329,
      },
      {
        partnerX: {
          id: 1847,
        },
        partnerY: {
          id: 2110,
        },
        round_number: 6,
        event_id: 329,
      },
      {
        partnerX: {
          id: 1933,
        },
        partnerY: {
          id: 2362,
        },
        round_number: 6,
        event_id: 329,
      },
      {
        partnerX: {
          id: 3428,
        },
        partnerY: {
          id: 3518,
        },
        round_number: 6,
        event_id: 329,
      },
      {
        partnerX: {
          id: 12,
        },
        partnerY: {
          id: 2362,
        },
        round_number: 8,
        event_id: 329,
      },
      {
        partnerX: {
          id: 1585,
        },
        partnerY: {
          id: 3552,
        },
        round_number: 8,
        event_id: 329,
      },
      {
        partnerX: {
          id: 1933,
        },
        partnerY: {
          id: 2110,
        },
        round_number: 8,
        event_id: 329,
      },
      {
        partnerX: {
          id: 1847,
        },
        partnerY: {
          id: 3425,
        },
        round_number: 8,
        event_id: 329,
      },
      {
        partnerX: {
          id: 3428,
        },
        partnerY: {
          id: 8,
        },
        round_number: 8,
        event_id: 329,
      },
      {
        partnerX: {
          id: 115,
        },
        partnerY: {
          id: 2329,
        },
        round_number: 2,
        event_id: 330,
      },
      {
        partnerX: {
          id: 1933,
        },
        partnerY: {
          id: 3582,
        },
        round_number: 9,
        event_id: 329,
      },
      {
        partnerX: {
          id: 1585,
        },
        partnerY: {
          id: 3428,
        },
        round_number: 9,
        event_id: 329,
      },
      {
        partnerX: {
          id: 2362,
        },
        partnerY: {
          id: 3518,
        },
        round_number: 9,
        event_id: 329,
      },
      {
        partnerX: {
          id: 12,
        },
        partnerY: {
          id: 3425,
        },
        round_number: 9,
        event_id: 329,
      },
      {
        partnerX: {
          id: 2227,
        },
        partnerY: {
          id: 3400,
        },
        round_number: 3,
        event_id: 330,
      },
      {
        partnerX: {
          id: 3030,
        },
        partnerY: {
          id: 3459,
        },
        round_number: 2,
        event_id: 330,
      },
      {
        partnerX: {
          id: 3472,
        },
        partnerY: {
          id: 3533,
        },
        round_number: 2,
        event_id: 330,
      },
      {
        partnerX: {
          id: 2329,
        },
        partnerY: {
          id: 2552,
        },
        round_number: 1,
        event_id: 330,
      },
      {
        partnerX: {
          id: 1933,
        },
        partnerY: {
          id: 3482,
        },
        round_number: 1,
        event_id: 330,
      },
      {
        partnerX: {
          id: 1933,
        },
        partnerY: {
          id: 3400,
        },
        round_number: 2,
        event_id: 330,
      },
      {
        partnerX: {
          id: 2110,
        },
        partnerY: {
          id: 3531,
        },
        round_number: 2,
        event_id: 330,
      },
      {
        partnerX: {
          id: 3531,
        },
        partnerY: {
          id: 3533,
        },
        round_number: 1,
        event_id: 330,
      },
      {
        partnerX: {
          id: 2361,
        },
        partnerY: {
          id: 3472,
        },
        round_number: 1,
        event_id: 330,
      },
      {
        partnerX: {
          id: 2110,
        },
        partnerY: {
          id: 3187,
        },
        round_number: 1,
        event_id: 330,
      },
      {
        partnerX: {
          id: 115,
        },
        partnerY: {
          id: 3030,
        },
        round_number: 1,
        event_id: 330,
      },
      {
        partnerX: {
          id: 115,
        },
        partnerY: {
          id: 3187,
        },
        round_number: 3,
        event_id: 330,
      },
      {
        partnerX: {
          id: 3030,
        },
        partnerY: {
          id: 3400,
        },
        round_number: 4,
        event_id: 330,
      },
      {
        partnerX: {
          id: 2361,
        },
        partnerY: {
          id: 3482,
        },
        round_number: 2,
        event_id: 330,
      },
      {
        partnerX: {
          id: 2552,
        },
        partnerY: {
          id: 3400,
        },
        round_number: 5,
        event_id: 330,
      },
      {
        partnerX: {
          id: 2227,
        },
        partnerY: {
          id: 2361,
        },
        round_number: 5,
        event_id: 330,
      },
      {
        partnerX: {
          id: 2552,
        },
        partnerY: {
          id: 3030,
        },
        round_number: 3,
        event_id: 330,
      },
      {
        partnerX: {
          id: 2329,
        },
        partnerY: {
          id: 2361,
        },
        round_number: 3,
        event_id: 330,
      },
      {
        partnerX: {
          id: 2571,
        },
        partnerY: {
          id: 3472,
        },
        round_number: 3,
        event_id: 330,
      },
      {
        partnerX: {
          id: 3187,
        },
        partnerY: {
          id: 3459,
        },
        round_number: 4,
        event_id: 330,
      },
      {
        partnerX: {
          id: 2329,
        },
        partnerY: {
          id: 2571,
        },
        round_number: 4,
        event_id: 330,
      },
      {
        partnerX: {
          id: 1933,
        },
        partnerY: {
          id: 2110,
        },
        round_number: 4,
        event_id: 330,
      },
      {
        partnerX: {
          id: 2571,
        },
        partnerY: {
          id: 3533,
        },
        round_number: 5,
        event_id: 330,
      },
      {
        partnerX: {
          id: 2110,
        },
        partnerY: {
          id: 3472,
        },
        round_number: 5,
        event_id: 330,
      },
      {
        partnerX: {
          id: 3030,
        },
        partnerY: {
          id: 3187,
        },
        round_number: 5,
        event_id: 330,
      },
      {
        partnerX: {
          id: 1933,
        },
        partnerY: {
          id: 3459,
        },
        round_number: 5,
        event_id: 330,
      },
      {
        partnerX: {
          id: 2329,
        },
        partnerY: {
          id: 3482,
        },
        round_number: 5,
        event_id: 330,
      },
      {
        partnerX: {
          id: 2110,
        },
        partnerY: {
          id: 3400,
        },
        round_number: 6,
        event_id: 330,
      },
      {
        partnerX: {
          id: 115,
        },
        partnerY: {
          id: 3459,
        },
        round_number: 6,
        event_id: 330,
      },
      {
        partnerX: {
          id: 2227,
        },
        partnerY: {
          id: 3482,
        },
        round_number: 6,
        event_id: 330,
      },
      {
        partnerX: {
          id: 3187,
        },
        partnerY: {
          id: 3533,
        },
        round_number: 6,
        event_id: 330,
      },
      {
        partnerX: {
          id: 2571,
        },
        partnerY: {
          id: 3030,
        },
        round_number: 6,
        event_id: 330,
      },
      {
        partnerX: {
          id: 2345,
        },
        partnerY: {
          id: 3114,
        },
        round_number: 8,
        event_id: 331,
      },
      {
        partnerX: {
          id: 115,
        },
        partnerY: {
          id: 2227,
        },
        round_number: 3,
        event_id: 331,
      },
      {
        partnerX: {
          id: 1901,
        },
        partnerY: {
          id: 2227,
        },
        round_number: 6,
        event_id: 331,
      },
      {
        partnerX: {
          id: 1933,
        },
        partnerY: {
          id: 2571,
        },
        round_number: 7,
        event_id: 330,
      },
      {
        partnerX: {
          id: 2110,
        },
        partnerY: {
          id: 3473,
        },
        round_number: 3,
        event_id: 331,
      },
      {
        partnerX: {
          id: 2552,
        },
        partnerY: {
          id: 3187,
        },
        round_number: 7,
        event_id: 330,
      },
      {
        partnerX: {
          id: 115,
        },
        partnerY: {
          id: 3472,
        },
        round_number: 7,
        event_id: 330,
      },
      {
        partnerX: {
          id: 2110,
        },
        partnerY: {
          id: 2227,
        },
        round_number: 7,
        event_id: 330,
      },
      {
        partnerX: {
          id: 1901,
        },
        partnerY: {
          id: 8,
        },
        round_number: 3,
        event_id: 331,
      },
      {
        partnerX: {
          id: 1933,
        },
        partnerY: {
          id: 3030,
        },
        round_number: 8,
        event_id: 330,
      },
      {
        partnerX: {
          id: 115,
        },
        partnerY: {
          id: 2571,
        },
        round_number: 8,
        event_id: 330,
      },
      {
        partnerX: {
          id: 3472,
        },
        partnerY: {
          id: 3482,
        },
        round_number: 8,
        event_id: 330,
      },
      {
        partnerX: {
          id: 3400,
        },
        partnerY: {
          id: 3533,
        },
        round_number: 8,
        event_id: 330,
      },
      {
        partnerX: {
          id: 2227,
        },
        partnerY: {
          id: 2552,
        },
        round_number: 8,
        event_id: 330,
      },
      {
        partnerX: {
          id: 115,
        },
        partnerY: {
          id: 3482,
        },
        round_number: 9,
        event_id: 330,
      },
      {
        partnerX: {
          id: 1933,
        },
        partnerY: {
          id: 3472,
        },
        round_number: 9,
        event_id: 330,
      },
      {
        partnerX: {
          id: 3030,
        },
        partnerY: {
          id: 8,
        },
        round_number: 6,
        event_id: 331,
      },
      {
        partnerX: {
          id: 2110,
        },
        partnerY: {
          id: 371,
        },
        round_number: 6,
        event_id: 331,
      },
      {
        partnerX: {
          id: 2552,
        },
        partnerY: {
          id: 2571,
        },
        round_number: 9,
        event_id: 330,
      },
      {
        partnerX: {
          id: 2227,
        },
        partnerY: {
          id: 3187,
        },
        round_number: 9,
        event_id: 330,
      },
      {
        partnerX: {
          id: 3030,
        },
        partnerY: {
          id: 3533,
        },
        round_number: 9,
        event_id: 330,
      },
      {
        partnerX: {
          id: 3030,
        },
        partnerY: {
          id: 3114,
        },
        round_number: 4,
        event_id: 331,
      },
      {
        partnerX: {
          id: 2329,
        },
        partnerY: {
          id: 2686,
        },
        round_number: 6,
        event_id: 331,
      },
      {
        partnerX: {
          id: 2571,
        },
        partnerY: {
          id: 3030,
        },
        round_number: 1,
        event_id: 331,
      },
      {
        partnerX: {
          id: 2227,
        },
        partnerY: {
          id: 2686,
        },
        round_number: 1,
        event_id: 331,
      },
      {
        partnerX: {
          id: 1933,
        },
        partnerY: {
          id: 3114,
        },
        round_number: 1,
        event_id: 331,
      },
      {
        partnerX: {
          id: 1901,
        },
        partnerY: {
          id: 2110,
        },
        round_number: 1,
        event_id: 331,
      },
      {
        partnerX: {
          id: 2329,
        },
        partnerY: {
          id: 3473,
        },
        round_number: 4,
        event_id: 331,
      },
      {
        partnerX: {
          id: 115,
        },
        partnerY: {
          id: 8,
        },
        round_number: 1,
        event_id: 331,
      },
      {
        partnerX: {
          id: 115,
        },
        partnerY: {
          id: 2686,
        },
        round_number: 4,
        event_id: 331,
      },
      {
        partnerX: {
          id: 2227,
        },
        partnerY: {
          id: 2571,
        },
        round_number: 4,
        event_id: 331,
      },
      {
        partnerX: {
          id: 1933,
        },
        partnerY: {
          id: 2571,
        },
        round_number: 2,
        event_id: 331,
      },
      {
        partnerX: {
          id: 1933,
        },
        partnerY: {
          id: 371,
        },
        round_number: 4,
        event_id: 331,
      },
      {
        partnerX: {
          id: 115,
        },
        partnerY: {
          id: 2345,
        },
        round_number: 2,
        event_id: 331,
      },
      {
        partnerX: {
          id: 1901,
        },
        partnerY: {
          id: 3473,
        },
        round_number: 2,
        event_id: 331,
      },
      {
        partnerX: {
          id: 2227,
        },
        partnerY: {
          id: 3030,
        },
        round_number: 2,
        event_id: 331,
      },
      {
        partnerX: {
          id: 2329,
        },
        partnerY: {
          id: 8,
        },
        round_number: 2,
        event_id: 331,
      },
      {
        partnerX: {
          id: 2571,
        },
        partnerY: {
          id: 2686,
        },
        round_number: 3,
        event_id: 331,
      },
      {
        partnerX: {
          id: 2686,
        },
        partnerY: {
          id: 3030,
        },
        round_number: 5,
        event_id: 331,
      },
      {
        partnerX: {
          id: 1901,
        },
        partnerY: {
          id: 1933,
        },
        round_number: 5,
        event_id: 331,
      },
      {
        partnerX: {
          id: 115,
        },
        partnerY: {
          id: 2329,
        },
        round_number: 8,
        event_id: 331,
      },
      {
        partnerX: {
          id: 2571,
        },
        partnerY: {
          id: 3114,
        },
        round_number: 5,
        event_id: 331,
      },
      {
        partnerX: {
          id: 2227,
        },
        partnerY: {
          id: 8,
        },
        round_number: 5,
        event_id: 331,
      },
      {
        partnerX: {
          id: 3473,
        },
        partnerY: {
          id: 371,
        },
        round_number: 5,
        event_id: 331,
      },
      {
        partnerX: {
          id: 115,
        },
        partnerY: {
          id: 2110,
        },
        round_number: 5,
        event_id: 331,
      },
      {
        partnerX: {
          id: 1933,
        },
        partnerY: {
          id: 2329,
        },
        round_number: 9,
        event_id: 331,
      },
      {
        partnerX: {
          id: 1933,
        },
        partnerY: {
          id: 2227,
        },
        round_number: 8,
        event_id: 331,
      },
      {
        partnerX: {
          id: 115,
        },
        partnerY: {
          id: 1933,
        },
        round_number: 6,
        event_id: 331,
      },
      {
        partnerX: {
          id: 2110,
        },
        partnerY: {
          id: 3030,
        },
        round_number: 8,
        event_id: 331,
      },
      {
        partnerX: {
          id: 3114,
        },
        partnerY: {
          id: 3473,
        },
        round_number: 6,
        event_id: 331,
      },
      {
        partnerX: {
          id: 2686,
        },
        partnerY: {
          id: 8,
        },
        round_number: 8,
        event_id: 331,
      },
      {
        partnerX: {
          id: 1901,
        },
        partnerY: {
          id: 371,
        },
        round_number: 8,
        event_id: 331,
      },
      {
        partnerX: {
          id: 1933,
        },
        partnerY: {
          id: 3030,
        },
        round_number: 7,
        event_id: 331,
      },
      {
        partnerX: {
          id: 3114,
        },
        partnerY: {
          id: 8,
        },
        round_number: 7,
        event_id: 331,
      },
      {
        partnerX: {
          id: 115,
        },
        partnerY: {
          id: 3473,
        },
        round_number: 7,
        event_id: 331,
      },
      {
        partnerX: {
          id: 2329,
        },
        partnerY: {
          id: 2571,
        },
        round_number: 7,
        event_id: 331,
      },
      {
        partnerX: {
          id: 2227,
        },
        partnerY: {
          id: 371,
        },
        round_number: 7,
        event_id: 331,
      },
      {
        partnerX: {
          id: 1901,
        },
        partnerY: {
          id: 2686,
        },
        round_number: 7,
        event_id: 331,
      },
      {
        partnerX: {
          id: 3602,
        },
        partnerY: {
          id: 3605,
        },
        round_number: 1,
        event_id: 365,
      },
      {
        partnerX: {
          id: 3030,
        },
        partnerY: {
          id: 371,
        },
        round_number: 9,
        event_id: 331,
      },
      {
        partnerX: {
          id: 2686,
        },
        partnerY: {
          id: 3473,
        },
        round_number: 9,
        event_id: 331,
      },
      {
        partnerX: {
          id: 2345,
        },
        partnerY: {
          id: 8,
        },
        round_number: 9,
        event_id: 331,
      },
      {
        partnerX: {
          id: 1901,
        },
        partnerY: {
          id: 3114,
        },
        round_number: 9,
        event_id: 331,
      },
      {
        partnerX: {
          id: 115,
        },
        partnerY: {
          id: 2571,
        },
        round_number: 9,
        event_id: 331,
      },
      {
        partnerX: {
          id: 1510,
        },
        partnerY: {
          id: 3530,
        },
        round_number: 2,
        event_id: 365,
      },
      {
        partnerX: {
          id: 3600,
        },
        partnerY: {
          id: 3602,
        },
        round_number: 2,
        event_id: 365,
      },
      {
        partnerX: {
          id: 3588,
        },
        partnerY: {
          id: 3605,
        },
        round_number: 2,
        event_id: 365,
      },
      {
        partnerX: {
          id: 1510,
        },
        partnerY: {
          id: 3605,
        },
        round_number: 3,
        event_id: 365,
      },
      {
        partnerX: {
          id: 3588,
        },
        partnerY: {
          id: 3602,
        },
        round_number: 4,
        event_id: 365,
      },
      {
        partnerX: {
          id: 1510,
        },
        partnerY: {
          id: 3588,
        },
        round_number: 5,
        event_id: 365,
      },
      {
        partnerX: {
          id: 1510,
        },
        partnerY: {
          id: 3602,
        },
        round_number: 6,
        event_id: 365,
      },
      {
        partnerX: {
          id: 3457,
        },
        partnerY: {
          id: 3656,
        },
        round_number: 3,
        event_id: 350,
      },
      {
        partnerX: {
          id: 115,
        },
        partnerY: {
          id: 8,
        },
        round_number: 1,
        event_id: 370,
      },
      {
        partnerX: {
          id: 3172,
        },
        partnerY: {
          id: 3598,
        },
        round_number: 2,
        event_id: 254,
      },
      {
        partnerX: {
          id: 12,
        },
        partnerY: {
          id: 3609,
        },
        round_number: 1,
        event_id: 370,
      },
      {
        partnerX: {
          id: 103,
        },
        partnerY: {
          id: 3599,
        },
        round_number: 2,
        event_id: 254,
      },
      {
        partnerX: {
          id: 115,
        },
        partnerY: {
          id: 3609,
        },
        round_number: 2,
        event_id: 370,
      },
      {
        partnerX: {
          id: 3463,
        },
        partnerY: {
          id: 3610,
        },
        round_number: 2,
        event_id: 254,
      },
      {
        partnerX: {
          id: 12,
        },
        partnerY: {
          id: 8,
        },
        round_number: 2,
        event_id: 370,
      },
      {
        partnerX: {
          id: 115,
        },
        partnerY: {
          id: 12,
        },
        round_number: 3,
        event_id: 370,
      },
      {
        partnerX: {
          id: 3609,
        },
        partnerY: {
          id: 8,
        },
        round_number: 3,
        event_id: 370,
      },
      {
        partnerX: {
          id: 2247,
        },
        partnerY: {
          id: 3552,
        },
        round_number: 1,
        event_id: 318,
      },
      {
        partnerX: {
          id: 2616,
        },
        partnerY: {
          id: 3630,
        },
        round_number: 3,
        event_id: 351,
      },
      {
        partnerX: {
          id: 2552,
        },
        partnerY: {
          id: 3454,
        },
        round_number: 1,
        event_id: 318,
      },
      {
        partnerX: {
          id: 2571,
        },
        partnerY: {
          id: 2734,
        },
        round_number: 1,
        event_id: 318,
      },
      {
        partnerX: {
          id: 2178,
        },
        partnerY: {
          id: 3515,
        },
        round_number: 1,
        event_id: 318,
      },
      {
        partnerX: {
          id: 3463,
        },
        partnerY: {
          id: 3598,
        },
        round_number: 3,
        event_id: 254,
      },
      {
        partnerX: {
          id: 2247,
        },
        partnerY: {
          id: 2552,
        },
        round_number: 2,
        event_id: 318,
      },
      {
        partnerX: {
          id: 103,
        },
        partnerY: {
          id: 3206,
        },
        round_number: 3,
        event_id: 254,
      },
      {
        partnerX: {
          id: 3515,
        },
        partnerY: {
          id: 3552,
        },
        round_number: 2,
        event_id: 318,
      },
      {
        partnerX: {
          id: 2734,
        },
        partnerY: {
          id: 3455,
        },
        round_number: 2,
        event_id: 318,
      },
      {
        partnerX: {
          id: 2178,
        },
        partnerY: {
          id: 3454,
        },
        round_number: 2,
        event_id: 318,
      },
      {
        partnerX: {
          id: 3454,
        },
        partnerY: {
          id: 3552,
        },
        round_number: 3,
        event_id: 318,
      },
      {
        partnerX: {
          id: 3543,
        },
        partnerY: {
          id: 3631,
        },
        round_number: 3,
        event_id: 351,
      },
      {
        partnerX: {
          id: 2247,
        },
        partnerY: {
          id: 3515,
        },
        round_number: 3,
        event_id: 318,
      },
      {
        partnerX: {
          id: 2178,
        },
        partnerY: {
          id: 2552,
        },
        round_number: 3,
        event_id: 318,
      },
      {
        partnerX: {
          id: 2571,
        },
        partnerY: {
          id: 3455,
        },
        round_number: 3,
        event_id: 318,
      },
      {
        partnerX: {
          id: 3172,
        },
        partnerY: {
          id: 3599,
        },
        round_number: 4,
        event_id: 254,
      },
      {
        partnerX: {
          id: 2552,
        },
        partnerY: {
          id: 2571,
        },
        round_number: 4,
        event_id: 318,
      },
      {
        partnerX: {
          id: 2734,
        },
        partnerY: {
          id: 3454,
        },
        round_number: 4,
        event_id: 318,
      },
      {
        partnerX: {
          id: 2178,
        },
        partnerY: {
          id: 3552,
        },
        round_number: 4,
        event_id: 318,
      },
      {
        partnerX: {
          id: 2552,
        },
        partnerY: {
          id: 2734,
        },
        round_number: 5,
        event_id: 318,
      },
      {
        partnerX: {
          id: 2247,
        },
        partnerY: {
          id: 2571,
        },
        round_number: 5,
        event_id: 318,
      },
      {
        partnerX: {
          id: 3454,
        },
        partnerY: {
          id: 3515,
        },
        round_number: 5,
        event_id: 318,
      },
      {
        partnerX: {
          id: 2178,
        },
        partnerY: {
          id: 3455,
        },
        round_number: 5,
        event_id: 318,
      },
      {
        partnerX: {
          id: 3454,
        },
        partnerY: {
          id: 3455,
        },
        round_number: 6,
        event_id: 318,
      },
      {
        partnerX: {
          id: 3599,
        },
        partnerY: {
          id: 3610,
        },
        round_number: 5,
        event_id: 254,
      },
      {
        partnerX: {
          id: 2571,
        },
        partnerY: {
          id: 3515,
        },
        round_number: 6,
        event_id: 318,
      },
      {
        partnerX: {
          id: 2734,
        },
        partnerY: {
          id: 3552,
        },
        round_number: 6,
        event_id: 318,
      },
      {
        partnerX: {
          id: 103,
        },
        partnerY: {
          id: 3463,
        },
        round_number: 5,
        event_id: 254,
      },
      {
        partnerX: {
          id: 3172,
        },
        partnerY: {
          id: 3206,
        },
        round_number: 5,
        event_id: 254,
      },
      {
        partnerX: {
          id: 3172,
        },
        partnerY: {
          id: 3463,
        },
        round_number: 1,
        event_id: 254,
      },
      {
        partnerX: {
          id: 3598,
        },
        partnerY: {
          id: 3610,
        },
        round_number: 1,
        event_id: 254,
      },
      {
        partnerX: {
          id: 2924,
        },
        partnerY: {
          id: 3649,
        },
        round_number: 1,
        event_id: 350,
      },
      {
        partnerX: {
          id: 103,
        },
        partnerY: {
          id: 3610,
        },
        round_number: 6,
        event_id: 254,
      },
      {
        partnerX: {
          id: 3206,
        },
        partnerY: {
          id: 3598,
        },
        round_number: 6,
        event_id: 254,
      },
      {
        partnerX: {
          id: 3463,
        },
        partnerY: {
          id: 3599,
        },
        round_number: 6,
        event_id: 254,
      },
      {
        partnerX: {
          id: 3555,
        },
        partnerY: {
          id: 3651,
        },
        round_number: 1,
        event_id: 350,
      },
      {
        partnerX: {
          id: 3598,
        },
        partnerY: {
          id: 3599,
        },
        round_number: 7,
        event_id: 254,
      },
      {
        partnerX: {
          id: 103,
        },
        partnerY: {
          id: 3172,
        },
        round_number: 7,
        event_id: 254,
      },
      {
        partnerX: {
          id: 2616,
        },
        partnerY: {
          id: 3543,
        },
        round_number: 1,
        event_id: 351,
      },
      {
        partnerX: {
          id: 3630,
        },
        partnerY: {
          id: 3631,
        },
        round_number: 1,
        event_id: 351,
      },
      {
        partnerX: {
          id: 2616,
        },
        partnerY: {
          id: 3631,
        },
        round_number: 2,
        event_id: 351,
      },
      {
        partnerX: {
          id: 3543,
        },
        partnerY: {
          id: 3630,
        },
        round_number: 2,
        event_id: 351,
      },
      {
        partnerX: {
          id: 3578,
        },
        partnerY: {
          id: 3649,
        },
        round_number: 2,
        event_id: 350,
      },
      {
        partnerX: {
          id: 2924,
        },
        partnerY: {
          id: 3578,
        },
        round_number: 3,
        event_id: 350,
      },
      {
        partnerX: {
          id: 3457,
        },
        partnerY: {
          id: 3651,
        },
        round_number: 5,
        event_id: 350,
      },
      {
        partnerX: {
          id: 3649,
        },
        partnerY: {
          id: 3651,
        },
        round_number: 3,
        event_id: 350,
      },
      {
        partnerX: {
          id: 3651,
        },
        partnerY: {
          id: 3660,
        },
        round_number: 4,
        event_id: 350,
      },
      {
        partnerX: {
          id: 3457,
        },
        partnerY: {
          id: 3649,
        },
        round_number: 4,
        event_id: 350,
      },
      {
        partnerX: {
          id: 2924,
        },
        partnerY: {
          id: 3651,
        },
        round_number: 6,
        event_id: 350,
      },
      {
        partnerX: {
          id: 2924,
        },
        partnerY: {
          id: 3555,
        },
        round_number: 5,
        event_id: 350,
      },
      {
        partnerX: {
          id: 3457,
        },
        partnerY: {
          id: 3660,
        },
        round_number: 6,
        event_id: 350,
      },
      {
        partnerX: {
          id: 2924,
        },
        partnerY: {
          id: 3457,
        },
        round_number: 7,
        event_id: 350,
      },
      {
        partnerX: {
          id: 3555,
        },
        partnerY: {
          id: 3649,
        },
        round_number: 7,
        event_id: 350,
      },
      {
        partnerX: {
          id: 3578,
        },
        partnerY: {
          id: 3660,
        },
        round_number: 7,
        event_id: 350,
      },
      {
        partnerX: {
          id: 3649,
        },
        partnerY: {
          id: 3660,
        },
        round_number: 8,
        event_id: 350,
      },
      {
        partnerX: {
          id: 3578,
        },
        partnerY: {
          id: 3651,
        },
        round_number: 8,
        event_id: 350,
      },
      {
        partnerX: {
          id: 2924,
        },
        partnerY: {
          id: 3660,
        },
        round_number: 9,
        event_id: 350,
      },
      {
        partnerX: {
          id: 3572,
        },
        partnerY: {
          id: 3649,
        },
        round_number: 9,
        event_id: 350,
      },
      {
        partnerX: {
          id: 3647,
        },
        partnerY: {
          id: 3685,
        },
        round_number: 2,
        event_id: 324,
      },
      {
        partnerX: {
          id: 3653,
        },
        partnerY: {
          id: 3680,
        },
        round_number: 2,
        event_id: 324,
      },
      {
        partnerX: {
          id: 3683,
        },
        partnerY: {
          id: 3684,
        },
        round_number: 2,
        event_id: 324,
      },
      {
        partnerX: {
          id: 3648,
        },
        partnerY: {
          id: 3676,
        },
        round_number: 1,
        event_id: 324,
      },
      {
        partnerX: {
          id: 2344,
        },
        partnerY: {
          id: 3624,
        },
        round_number: 1,
        event_id: 324,
      },
      {
        partnerX: {
          id: 3519,
        },
        partnerY: {
          id: 3652,
        },
        round_number: 1,
        event_id: 324,
      },
      {
        partnerX: {
          id: 3494,
        },
        partnerY: {
          id: 3650,
        },
        round_number: 1,
        event_id: 324,
      },
      {
        partnerX: {
          id: 2170,
        },
        partnerY: {
          id: 3591,
        },
        round_number: 1,
        event_id: 324,
      },
      {
        partnerX: {
          id: 3646,
        },
        partnerY: {
          id: 3680,
        },
        round_number: 1,
        event_id: 324,
      },
      {
        partnerX: {
          id: 3468,
        },
        partnerY: {
          id: 3498,
        },
        round_number: 1,
        event_id: 324,
      },
      {
        partnerX: {
          id: 2171,
        },
        partnerY: {
          id: 3678,
        },
        round_number: 1,
        event_id: 324,
      },
      {
        partnerX: {
          id: 3596,
        },
        partnerY: {
          id: 3664,
        },
        round_number: 1,
        event_id: 324,
      },
      {
        partnerX: {
          id: 3569,
        },
        partnerY: {
          id: 3667,
        },
        round_number: 1,
        event_id: 324,
      },
      {
        partnerX: {
          id: 3586,
        },
        partnerY: {
          id: 3620,
        },
        round_number: 1,
        event_id: 324,
      },
      {
        partnerX: {
          id: 3570,
        },
        partnerY: {
          id: 3647,
        },
        round_number: 1,
        event_id: 324,
      },
      {
        partnerX: {
          id: 3564,
        },
        partnerY: {
          id: 3621,
        },
        round_number: 1,
        event_id: 324,
      },
      {
        partnerX: {
          id: 3544,
        },
        partnerY: {
          id: 3644,
        },
        round_number: 1,
        event_id: 324,
      },
      {
        partnerX: {
          id: 3519,
        },
        partnerY: {
          id: 3667,
        },
        round_number: 2,
        event_id: 324,
      },
      {
        partnerX: {
          id: 1533,
        },
        partnerY: {
          id: 3652,
        },
        round_number: 2,
        event_id: 324,
      },
      {
        partnerX: {
          id: 2170,
        },
        partnerY: {
          id: 3671,
        },
        round_number: 2,
        event_id: 324,
      },
      {
        partnerX: {
          id: 3650,
        },
        partnerY: {
          id: 3666,
        },
        round_number: 2,
        event_id: 324,
      },
      {
        partnerX: {
          id: 3494,
        },
        partnerY: {
          id: 3620,
        },
        round_number: 2,
        event_id: 324,
      },
      {
        partnerX: {
          id: 3544,
        },
        partnerY: {
          id: 3569,
        },
        round_number: 2,
        event_id: 324,
      },
      {
        partnerX: {
          id: 3591,
        },
        partnerY: {
          id: 3644,
        },
        round_number: 2,
        event_id: 324,
      },
      {
        partnerX: {
          id: 3498,
        },
        partnerY: {
          id: 3669,
        },
        round_number: 2,
        event_id: 324,
      },
      {
        partnerX: {
          id: 2171,
        },
        partnerY: {
          id: 3596,
        },
        round_number: 2,
        event_id: 324,
      },
      {
        partnerX: {
          id: 3632,
        },
        partnerY: {
          id: 3664,
        },
        round_number: 2,
        event_id: 324,
      },
      {
        partnerX: {
          id: 3570,
        },
        partnerY: {
          id: 3586,
        },
        round_number: 2,
        event_id: 324,
      },
      {
        partnerX: {
          id: 3646,
        },
        partnerY: {
          id: 3674,
        },
        round_number: 2,
        event_id: 324,
      },
      {
        partnerX: {
          id: 3621,
        },
        partnerY: {
          id: 3648,
        },
        round_number: 2,
        event_id: 324,
      },
      {
        partnerX: {
          id: 3498,
        },
        partnerY: {
          id: 3685,
        },
        round_number: 4,
        event_id: 324,
      },
      {
        partnerX: {
          id: 3570,
        },
        partnerY: {
          id: 3644,
        },
        round_number: 3,
        event_id: 324,
      },
      {
        partnerX: {
          id: 3569,
        },
        partnerY: {
          id: 3646,
        },
        round_number: 3,
        event_id: 324,
      },
      {
        partnerX: {
          id: 3624,
        },
        partnerY: {
          id: 3676,
        },
        round_number: 3,
        event_id: 324,
      },
      {
        partnerX: {
          id: 3494,
        },
        partnerY: {
          id: 3544,
        },
        round_number: 3,
        event_id: 324,
      },
      {
        partnerX: {
          id: 3596,
        },
        partnerY: {
          id: 3662,
        },
        round_number: 3,
        event_id: 324,
      },
      {
        partnerX: {
          id: 3586,
        },
        partnerY: {
          id: 3632,
        },
        round_number: 4,
        event_id: 324,
      },
      {
        partnerX: {
          id: 3586,
        },
        partnerY: {
          id: 3669,
        },
        round_number: 3,
        event_id: 324,
      },
      {
        partnerX: {
          id: 3498,
        },
        partnerY: {
          id: 3683,
        },
        round_number: 3,
        event_id: 324,
      },
      {
        partnerX: {
          id: 1533,
        },
        partnerY: {
          id: 3519,
        },
        round_number: 3,
        event_id: 324,
      },
      {
        partnerX: {
          id: 2170,
        },
        partnerY: {
          id: 3677,
        },
        round_number: 3,
        event_id: 324,
      },
      {
        partnerX: {
          id: 3652,
        },
        partnerY: {
          id: 3653,
        },
        round_number: 3,
        event_id: 324,
      },
      {
        partnerX: {
          id: 3652,
        },
        partnerY: {
          id: 3676,
        },
        round_number: 4,
        event_id: 324,
      },
      {
        partnerX: {
          id: 2171,
        },
        partnerY: {
          id: 3648,
        },
        round_number: 4,
        event_id: 324,
      },
      {
        partnerX: {
          id: 3650,
        },
        partnerY: {
          id: 3664,
        },
        round_number: 4,
        event_id: 324,
      },
      {
        partnerX: {
          id: 3494,
        },
        partnerY: {
          id: 3644,
        },
        round_number: 4,
        event_id: 324,
      },
      {
        partnerX: {
          id: 3544,
        },
        partnerY: {
          id: 3666,
        },
        round_number: 4,
        event_id: 324,
      },
      {
        partnerX: {
          id: 3564,
        },
        partnerY: {
          id: 3671,
        },
        round_number: 3,
        event_id: 324,
      },
      {
        partnerX: {
          id: 3633,
        },
        partnerY: {
          id: 3684,
        },
        round_number: 4,
        event_id: 324,
      },
      {
        partnerX: {
          id: 3667,
        },
        partnerY: {
          id: 3674,
        },
        round_number: 3,
        event_id: 324,
      },
      {
        partnerX: {
          id: 3664,
        },
        partnerY: {
          id: 3668,
        },
        round_number: 3,
        event_id: 324,
      },
      {
        partnerX: {
          id: 3621,
        },
        partnerY: {
          id: 3674,
        },
        round_number: 4,
        event_id: 324,
      },
      {
        partnerX: {
          id: 3468,
        },
        partnerY: {
          id: 3666,
        },
        round_number: 3,
        event_id: 324,
      },
      {
        partnerX: {
          id: 3702,
        },
        partnerY: {
          id: 3770,
        },
        round_number: 3,
        event_id: 374,
      },
      {
        partnerX: {
          id: 3714,
        },
        partnerY: {
          id: 3738,
        },
        round_number: 3,
        event_id: 374,
      },
      {
        partnerX: {
          id: 3518,
        },
        partnerY: {
          id: 3771,
        },
        round_number: 3,
        event_id: 374,
      },
      {
        partnerX: {
          id: 3763,
        },
        partnerY: {
          id: 3766,
        },
        round_number: 8,
        event_id: 374,
      },
      {
        partnerX: {
          id: 3701,
        },
        partnerY: {
          id: 3764,
        },
        round_number: 3,
        event_id: 374,
      },
      {
        partnerX: {
          id: 3700,
        },
        partnerY: {
          id: 3712,
        },
        round_number: 3,
        event_id: 374,
      },
      {
        partnerX: {
          id: 12,
        },
        partnerY: {
          id: 3553,
        },
        round_number: 3,
        event_id: 374,
      },
      {
        partnerX: {
          id: 3518,
        },
        partnerY: {
          id: 3759,
        },
        round_number: 1,
        event_id: 374,
      },
      {
        partnerX: {
          id: 12,
        },
        partnerY: {
          id: 3719,
        },
        round_number: 1,
        event_id: 374,
      },
      {
        partnerX: {
          id: 3428,
        },
        partnerY: {
          id: 3702,
        },
        round_number: 1,
        event_id: 374,
      },
      {
        partnerX: {
          id: 3742,
        },
        partnerY: {
          id: 3770,
        },
        round_number: 1,
        event_id: 374,
      },
      {
        partnerX: {
          id: 3751,
        },
        partnerY: {
          id: 3762,
        },
        round_number: 1,
        event_id: 374,
      },
      {
        partnerX: {
          id: 3712,
        },
        partnerY: {
          id: 3763,
        },
        round_number: 1,
        event_id: 374,
      },
      {
        partnerX: {
          id: 3700,
        },
        partnerY: {
          id: 3756,
        },
        round_number: 1,
        event_id: 374,
      },
      {
        partnerX: {
          id: 3738,
        },
        partnerY: {
          id: 3769,
        },
        round_number: 1,
        event_id: 374,
      },
      {
        partnerX: {
          id: 3713,
        },
        partnerY: {
          id: 3766,
        },
        round_number: 1,
        event_id: 374,
      },
      {
        partnerX: {
          id: 3762,
        },
        partnerY: {
          id: 3771,
        },
        round_number: 2,
        event_id: 374,
      },
      {
        partnerX: {
          id: 12,
        },
        partnerY: {
          id: 3759,
        },
        round_number: 2,
        event_id: 374,
      },
      {
        partnerX: {
          id: 3713,
        },
        partnerY: {
          id: 3763,
        },
        round_number: 2,
        event_id: 374,
      },
      {
        partnerX: {
          id: 3428,
        },
        partnerY: {
          id: 3714,
        },
        round_number: 2,
        event_id: 374,
      },
      {
        partnerX: {
          id: 3712,
        },
        partnerY: {
          id: 3766,
        },
        round_number: 2,
        event_id: 374,
      },
      {
        partnerX: {
          id: 12,
        },
        partnerY: {
          id: 3763,
        },
        round_number: 5,
        event_id: 374,
      },
      {
        partnerX: {
          id: 3700,
        },
        partnerY: {
          id: 3719,
        },
        round_number: 2,
        event_id: 374,
      },
      {
        partnerX: {
          id: 3518,
        },
        partnerY: {
          id: 3753,
        },
        round_number: 2,
        event_id: 374,
      },
      {
        partnerX: {
          id: 3738,
        },
        partnerY: {
          id: 3770,
        },
        round_number: 2,
        event_id: 374,
      },
      {
        partnerX: {
          id: 3764,
        },
        partnerY: {
          id: 3772,
        },
        round_number: 2,
        event_id: 374,
      },
      {
        partnerX: {
          id: 3553,
        },
        partnerY: {
          id: 3756,
        },
        round_number: 2,
        event_id: 374,
      },
      {
        partnerX: {
          id: 3701,
        },
        partnerY: {
          id: 3742,
        },
        round_number: 2,
        event_id: 374,
      },
      {
        partnerX: {
          id: 3428,
        },
        partnerY: {
          id: 3774,
        },
        round_number: 7,
        event_id: 374,
      },
      {
        partnerX: {
          id: 3771,
        },
        partnerY: {
          id: 3774,
        },
        round_number: 5,
        event_id: 374,
      },
      {
        partnerX: {
          id: 3764,
        },
        partnerY: {
          id: 3770,
        },
        round_number: 5,
        event_id: 374,
      },
      {
        partnerX: {
          id: 3759,
        },
        partnerY: {
          id: 3769,
        },
        round_number: 3,
        event_id: 374,
      },
      {
        partnerX: {
          id: 3753,
        },
        partnerY: {
          id: 3766,
        },
        round_number: 5,
        event_id: 374,
      },
      {
        partnerX: {
          id: 3428,
        },
        partnerY: {
          id: 3763,
        },
        round_number: 3,
        event_id: 374,
      },
      {
        partnerX: {
          id: 3738,
        },
        partnerY: {
          id: 3756,
        },
        round_number: 7,
        event_id: 374,
      },
      {
        partnerX: {
          id: 3701,
        },
        partnerY: {
          id: 3714,
        },
        round_number: 5,
        event_id: 374,
      },
      {
        partnerX: {
          id: 3738,
        },
        partnerY: {
          id: 3759,
        },
        round_number: 5,
        event_id: 374,
      },
      {
        partnerX: {
          id: 3714,
        },
        partnerY: {
          id: 3756,
        },
        round_number: 4,
        event_id: 374,
      },
      {
        partnerX: {
          id: 3712,
        },
        partnerY: {
          id: 3769,
        },
        round_number: 4,
        event_id: 374,
      },
      {
        partnerX: {
          id: 3701,
        },
        partnerY: {
          id: 3702,
        },
        round_number: 4,
        event_id: 374,
      },
      {
        partnerX: {
          id: 3700,
        },
        partnerY: {
          id: 3762,
        },
        round_number: 4,
        event_id: 374,
      },
      {
        partnerX: {
          id: 12,
        },
        partnerY: {
          id: 3766,
        },
        round_number: 4,
        event_id: 374,
      },
      {
        partnerX: {
          id: 3553,
        },
        partnerY: {
          id: 3719,
        },
        round_number: 4,
        event_id: 374,
      },
      {
        partnerX: {
          id: 3518,
        },
        partnerY: {
          id: 3713,
        },
        round_number: 4,
        event_id: 374,
      },
      {
        partnerX: {
          id: 3719,
        },
        partnerY: {
          id: 3770,
        },
        round_number: 6,
        event_id: 374,
      },
      {
        partnerX: {
          id: 12,
        },
        partnerY: {
          id: 3764,
        },
        round_number: 6,
        event_id: 374,
      },
      {
        partnerX: {
          id: 3771,
        },
        partnerY: {
          id: 3773,
        },
        round_number: 6,
        event_id: 374,
      },
      {
        partnerX: {
          id: 3769,
        },
        partnerY: {
          id: 3772,
        },
        round_number: 6,
        event_id: 374,
      },
      {
        partnerX: {
          id: 3719,
        },
        partnerY: {
          id: 3772,
        },
        round_number: 7,
        event_id: 374,
      },
      {
        partnerX: {
          id: 3712,
        },
        partnerY: {
          id: 3756,
        },
        round_number: 5,
        event_id: 374,
      },
      {
        partnerX: {
          id: 3428,
        },
        partnerY: {
          id: 3700,
        },
        round_number: 5,
        event_id: 374,
      },
      {
        partnerX: {
          id: 3518,
        },
        partnerY: {
          id: 3772,
        },
        round_number: 5,
        event_id: 374,
      },
      {
        partnerX: {
          id: 3524,
        },
        partnerY: {
          id: 3702,
        },
        round_number: 5,
        event_id: 374,
      },
      {
        partnerX: {
          id: 3719,
        },
        partnerY: {
          id: 3778,
        },
        round_number: 5,
        event_id: 374,
      },
      {
        partnerX: {
          id: 3701,
        },
        partnerY: {
          id: 3753,
        },
        round_number: 6,
        event_id: 374,
      },
      {
        partnerX: {
          id: 3712,
        },
        partnerY: {
          id: 3774,
        },
        round_number: 6,
        event_id: 374,
      },
      {
        partnerX: {
          id: 12,
        },
        partnerY: {
          id: 3700,
        },
        round_number: 7,
        event_id: 374,
      },
      {
        partnerX: {
          id: 3759,
        },
        partnerY: {
          id: 3762,
        },
        round_number: 7,
        event_id: 374,
      },
      {
        partnerX: {
          id: 3713,
        },
        partnerY: {
          id: 3738,
        },
        round_number: 6,
        event_id: 374,
      },
      {
        partnerX: {
          id: 3428,
        },
        partnerY: {
          id: 3518,
        },
        round_number: 6,
        event_id: 374,
      },
      {
        partnerX: {
          id: 3702,
        },
        partnerY: {
          id: 3766,
        },
        round_number: 7,
        event_id: 374,
      },
      {
        partnerX: {
          id: 3702,
        },
        partnerY: {
          id: 3763,
        },
        round_number: 6,
        event_id: 374,
      },
      {
        partnerX: {
          id: 3769,
        },
        partnerY: {
          id: 3777,
        },
        round_number: 7,
        event_id: 374,
      },
      {
        partnerX: {
          id: 3518,
        },
        partnerY: {
          id: 3770,
        },
        round_number: 7,
        event_id: 374,
      },
      {
        partnerX: {
          id: 3712,
        },
        partnerY: {
          id: 3778,
        },
        round_number: 7,
        event_id: 374,
      },
      {
        partnerX: {
          id: 3713,
        },
        partnerY: {
          id: 3771,
        },
        round_number: 7,
        event_id: 374,
      },
      {
        partnerX: {
          id: 3770,
        },
        partnerY: {
          id: 3773,
        },
        round_number: 8,
        event_id: 374,
      },
      {
        partnerX: {
          id: 3702,
        },
        partnerY: {
          id: 3774,
        },
        round_number: 8,
        event_id: 374,
      },
      {
        partnerX: {
          id: 3713,
        },
        partnerY: {
          id: 3756,
        },
        round_number: 8,
        event_id: 374,
      },
      {
        partnerX: {
          id: 3518,
        },
        partnerY: {
          id: 3778,
        },
        round_number: 8,
        event_id: 374,
      },
      {
        partnerX: {
          id: 12,
        },
        partnerY: {
          id: 3701,
        },
        round_number: 8,
        event_id: 374,
      },
      {
        partnerX: {
          id: 3712,
        },
        partnerY: {
          id: 3762,
        },
        round_number: 8,
        event_id: 374,
      },
      {
        partnerX: {
          id: 3771,
        },
        partnerY: {
          id: 3777,
        },
        round_number: 8,
        event_id: 374,
      },
      {
        partnerX: {
          id: 3738,
        },
        partnerY: {
          id: 3753,
        },
        round_number: 8,
        event_id: 374,
      },
      {
        partnerX: {
          id: 3428,
        },
        partnerY: {
          id: 3719,
        },
        round_number: 8,
        event_id: 374,
      },
      {
        partnerX: {
          id: 3700,
        },
        partnerY: {
          id: 513,
        },
        round_number: 8,
        event_id: 374,
      },
      {
        partnerX: {
          id: 3759,
        },
        partnerY: {
          id: 3772,
        },
        round_number: 8,
        event_id: 374,
      },
      {
        partnerX: {
          id: 2861,
        },
        partnerY: {
          id: 3037,
        },
        round_number: 2,
        event_id: 379,
      },
      {
        partnerX: {
          id: 2333,
        },
        partnerY: {
          id: 3513,
        },
        round_number: 2,
        event_id: 379,
      },
      {
        partnerX: {
          id: 2260,
        },
        partnerY: {
          id: 3477,
        },
        round_number: 2,
        event_id: 357,
      },
      {
        partnerX: {
          id: 2403,
        },
        partnerY: {
          id: 3771,
        },
        round_number: 1,
        event_id: 375,
      },
      {
        partnerX: {
          id: 3358,
        },
        partnerY: {
          id: 3806,
        },
        round_number: 2,
        event_id: 379,
      },
      {
        partnerX: {
          id: 12,
        },
        partnerY: {
          id: 3774,
        },
        round_number: 1,
        event_id: 375,
      },
      {
        partnerX: {
          id: 3758,
        },
        partnerY: {
          id: 3777,
        },
        round_number: 1,
        event_id: 375,
      },
      {
        partnerX: {
          id: 3770,
        },
        partnerY: {
          id: 3772,
        },
        round_number: 1,
        event_id: 375,
      },
      {
        partnerX: {
          id: 2403,
        },
        partnerY: {
          id: 3774,
        },
        round_number: 2,
        event_id: 375,
      },
      {
        partnerX: {
          id: 3772,
        },
        partnerY: {
          id: 3777,
        },
        round_number: 2,
        event_id: 375,
      },
      {
        partnerX: {
          id: 3758,
        },
        partnerY: {
          id: 3770,
        },
        round_number: 2,
        event_id: 375,
      },
      {
        partnerX: {
          id: 2403,
        },
        partnerY: {
          id: 3758,
        },
        round_number: 3,
        event_id: 375,
      },
      {
        partnerX: {
          id: 3772,
        },
        partnerY: {
          id: 3774,
        },
        round_number: 3,
        event_id: 375,
      },
      {
        partnerX: {
          id: 2403,
        },
        partnerY: {
          id: 3793,
        },
        round_number: 4,
        event_id: 375,
      },
      {
        partnerX: {
          id: 3758,
        },
        partnerY: {
          id: 3772,
        },
        round_number: 4,
        event_id: 375,
      },
      {
        partnerX: {
          id: 3806,
        },
        partnerY: {
          id: 3807,
        },
        round_number: 3,
        event_id: 379,
      },
      {
        partnerX: {
          id: 2861,
        },
        partnerY: {
          id: 3039,
        },
        round_number: 3,
        event_id: 379,
      },
      {
        partnerX: {
          id: 3758,
        },
        partnerY: {
          id: 3771,
        },
        round_number: 5,
        event_id: 375,
      },
      {
        partnerX: {
          id: 12,
        },
        partnerY: {
          id: 3777,
        },
        round_number: 5,
        event_id: 375,
      },
      {
        partnerX: {
          id: 3772,
        },
        partnerY: {
          id: 3793,
        },
        round_number: 5,
        event_id: 375,
      },
      {
        partnerX: {
          id: 2403,
        },
        partnerY: {
          id: 3772,
        },
        round_number: 6,
        event_id: 375,
      },
      {
        partnerX: {
          id: 12,
        },
        partnerY: {
          id: 3793,
        },
        round_number: 6,
        event_id: 375,
      },
      {
        partnerX: {
          id: 34,
        },
        partnerY: {
          id: 3401,
        },
        round_number: 2,
        event_id: 357,
      },
      {
        partnerX: {
          id: 2403,
        },
        partnerY: {
          id: 3777,
        },
        round_number: 7,
        event_id: 375,
      },
      {
        partnerX: {
          id: 12,
        },
        partnerY: {
          id: 3771,
        },
        round_number: 7,
        event_id: 375,
      },
      {
        partnerX: {
          id: 3037,
        },
        partnerY: {
          id: 3513,
        },
        round_number: 4,
        event_id: 379,
      },
      {
        partnerX: {
          id: 3774,
        },
        partnerY: {
          id: 3793,
        },
        round_number: 8,
        event_id: 375,
      },
      {
        partnerX: {
          id: 2333,
        },
        partnerY: {
          id: 3037,
        },
        round_number: 1,
        event_id: 379,
      },
      {
        partnerX: {
          id: 1933,
        },
        partnerY: {
          id: 3515,
        },
        round_number: 1,
        event_id: 357,
      },
      {
        partnerX: {
          id: 3358,
        },
        partnerY: {
          id: 3807,
        },
        round_number: 1,
        event_id: 379,
      },
      {
        partnerX: {
          id: 1157,
        },
        partnerY: {
          id: 12,
        },
        round_number: 2,
        event_id: 357,
      },
      {
        partnerX: {
          id: 3039,
        },
        partnerY: {
          id: 3806,
        },
        round_number: 4,
        event_id: 379,
      },
      {
        partnerX: {
          id: 1157,
        },
        partnerY: {
          id: 1918,
        },
        round_number: 1,
        event_id: 357,
      },
      {
        partnerX: {
          id: 34,
        },
        partnerY: {
          id: 3477,
        },
        round_number: 1,
        event_id: 357,
      },
      {
        partnerX: {
          id: 3037,
        },
        partnerY: {
          id: 3806,
        },
        round_number: 6,
        event_id: 379,
      },
      {
        partnerX: {
          id: 3039,
        },
        partnerY: {
          id: 3808,
        },
        round_number: 6,
        event_id: 379,
      },
      {
        partnerX: {
          id: 12,
        },
        partnerY: {
          id: 2260,
        },
        round_number: 1,
        event_id: 357,
      },
      {
        partnerX: {
          id: 3513,
        },
        partnerY: {
          id: 3808,
        },
        round_number: 7,
        event_id: 379,
      },
      {
        partnerX: {
          id: 2982,
        },
        partnerY: {
          id: 3401,
        },
        round_number: 1,
        event_id: 357,
      },
      {
        partnerX: {
          id: 3037,
        },
        partnerY: {
          id: 3039,
        },
        round_number: 7,
        event_id: 379,
      },
      {
        partnerX: {
          id: 3513,
        },
        partnerY: {
          id: 3806,
        },
        round_number: 8,
        event_id: 379,
      },
      {
        partnerX: {
          id: 3037,
        },
        partnerY: {
          id: 3808,
        },
        round_number: 8,
        event_id: 379,
      },
      {
        partnerX: {
          id: 1918,
        },
        partnerY: {
          id: 513,
        },
        round_number: 2,
        event_id: 357,
      },
      {
        partnerX: {
          id: 1157,
        },
        partnerY: {
          id: 2260,
        },
        round_number: 3,
        event_id: 357,
      },
      {
        partnerX: {
          id: 1933,
        },
        partnerY: {
          id: 2329,
        },
        round_number: 2,
        event_id: 357,
      },
      {
        partnerX: {
          id: 2982,
        },
        partnerY: {
          id: 3515,
        },
        round_number: 2,
        event_id: 357,
      },
      {
        partnerX: {
          id: 1933,
        },
        partnerY: {
          id: 34,
        },
        round_number: 3,
        event_id: 357,
      },
      {
        partnerX: {
          id: 2329,
        },
        partnerY: {
          id: 3477,
        },
        round_number: 3,
        event_id: 357,
      },
      {
        partnerX: {
          id: 3515,
        },
        partnerY: {
          id: 513,
        },
        round_number: 3,
        event_id: 357,
      },
      {
        partnerX: {
          id: 12,
        },
        partnerY: {
          id: 2982,
        },
        round_number: 3,
        event_id: 357,
      },
      {
        partnerX: {
          id: 2329,
        },
        partnerY: {
          id: 2982,
        },
        round_number: 4,
        event_id: 357,
      },
      {
        partnerX: {
          id: 12,
        },
        partnerY: {
          id: 3401,
        },
        round_number: 4,
        event_id: 357,
      },
      {
        partnerX: {
          id: 3477,
        },
        partnerY: {
          id: 3515,
        },
        round_number: 4,
        event_id: 357,
      },
      {
        partnerX: {
          id: 1918,
        },
        partnerY: {
          id: 3477,
        },
        round_number: 5,
        event_id: 357,
      },
      {
        partnerX: {
          id: 1157,
        },
        partnerY: {
          id: 1933,
        },
        round_number: 4,
        event_id: 357,
      },
      {
        partnerX: {
          id: 12,
        },
        partnerY: {
          id: 1933,
        },
        round_number: 5,
        event_id: 357,
      },
      {
        partnerX: {
          id: 1157,
        },
        partnerY: {
          id: 3515,
        },
        round_number: 5,
        event_id: 357,
      },
      {
        partnerX: {
          id: 2982,
        },
        partnerY: {
          id: 513,
        },
        round_number: 5,
        event_id: 357,
      },
      {
        partnerX: {
          id: 2260,
        },
        partnerY: {
          id: 34,
        },
        round_number: 5,
        event_id: 357,
      },
      {
        partnerX: {
          id: 1157,
        },
        partnerY: {
          id: 2982,
        },
        round_number: 6,
        event_id: 357,
      },
      {
        partnerX: {
          id: 34,
        },
        partnerY: {
          id: 513,
        },
        round_number: 6,
        event_id: 357,
      },
      {
        partnerX: {
          id: 1933,
        },
        partnerY: {
          id: 2260,
        },
        round_number: 6,
        event_id: 357,
      },
      {
        partnerX: {
          id: 3401,
        },
        partnerY: {
          id: 3477,
        },
        round_number: 6,
        event_id: 357,
      },
      {
        partnerX: {
          id: 12,
        },
        partnerY: {
          id: 3515,
        },
        round_number: 6,
        event_id: 357,
      },
      {
        partnerX: {
          id: 2329,
        },
        partnerY: {
          id: 3515,
        },
        round_number: 7,
        event_id: 357,
      },
      {
        partnerX: {
          id: 34,
        },
        partnerY: {
          id: 3552,
        },
        round_number: 2,
        event_id: 358,
      },
      {
        partnerX: {
          id: 12,
        },
        partnerY: {
          id: 513,
        },
        round_number: 7,
        event_id: 357,
      },
      {
        partnerX: {
          id: 1157,
        },
        partnerY: {
          id: 3477,
        },
        round_number: 7,
        event_id: 357,
      },
      {
        partnerX: {
          id: 1933,
        },
        partnerY: {
          id: 3401,
        },
        round_number: 7,
        event_id: 357,
      },
      {
        partnerX: {
          id: 2982,
        },
        partnerY: {
          id: 34,
        },
        round_number: 7,
        event_id: 357,
      },
      {
        partnerX: {
          id: 1157,
        },
        partnerY: {
          id: 513,
        },
        round_number: 8,
        event_id: 357,
      },
      {
        partnerX: {
          id: 2982,
        },
        partnerY: {
          id: 3477,
        },
        round_number: 8,
        event_id: 357,
      },
      {
        partnerX: {
          id: 12,
        },
        partnerY: {
          id: 34,
        },
        round_number: 8,
        event_id: 357,
      },
      {
        partnerX: {
          id: 2403,
        },
        partnerY: {
          id: 3794,
        },
        round_number: 3,
        event_id: 377,
      },
      {
        partnerX: {
          id: 3706,
        },
        partnerY: {
          id: 3794,
        },
        round_number: 4,
        event_id: 377,
      },
      {
        partnerX: {
          id: 3758,
        },
        partnerY: {
          id: 3793,
        },
        round_number: 5,
        event_id: 377,
      },
      {
        partnerX: {
          id: 3773,
        },
        partnerY: {
          id: 3794,
        },
        round_number: 5,
        event_id: 377,
      },
      {
        partnerX: {
          id: 3758,
        },
        partnerY: {
          id: 3773,
        },
        round_number: 6,
        event_id: 377,
      },
      {
        partnerX: {
          id: 2403,
        },
        partnerY: {
          id: 3706,
        },
        round_number: 6,
        event_id: 377,
      },
      {
        partnerX: {
          id: 3777,
        },
        partnerY: {
          id: 3793,
        },
        round_number: 6,
        event_id: 377,
      },
      {
        partnerX: {
          id: 3706,
        },
        partnerY: {
          id: 3777,
        },
        round_number: 7,
        event_id: 377,
      },
      {
        partnerX: {
          id: 3758,
        },
        partnerY: {
          id: 3794,
        },
        round_number: 7,
        event_id: 377,
      },
      {
        partnerX: {
          id: 3777,
        },
        partnerY: {
          id: 3794,
        },
        round_number: 8,
        event_id: 377,
      },
      {
        partnerX: {
          id: 3706,
        },
        partnerY: {
          id: 3758,
        },
        round_number: 8,
        event_id: 377,
      },
      {
        partnerX: {
          id: 2862,
        },
        partnerY: {
          id: 3731,
        },
        round_number: 3,
        event_id: 358,
      },
      {
        partnerX: {
          id: 3477,
        },
        partnerY: {
          id: 3552,
        },
        round_number: 3,
        event_id: 358,
      },
      {
        partnerX: {
          id: 3712,
        },
        partnerY: {
          id: 8,
        },
        round_number: 3,
        event_id: 358,
      },
      {
        partnerX: {
          id: 3552,
        },
        partnerY: {
          id: 3824,
        },
        round_number: 1,
        event_id: 358,
      },
      {
        partnerX: {
          id: 12,
        },
        partnerY: {
          id: 3534,
        },
        round_number: 1,
        event_id: 358,
      },
      {
        partnerX: {
          id: 2982,
        },
        partnerY: {
          id: 8,
        },
        round_number: 1,
        event_id: 358,
      },
      {
        partnerX: {
          id: 2982,
        },
        partnerY: {
          id: 3712,
        },
        round_number: 2,
        event_id: 358,
      },
      {
        partnerX: {
          id: 3731,
        },
        partnerY: {
          id: 3824,
        },
        round_number: 2,
        event_id: 358,
      },
      {
        partnerX: {
          id: 12,
        },
        partnerY: {
          id: 2862,
        },
        round_number: 2,
        event_id: 358,
      },
      {
        partnerX: {
          id: 2552,
        },
        partnerY: {
          id: 3552,
        },
        round_number: 4,
        event_id: 358,
      },
      {
        partnerX: {
          id: 2862,
        },
        partnerY: {
          id: 34,
        },
        round_number: 4,
        event_id: 358,
      },
      {
        partnerX: {
          id: 12,
        },
        partnerY: {
          id: 3712,
        },
        round_number: 4,
        event_id: 358,
      },
      {
        partnerX: {
          id: 3477,
        },
        partnerY: {
          id: 8,
        },
        round_number: 4,
        event_id: 358,
      },
      {
        partnerX: {
          id: 3534,
        },
        partnerY: {
          id: 3824,
        },
        round_number: 4,
        event_id: 358,
      },
      {
        partnerX: {
          id: 1071,
        },
        partnerY: {
          id: 495,
        },
        round_number: 2,
        event_id: 359,
      },
      {
        partnerX: {
          id: 115,
        },
        partnerY: {
          id: 1656,
        },
        round_number: 2,
        event_id: 359,
      },
      {
        partnerX: {
          id: 3534,
        },
        partnerY: {
          id: 3552,
        },
        round_number: 5,
        event_id: 358,
      },
      {
        partnerX: {
          id: 2552,
        },
        partnerY: {
          id: 2982,
        },
        round_number: 5,
        event_id: 358,
      },
      {
        partnerX: {
          id: 2862,
        },
        partnerY: {
          id: 3824,
        },
        round_number: 5,
        event_id: 358,
      },
      {
        partnerX: {
          id: 34,
        },
        partnerY: {
          id: 8,
        },
        round_number: 5,
        event_id: 358,
      },
      {
        partnerX: {
          id: 1901,
        },
        partnerY: {
          id: 3819,
        },
        round_number: 1,
        event_id: 359,
      },
      {
        partnerX: {
          id: 1071,
        },
        partnerY: {
          id: 2571,
        },
        round_number: 1,
        event_id: 359,
      },
      {
        partnerX: {
          id: 2329,
        },
        partnerY: {
          id: 3625,
        },
        round_number: 1,
        event_id: 359,
      },
      {
        partnerX: {
          id: 3400,
        },
        partnerY: {
          id: 3799,
        },
        round_number: 1,
        event_id: 359,
      },
      {
        partnerX: {
          id: 3030,
        },
        partnerY: {
          id: 3227,
        },
        round_number: 1,
        event_id: 359,
      },
      {
        partnerX: {
          id: 1934,
        },
        partnerY: {
          id: 495,
        },
        round_number: 1,
        event_id: 359,
      },
      {
        partnerX: {
          id: 115,
        },
        partnerY: {
          id: 3785,
        },
        round_number: 1,
        event_id: 359,
      },
      {
        partnerX: {
          id: 3324,
        },
        partnerY: {
          id: 8,
        },
        round_number: 1,
        event_id: 359,
      },
      {
        partnerX: {
          id: 3227,
        },
        partnerY: {
          id: 3799,
        },
        round_number: 2,
        event_id: 359,
      },
      {
        partnerX: {
          id: 1901,
        },
        partnerY: {
          id: 3625,
        },
        round_number: 3,
        event_id: 359,
      },
      {
        partnerX: {
          id: 115,
        },
        partnerY: {
          id: 3799,
        },
        round_number: 3,
        event_id: 359,
      },
      {
        partnerX: {
          id: 1934,
        },
        partnerY: {
          id: 3030,
        },
        round_number: 3,
        event_id: 359,
      },
      {
        partnerX: {
          id: 2329,
        },
        partnerY: {
          id: 8,
        },
        round_number: 3,
        event_id: 359,
      },
      {
        partnerX: {
          id: 1934,
        },
        partnerY: {
          id: 3400,
        },
        round_number: 4,
        event_id: 359,
      },
      {
        partnerX: {
          id: 3227,
        },
        partnerY: {
          id: 3785,
        },
        round_number: 4,
        event_id: 359,
      },
      {
        partnerX: {
          id: 2329,
        },
        partnerY: {
          id: 3638,
        },
        round_number: 8,
        event_id: 359,
      },
      {
        partnerX: {
          id: 3030,
        },
        partnerY: {
          id: 3625,
        },
        round_number: 4,
        event_id: 359,
      },
      {
        partnerX: {
          id: 2571,
        },
        partnerY: {
          id: 495,
        },
        round_number: 4,
        event_id: 359,
      },
      {
        partnerX: {
          id: 1656,
        },
        partnerY: {
          id: 2329,
        },
        round_number: 4,
        event_id: 359,
      },
      {
        partnerX: {
          id: 115,
        },
        partnerY: {
          id: 3625,
        },
        round_number: 8,
        event_id: 359,
      },
      {
        partnerX: {
          id: 1934,
        },
        partnerY: {
          id: 3819,
        },
        round_number: 8,
        event_id: 359,
      },
      {
        partnerX: {
          id: 1901,
        },
        partnerY: {
          id: 3638,
        },
        round_number: 4,
        event_id: 359,
      },
      {
        partnerX: {
          id: 1071,
        },
        partnerY: {
          id: 8,
        },
        round_number: 4,
        event_id: 359,
      },
      {
        partnerX: {
          id: 1071,
        },
        partnerY: {
          id: 3030,
        },
        round_number: 5,
        event_id: 359,
      },
      {
        partnerX: {
          id: 3785,
        },
        partnerY: {
          id: 8,
        },
        round_number: 8,
        event_id: 359,
      },
      {
        partnerX: {
          id: 1656,
        },
        partnerY: {
          id: 3625,
        },
        round_number: 5,
        event_id: 359,
      },
      {
        partnerX: {
          id: 115,
        },
        partnerY: {
          id: 1934,
        },
        round_number: 5,
        event_id: 359,
      },
      {
        partnerX: {
          id: 2571,
        },
        partnerY: {
          id: 8,
        },
        round_number: 5,
        event_id: 359,
      },
      {
        partnerX: {
          id: 319,
        },
        partnerY: {
          id: 3638,
        },
        round_number: 5,
        event_id: 359,
      },
      {
        partnerX: {
          id: 2329,
        },
        partnerY: {
          id: 3799,
        },
        round_number: 5,
        event_id: 359,
      },
      {
        partnerX: {
          id: 1901,
        },
        partnerY: {
          id: 3227,
        },
        round_number: 5,
        event_id: 359,
      },
      {
        partnerX: {
          id: 3819,
        },
        partnerY: {
          id: 495,
        },
        round_number: 5,
        event_id: 359,
      },
      {
        partnerX: {
          id: 2571,
        },
        partnerY: {
          id: 3819,
        },
        round_number: 6,
        event_id: 359,
      },
      {
        partnerX: {
          id: 3227,
        },
        partnerY: {
          id: 3625,
        },
        round_number: 6,
        event_id: 359,
      },
      {
        partnerX: {
          id: 1934,
        },
        partnerY: {
          id: 2329,
        },
        round_number: 6,
        event_id: 359,
      },
      {
        partnerX: {
          id: 3785,
        },
        partnerY: {
          id: 495,
        },
        round_number: 6,
        event_id: 359,
      },
      {
        partnerX: {
          id: 2097,
        },
        partnerY: {
          id: 2152,
        },
        round_number: 3,
        event_id: 360,
      },
      {
        partnerX: {
          id: 3785,
        },
        partnerY: {
          id: 3819,
        },
        round_number: 7,
        event_id: 359,
      },
      {
        partnerX: {
          id: 2904,
        },
        partnerY: {
          id: 3400,
        },
        round_number: 3,
        event_id: 360,
      },
      {
        partnerX: {
          id: 3799,
        },
        partnerY: {
          id: 3819,
        },
        round_number: 9,
        event_id: 359,
      },
      {
        partnerX: {
          id: 2345,
        },
        partnerY: {
          id: 3827,
        },
        round_number: 3,
        event_id: 360,
      },
      {
        partnerX: {
          id: 1656,
        },
        partnerY: {
          id: 495,
        },
        round_number: 7,
        event_id: 359,
      },
      {
        partnerX: {
          id: 3030,
        },
        partnerY: {
          id: 3799,
        },
        round_number: 7,
        event_id: 359,
      },
      {
        partnerX: {
          id: 3400,
        },
        partnerY: {
          id: 3638,
        },
        round_number: 7,
        event_id: 359,
      },
      {
        partnerX: {
          id: 319,
        },
        partnerY: {
          id: 3785,
        },
        round_number: 9,
        event_id: 359,
      },
      {
        partnerX: {
          id: 1901,
        },
        partnerY: {
          id: 8,
        },
        round_number: 7,
        event_id: 359,
      },
      {
        partnerX: {
          id: 115,
        },
        partnerY: {
          id: 2329,
        },
        round_number: 7,
        event_id: 359,
      },
      {
        partnerX: {
          id: 1071,
        },
        partnerY: {
          id: 3227,
        },
        round_number: 7,
        event_id: 359,
      },
      {
        partnerX: {
          id: 1656,
        },
        partnerY: {
          id: 1934,
        },
        round_number: 9,
        event_id: 359,
      },
      {
        partnerX: {
          id: 3799,
        },
        partnerY: {
          id: 495,
        },
        round_number: 8,
        event_id: 359,
      },
      {
        partnerX: {
          id: 1901,
        },
        partnerY: {
          id: 2571,
        },
        round_number: 9,
        event_id: 359,
      },
      {
        partnerX: {
          id: 1901,
        },
        partnerY: {
          id: 3030,
        },
        round_number: 8,
        event_id: 359,
      },
      {
        partnerX: {
          id: 1071,
        },
        partnerY: {
          id: 1656,
        },
        round_number: 8,
        event_id: 359,
      },
      {
        partnerX: {
          id: 3400,
        },
        partnerY: {
          id: 3827,
        },
        round_number: 7,
        event_id: 360,
      },
      {
        partnerX: {
          id: 3030,
        },
        partnerY: {
          id: 495,
        },
        round_number: 9,
        event_id: 359,
      },
      {
        partnerX: {
          id: 3638,
        },
        partnerY: {
          id: 8,
        },
        round_number: 9,
        event_id: 359,
      },
      {
        partnerX: {
          id: 115,
        },
        partnerY: {
          id: 3227,
        },
        round_number: 9,
        event_id: 359,
      },
      {
        partnerX: {
          id: 1071,
        },
        partnerY: {
          id: 3625,
        },
        round_number: 9,
        event_id: 359,
      },
      {
        partnerX: {
          id: 2152,
        },
        partnerY: {
          id: 3827,
        },
        round_number: 4,
        event_id: 360,
      },
      {
        partnerX: {
          id: 2097,
        },
        partnerY: {
          id: 2552,
        },
        round_number: 1,
        event_id: 360,
      },
      {
        partnerX: {
          id: 3400,
        },
        partnerY: {
          id: 3810,
        },
        round_number: 1,
        event_id: 360,
      },
      {
        partnerX: {
          id: 3810,
        },
        partnerY: {
          id: 3827,
        },
        round_number: 2,
        event_id: 360,
      },
      {
        partnerX: {
          id: 3145,
        },
        partnerY: {
          id: 3827,
        },
        round_number: 6,
        event_id: 360,
      },
      {
        partnerX: {
          id: 2904,
        },
        partnerY: {
          id: 3810,
        },
        round_number: 4,
        event_id: 360,
      },
      {
        partnerX: {
          id: 2552,
        },
        partnerY: {
          id: 3145,
        },
        round_number: 3,
        event_id: 360,
      },
      {
        partnerX: {
          id: 2571,
        },
        partnerY: {
          id: 3400,
        },
        round_number: 6,
        event_id: 360,
      },
      {
        partnerX: {
          id: 2097,
        },
        partnerY: {
          id: 3400,
        },
        round_number: 4,
        event_id: 360,
      },
      {
        partnerX: {
          id: 2345,
        },
        partnerY: {
          id: 2552,
        },
        round_number: 4,
        event_id: 360,
      },
      {
        partnerX: {
          id: 2571,
        },
        partnerY: {
          id: 3827,
        },
        round_number: 5,
        event_id: 360,
      },
      {
        partnerX: {
          id: 2552,
        },
        partnerY: {
          id: 2904,
        },
        round_number: 6,
        event_id: 360,
      },
      {
        partnerX: {
          id: 2227,
        },
        partnerY: {
          id: 2345,
        },
        round_number: 6,
        event_id: 360,
      },
      {
        partnerX: {
          id: 3145,
        },
        partnerY: {
          id: 3400,
        },
        round_number: 5,
        event_id: 360,
      },
      {
        partnerX: {
          id: 2097,
        },
        partnerY: {
          id: 2227,
        },
        round_number: 5,
        event_id: 360,
      },
      {
        partnerX: {
          id: 2904,
        },
        partnerY: {
          id: 3827,
        },
        round_number: 8,
        event_id: 360,
      },
      {
        partnerX: {
          id: 3145,
        },
        partnerY: {
          id: 3810,
        },
        round_number: 8,
        event_id: 360,
      },
      {
        partnerX: {
          id: 2097,
        },
        partnerY: {
          id: 2571,
        },
        round_number: 8,
        event_id: 360,
      },
      {
        partnerX: {
          id: 2227,
        },
        partnerY: {
          id: 3400,
        },
        round_number: 8,
        event_id: 360,
      },
      {
        partnerX: {
          id: 2227,
        },
        partnerY: {
          id: 2552,
        },
        round_number: 9,
        event_id: 360,
      },
      {
        partnerX: {
          id: 2571,
        },
        partnerY: {
          id: 2904,
        },
        round_number: 9,
        event_id: 360,
      },
      {
        partnerX: {
          id: 2097,
        },
        partnerY: {
          id: 3827,
        },
        round_number: 9,
        event_id: 360,
      },
      {
        partnerX: {
          id: 3771,
        },
        partnerY: {
          id: 3863,
        },
        round_number: 1,
        event_id: 378,
      },
      {
        partnerX: {
          id: 2403,
        },
        partnerY: {
          id: 2982,
        },
        round_number: 1,
        event_id: 378,
      },
      {
        partnerX: {
          id: 3770,
        },
        partnerY: {
          id: 3863,
        },
        round_number: 3,
        event_id: 378,
      },
      {
        partnerX: {
          id: 2247,
        },
        partnerY: {
          id: 3552,
        },
        round_number: 4,
        event_id: 340,
      },
      {
        partnerX: {
          id: 3770,
        },
        partnerY: {
          id: 3771,
        },
        round_number: 4,
        event_id: 378,
      },
      {
        partnerX: {
          id: 12,
        },
        partnerY: {
          id: 2403,
        },
        round_number: 4,
        event_id: 378,
      },
      {
        partnerX: {
          id: 2982,
        },
        partnerY: {
          id: 3866,
        },
        round_number: 4,
        event_id: 378,
      },
      {
        partnerX: {
          id: 2403,
        },
        partnerY: {
          id: 3866,
        },
        round_number: 5,
        event_id: 378,
      },
      {
        partnerX: {
          id: 12,
        },
        partnerY: {
          id: 3770,
        },
        round_number: 5,
        event_id: 378,
      },
      {
        partnerX: {
          id: 3773,
        },
        partnerY: {
          id: 3863,
        },
        round_number: 5,
        event_id: 378,
      },
      {
        partnerX: {
          id: 2982,
        },
        partnerY: {
          id: 3771,
        },
        round_number: 5,
        event_id: 378,
      },
      {
        partnerX: {
          id: 12,
        },
        partnerY: {
          id: 1960,
        },
        round_number: 8,
        event_id: 340,
      },
      {
        partnerX: {
          id: 34,
        },
        partnerY: {
          id: 3534,
        },
        round_number: 8,
        event_id: 340,
      },
      {
        partnerX: {
          id: 3692,
        },
        partnerY: {
          id: 8,
        },
        round_number: 8,
        event_id: 340,
      },
      {
        partnerX: {
          id: 3760,
        },
        partnerY: {
          id: 3771,
        },
        round_number: 6,
        event_id: 378,
      },
      {
        partnerX: {
          id: 12,
        },
        partnerY: {
          id: 3863,
        },
        round_number: 6,
        event_id: 378,
      },
      {
        partnerX: {
          id: 2982,
        },
        partnerY: {
          id: 3770,
        },
        round_number: 6,
        event_id: 378,
      },
      {
        partnerX: {
          id: 2403,
        },
        partnerY: {
          id: 3773,
        },
        round_number: 6,
        event_id: 378,
      },
      {
        partnerX: {
          id: 34,
        },
        partnerY: {
          id: 3692,
        },
        round_number: 5,
        event_id: 340,
      },
      {
        partnerX: {
          id: 12,
        },
        partnerY: {
          id: 3552,
        },
        round_number: 5,
        event_id: 340,
      },
      {
        partnerX: {
          id: 1960,
        },
        partnerY: {
          id: 3534,
        },
        round_number: 5,
        event_id: 340,
      },
      {
        partnerX: {
          id: 3773,
        },
        partnerY: {
          id: 3866,
        },
        round_number: 7,
        event_id: 378,
      },
      {
        partnerX: {
          id: 1933,
        },
        partnerY: {
          id: 2982,
        },
        round_number: 5,
        event_id: 340,
      },
      {
        partnerX: {
          id: 2403,
        },
        partnerY: {
          id: 3770,
        },
        round_number: 7,
        event_id: 378,
      },
      {
        partnerX: {
          id: 12,
        },
        partnerY: {
          id: 2982,
        },
        round_number: 7,
        event_id: 378,
      },
      {
        partnerX: {
          id: 3760,
        },
        partnerY: {
          id: 3863,
        },
        round_number: 7,
        event_id: 378,
      },
      {
        partnerX: {
          id: 3771,
        },
        partnerY: {
          id: 3866,
        },
        round_number: 8,
        event_id: 378,
      },
      {
        partnerX: {
          id: 2982,
        },
        partnerY: {
          id: 3863,
        },
        round_number: 8,
        event_id: 378,
      },
      {
        partnerX: {
          id: 12,
        },
        partnerY: {
          id: 3760,
        },
        round_number: 8,
        event_id: 378,
      },
      {
        partnerX: {
          id: 1933,
        },
        partnerY: {
          id: 1960,
        },
        round_number: 1,
        event_id: 340,
      },
      {
        partnerX: {
          id: 2247,
        },
        partnerY: {
          id: 34,
        },
        round_number: 1,
        event_id: 340,
      },
      {
        partnerX: {
          id: 1960,
        },
        partnerY: {
          id: 2329,
        },
        round_number: 2,
        event_id: 340,
      },
      {
        partnerX: {
          id: 1933,
        },
        partnerY: {
          id: 34,
        },
        round_number: 2,
        event_id: 340,
      },
      {
        partnerX: {
          id: 2247,
        },
        partnerY: {
          id: 2982,
        },
        round_number: 2,
        event_id: 340,
      },
      {
        partnerX: {
          id: 3552,
        },
        partnerY: {
          id: 3692,
        },
        round_number: 2,
        event_id: 340,
      },
      {
        partnerX: {
          id: 3580,
        },
        partnerY: {
          id: 617,
        },
        round_number: 1,
        event_id: 362,
      },
      {
        partnerX: {
          id: 2329,
        },
        partnerY: {
          id: 495,
        },
        round_number: 6,
        event_id: 340,
      },
      {
        partnerX: {
          id: 1960,
        },
        partnerY: {
          id: 34,
        },
        round_number: 3,
        event_id: 340,
      },
      {
        partnerX: {
          id: 2982,
        },
        partnerY: {
          id: 3552,
        },
        round_number: 3,
        event_id: 340,
      },
      {
        partnerX: {
          id: 2247,
        },
        partnerY: {
          id: 3692,
        },
        round_number: 3,
        event_id: 340,
      },
      {
        partnerX: {
          id: 2982,
        },
        partnerY: {
          id: 3692,
        },
        round_number: 6,
        event_id: 340,
      },
      {
        partnerX: {
          id: 1960,
        },
        partnerY: {
          id: 2982,
        },
        round_number: 4,
        event_id: 340,
      },
      {
        partnerX: {
          id: 3574,
        },
        partnerY: {
          id: 3871,
        },
        round_number: 1,
        event_id: 362,
      },
      {
        partnerX: {
          id: 12,
        },
        partnerY: {
          id: 1933,
        },
        round_number: 4,
        event_id: 340,
      },
      {
        partnerX: {
          id: 12,
        },
        partnerY: {
          id: 34,
        },
        round_number: 6,
        event_id: 340,
      },
      {
        partnerX: {
          id: 1933,
        },
        partnerY: {
          id: 3534,
        },
        round_number: 6,
        event_id: 340,
      },
      {
        partnerX: {
          id: 1960,
        },
        partnerY: {
          id: 2247,
        },
        round_number: 6,
        event_id: 340,
      },
      {
        partnerX: {
          id: 1960,
        },
        partnerY: {
          id: 495,
        },
        round_number: 7,
        event_id: 340,
      },
      {
        partnerX: {
          id: 34,
        },
        partnerY: {
          id: 3552,
        },
        round_number: 7,
        event_id: 340,
      },
      {
        partnerX: {
          id: 1933,
        },
        partnerY: {
          id: 3744,
        },
        round_number: 6,
        event_id: 382,
      },
      {
        partnerX: {
          id: 1933,
        },
        partnerY: {
          id: 3692,
        },
        round_number: 7,
        event_id: 340,
      },
      {
        partnerX: {
          id: 12,
        },
        partnerY: {
          id: 3534,
        },
        round_number: 7,
        event_id: 340,
      },
      {
        partnerX: {
          id: 3574,
        },
        partnerY: {
          id: 617,
        },
        round_number: 2,
        event_id: 362,
      },
      {
        partnerX: {
          id: 1933,
        },
        partnerY: {
          id: 2247,
        },
        round_number: 8,
        event_id: 340,
      },
      {
        partnerX: {
          id: 1933,
        },
        partnerY: {
          id: 3357,
        },
        round_number: 3,
        event_id: 382,
      },
      {
        partnerX: {
          id: 3573,
        },
        partnerY: {
          id: 3871,
        },
        round_number: 2,
        event_id: 362,
      },
      {
        partnerX: {
          id: 3944,
        },
        partnerY: {
          id: 3945,
        },
        round_number: 1,
        event_id: 425,
      },
      {
        partnerX: {
          id: 2982,
        },
        partnerY: {
          id: 495,
        },
        round_number: 8,
        event_id: 340,
      },
      {
        partnerX: {
          id: 3744,
        },
        partnerY: {
          id: 3861,
        },
        round_number: 3,
        event_id: 382,
      },
      {
        partnerX: {
          id: 3573,
        },
        partnerY: {
          id: 3574,
        },
        round_number: 3,
        event_id: 362,
      },
      {
        partnerX: {
          id: 1933,
        },
        partnerY: {
          id: 3477,
        },
        round_number: 1,
        event_id: 382,
      },
      {
        partnerX: {
          id: 3357,
        },
        partnerY: {
          id: 3552,
        },
        round_number: 1,
        event_id: 382,
      },
      {
        partnerX: {
          id: 3552,
        },
        partnerY: {
          id: 3744,
        },
        round_number: 2,
        event_id: 382,
      },
      {
        partnerX: {
          id: 1933,
        },
        partnerY: {
          id: 3861,
        },
        round_number: 5,
        event_id: 382,
      },
      {
        partnerX: {
          id: 1933,
        },
        partnerY: {
          id: 3552,
        },
        round_number: 4,
        event_id: 382,
      },
      {
        partnerX: {
          id: 3357,
        },
        partnerY: {
          id: 3744,
        },
        round_number: 5,
        event_id: 382,
      },
      {
        partnerX: {
          id: 3477,
        },
        partnerY: {
          id: 3744,
        },
        round_number: 4,
        event_id: 382,
      },
      {
        partnerX: {
          id: 3552,
        },
        partnerY: {
          id: 3861,
        },
        round_number: 6,
        event_id: 382,
      },
      {
        partnerX: {
          id: 1585,
        },
        partnerY: {
          id: 2861,
        },
        round_number: 1,
        event_id: 425,
      },
      {
        partnerX: {
          id: 3358,
        },
        partnerY: {
          id: 3552,
        },
        round_number: 1,
        event_id: 425,
      },
      {
        partnerX: {
          id: 1585,
        },
        partnerY: {
          id: 2333,
        },
        round_number: 2,
        event_id: 425,
      },
      {
        partnerX: {
          id: 3552,
        },
        partnerY: {
          id: 3945,
        },
        round_number: 2,
        event_id: 425,
      },
      {
        partnerX: {
          id: 3922,
        },
        partnerY: {
          id: 3944,
        },
        round_number: 2,
        event_id: 425,
      },
      {
        partnerX: {
          id: 1585,
        },
        partnerY: {
          id: 3358,
        },
        round_number: 3,
        event_id: 425,
      },
      {
        partnerX: {
          id: 2333,
        },
        partnerY: {
          id: 3552,
        },
        round_number: 3,
        event_id: 425,
      },
      {
        partnerX: {
          id: 2861,
        },
        partnerY: {
          id: 3037,
        },
        round_number: 3,
        event_id: 425,
      },
      {
        partnerX: {
          id: 3516,
        },
        partnerY: {
          id: 3945,
        },
        round_number: 9,
        event_id: 425,
      },
      {
        partnerX: {
          id: 3037,
        },
        partnerY: {
          id: 3712,
        },
        round_number: 4,
        event_id: 425,
      },
      {
        partnerX: {
          id: 3552,
        },
        partnerY: {
          id: 3807,
        },
        round_number: 9,
        event_id: 425,
      },
      {
        partnerX: {
          id: 3807,
        },
        partnerY: {
          id: 3922,
        },
        round_number: 4,
        event_id: 425,
      },
      {
        partnerX: {
          id: 2333,
        },
        partnerY: {
          id: 3560,
        },
        round_number: 4,
        event_id: 425,
      },
      {
        partnerX: {
          id: 1585,
        },
        partnerY: {
          id: 3945,
        },
        round_number: 4,
        event_id: 425,
      },
      {
        partnerX: {
          id: 3922,
        },
        partnerY: {
          id: 3945,
        },
        round_number: 5,
        event_id: 425,
      },
      {
        partnerX: {
          id: 3037,
        },
        partnerY: {
          id: 3922,
        },
        round_number: 9,
        event_id: 425,
      },
      {
        partnerX: {
          id: 1585,
        },
        partnerY: {
          id: 3037,
        },
        round_number: 5,
        event_id: 425,
      },
      {
        partnerX: {
          id: 2333,
        },
        partnerY: {
          id: 2861,
        },
        round_number: 5,
        event_id: 425,
      },
      {
        partnerX: {
          id: 3560,
        },
        partnerY: {
          id: 3944,
        },
        round_number: 9,
        event_id: 425,
      },
      {
        partnerX: {
          id: 3358,
        },
        partnerY: {
          id: 3560,
        },
        round_number: 5,
        event_id: 425,
      },
      {
        partnerX: {
          id: 3712,
        },
        partnerY: {
          id: 3807,
        },
        round_number: 5,
        event_id: 425,
      },
      {
        partnerX: {
          id: 1585,
        },
        partnerY: {
          id: 3712,
        },
        round_number: 9,
        event_id: 425,
      },
      {
        partnerX: {
          id: 1585,
        },
        partnerY: {
          id: 3922,
        },
        round_number: 6,
        event_id: 425,
      },
      {
        partnerX: {
          id: 2552,
        },
        partnerY: {
          id: 3807,
        },
        round_number: 6,
        event_id: 425,
      },
      {
        partnerX: {
          id: 3552,
        },
        partnerY: {
          id: 3560,
        },
        round_number: 6,
        event_id: 425,
      },
      {
        partnerX: {
          id: 2861,
        },
        partnerY: {
          id: 3516,
        },
        round_number: 6,
        event_id: 425,
      },
      {
        partnerX: {
          id: 3358,
        },
        partnerY: {
          id: 3712,
        },
        round_number: 6,
        event_id: 425,
      },
      {
        partnerX: {
          id: 2552,
        },
        partnerY: {
          id: 2861,
        },
        round_number: 7,
        event_id: 425,
      },
      {
        partnerX: {
          id: 3712,
        },
        partnerY: {
          id: 3945,
        },
        round_number: 7,
        event_id: 425,
      },
      {
        partnerX: {
          id: 1585,
        },
        partnerY: {
          id: 3560,
        },
        round_number: 7,
        event_id: 425,
      },
      {
        partnerX: {
          id: 3037,
        },
        partnerY: {
          id: 3552,
        },
        round_number: 7,
        event_id: 425,
      },
      {
        partnerX: {
          id: 3552,
        },
        partnerY: {
          id: 3922,
        },
        round_number: 8,
        event_id: 425,
      },
      {
        partnerX: {
          id: 2333,
        },
        partnerY: {
          id: 2552,
        },
        round_number: 8,
        event_id: 425,
      },
      {
        partnerX: {
          id: 3037,
        },
        partnerY: {
          id: 3516,
        },
        round_number: 8,
        event_id: 425,
      },
      {
        partnerX: {
          id: 3560,
        },
        partnerY: {
          id: 3807,
        },
        round_number: 8,
        event_id: 425,
      },
      {
        partnerX: {
          id: 1585,
        },
        partnerY: {
          id: 3950,
        },
        round_number: 8,
        event_id: 425,
      },
      {
        partnerX: {
          id: 1933,
        },
        partnerY: {
          id: 569,
        },
        round_number: 1,
        event_id: 384,
      },
      {
        partnerX: {
          id: 1578,
        },
        partnerY: {
          id: 3992,
        },
        round_number: 1,
        event_id: 384,
      },
      {
        partnerX: {
          id: 1933,
        },
        partnerY: {
          id: 3552,
        },
        round_number: 2,
        event_id: 385,
      },
      {
        partnerX: {
          id: 1933,
        },
        partnerY: {
          id: 3552,
        },
        round_number: 2,
        event_id: 384,
      },
      {
        partnerX: {
          id: 1578,
        },
        partnerY: {
          id: 3477,
        },
        round_number: 2,
        event_id: 384,
      },
      {
        partnerX: {
          id: 115,
        },
        partnerY: {
          id: 3953,
        },
        round_number: 5,
        event_id: 385,
      },
      {
        partnerX: {
          id: 12,
        },
        partnerY: {
          id: 3992,
        },
        round_number: 2,
        event_id: 384,
      },
      {
        partnerX: {
          id: 3897,
        },
        partnerY: {
          id: 3953,
        },
        round_number: 2,
        event_id: 385,
      },
      {
        partnerX: {
          id: 3638,
        },
        partnerY: {
          id: 3825,
        },
        round_number: 2,
        event_id: 385,
      },
      {
        partnerX: {
          id: 1635,
        },
        partnerY: {
          id: 3552,
        },
        round_number: 3,
        event_id: 384,
      },
      {
        partnerX: {
          id: 1933,
        },
        partnerY: {
          id: 3992,
        },
        round_number: 3,
        event_id: 384,
      },
      {
        partnerX: {
          id: 12,
        },
        partnerY: {
          id: 1578,
        },
        round_number: 3,
        event_id: 384,
      },
      {
        partnerX: {
          id: 3896,
        },
        partnerY: {
          id: 3974,
        },
        round_number: 2,
        event_id: 385,
      },
      {
        partnerX: {
          id: 3552,
        },
        partnerY: {
          id: 3992,
        },
        round_number: 4,
        event_id: 384,
      },
      {
        partnerX: {
          id: 115,
        },
        partnerY: {
          id: 12,
        },
        round_number: 2,
        event_id: 385,
      },
      {
        partnerX: {
          id: 3552,
        },
        partnerY: {
          id: 569,
        },
        round_number: 5,
        event_id: 384,
      },
      {
        partnerX: {
          id: 1635,
        },
        partnerY: {
          id: 3992,
        },
        round_number: 5,
        event_id: 384,
      },
      {
        partnerX: {
          id: 1933,
        },
        partnerY: {
          id: 3477,
        },
        round_number: 5,
        event_id: 384,
      },
      {
        partnerX: {
          id: 12,
        },
        partnerY: {
          id: 3552,
        },
        round_number: 6,
        event_id: 384,
      },
      {
        partnerX: {
          id: 3992,
        },
        partnerY: {
          id: 569,
        },
        round_number: 6,
        event_id: 384,
      },
      {
        partnerX: {
          id: 12,
        },
        partnerY: {
          id: 3552,
        },
        round_number: 1,
        event_id: 385,
      },
      {
        partnerX: {
          id: 1585,
        },
        partnerY: {
          id: 3953,
        },
        round_number: 1,
        event_id: 385,
      },
      {
        partnerX: {
          id: 115,
        },
        partnerY: {
          id: 1933,
        },
        round_number: 1,
        event_id: 385,
      },
      {
        partnerX: {
          id: 3518,
        },
        partnerY: {
          id: 3897,
        },
        round_number: 1,
        event_id: 385,
      },
      {
        partnerX: {
          id: 12,
        },
        partnerY: {
          id: 3974,
        },
        round_number: 5,
        event_id: 385,
      },
      {
        partnerX: {
          id: 1933,
        },
        partnerY: {
          id: 3953,
        },
        round_number: 3,
        event_id: 385,
      },
      {
        partnerX: {
          id: 3896,
        },
        partnerY: {
          id: 3897,
        },
        round_number: 5,
        event_id: 385,
      },
      {
        partnerX: {
          id: 115,
        },
        partnerY: {
          id: 3552,
        },
        round_number: 3,
        event_id: 385,
      },
      {
        partnerX: {
          id: 3897,
        },
        partnerY: {
          id: 3974,
        },
        round_number: 3,
        event_id: 385,
      },
      {
        partnerX: {
          id: 3638,
        },
        partnerY: {
          id: 3896,
        },
        round_number: 3,
        event_id: 385,
      },
      {
        partnerX: {
          id: 12,
        },
        partnerY: {
          id: 1933,
        },
        round_number: 4,
        event_id: 385,
      },
      {
        partnerX: {
          id: 3896,
        },
        partnerY: {
          id: 3953,
        },
        round_number: 4,
        event_id: 385,
      },
      {
        partnerX: {
          id: 3552,
        },
        partnerY: {
          id: 3897,
        },
        round_number: 4,
        event_id: 385,
      },
      {
        partnerX: {
          id: 3477,
        },
        partnerY: {
          id: 3974,
        },
        round_number: 4,
        event_id: 385,
      },
      {
        partnerX: {
          id: 3952,
        },
        partnerY: {
          id: 8,
        },
        round_number: 1,
        event_id: 386,
      },
      {
        partnerX: {
          id: 115,
        },
        partnerY: {
          id: 3896,
        },
        round_number: 6,
        event_id: 385,
      },
      {
        partnerX: {
          id: 12,
        },
        partnerY: {
          id: 3638,
        },
        round_number: 6,
        event_id: 385,
      },
      {
        partnerX: {
          id: 3518,
        },
        partnerY: {
          id: 3953,
        },
        round_number: 6,
        event_id: 385,
      },
      {
        partnerX: {
          id: 1585,
        },
        partnerY: {
          id: 3897,
        },
        round_number: 6,
        event_id: 385,
      },
      {
        partnerX: {
          id: 3552,
        },
        partnerY: {
          id: 3974,
        },
        round_number: 6,
        event_id: 385,
      },
      {
        partnerX: {
          id: 1933,
        },
        partnerY: {
          id: 3877,
        },
        round_number: 1,
        event_id: 386,
      },
      {
        partnerX: {
          id: 3891,
        },
        partnerY: {
          id: 3974,
        },
        round_number: 1,
        event_id: 386,
      },
      {
        partnerX: {
          id: 3891,
        },
        partnerY: {
          id: 8,
        },
        round_number: 2,
        event_id: 386,
      },
      {
        partnerX: {
          id: 1933,
        },
        partnerY: {
          id: 4012,
        },
        round_number: 2,
        event_id: 386,
      },
      {
        partnerX: {
          id: 3952,
        },
        partnerY: {
          id: 3974,
        },
        round_number: 2,
        event_id: 386,
      },
      {
        partnerX: {
          id: 12,
        },
        partnerY: {
          id: 1933,
        },
        round_number: 3,
        event_id: 386,
      },
      {
        partnerX: {
          id: 3974,
        },
        partnerY: {
          id: 8,
        },
        round_number: 3,
        event_id: 386,
      },
      {
        partnerX: {
          id: 3877,
        },
        partnerY: {
          id: 4012,
        },
        round_number: 3,
        event_id: 386,
      },
      {
        partnerX: {
          id: 12,
        },
        partnerY: {
          id: 3877,
        },
        round_number: 4,
        event_id: 386,
      },
      {
        partnerX: {
          id: 1933,
        },
        partnerY: {
          id: 8,
        },
        round_number: 4,
        event_id: 386,
      },
      {
        partnerX: {
          id: 3974,
        },
        partnerY: {
          id: 4012,
        },
        round_number: 4,
        event_id: 386,
      },
      {
        partnerX: {
          id: 1933,
        },
        partnerY: {
          id: 3974,
        },
        round_number: 5,
        event_id: 386,
      },
      {
        partnerX: {
          id: 3877,
        },
        partnerY: {
          id: 8,
        },
        round_number: 5,
        event_id: 386,
      },
      {
        partnerX: {
          id: 12,
        },
        partnerY: {
          id: 3952,
        },
        round_number: 5,
        event_id: 386,
      },
      {
        partnerX: {
          id: 3877,
        },
        partnerY: {
          id: 3952,
        },
        round_number: 6,
        event_id: 386,
      },
      {
        partnerX: {
          id: 3481,
        },
        partnerY: {
          id: 3649,
        },
        round_number: 1,
        event_id: 373,
      },
      {
        partnerX: {
          id: 1933,
        },
        partnerY: {
          id: 3891,
        },
        round_number: 6,
        event_id: 386,
      },
      {
        partnerX: {
          id: 4043,
        },
        partnerY: {
          id: 4044,
        },
        round_number: 1,
        event_id: 437,
      },
      {
        partnerX: {
          id: 12,
        },
        partnerY: {
          id: 8,
        },
        round_number: 6,
        event_id: 386,
      },
      {
        partnerX: {
          id: 3903,
        },
        partnerY: {
          id: 3974,
        },
        round_number: 6,
        event_id: 386,
      },
      {
        partnerX: {
          id: 3654,
        },
        partnerY: {
          id: 4042,
        },
        round_number: 1,
        event_id: 373,
      },
      {
        partnerX: {
          id: 1933,
        },
        partnerY: {
          id: 3952,
        },
        round_number: 7,
        event_id: 386,
      },
      {
        partnerX: {
          id: 12,
        },
        partnerY: {
          id: 3974,
        },
        round_number: 7,
        event_id: 386,
      },
      {
        partnerX: {
          id: 3457,
        },
        partnerY: {
          id: 3572,
        },
        round_number: 1,
        event_id: 373,
      },
      {
        partnerX: {
          id: 3877,
        },
        partnerY: {
          id: 3891,
        },
        round_number: 7,
        event_id: 386,
      },
      {
        partnerX: {
          id: 12,
        },
        partnerY: {
          id: 3891,
        },
        round_number: 8,
        event_id: 386,
      },
      {
        partnerX: {
          id: 3877,
        },
        partnerY: {
          id: 3974,
        },
        round_number: 8,
        event_id: 386,
      },
      {
        partnerX: {
          id: 3991,
        },
        partnerY: {
          id: 8,
        },
        round_number: 1,
        event_id: 387,
      },
      {
        partnerX: {
          id: 3145,
        },
        partnerY: {
          id: 8,
        },
        round_number: 2,
        event_id: 387,
      },
      {
        partnerX: {
          id: 1635,
        },
        partnerY: {
          id: 3400,
        },
        round_number: 2,
        event_id: 387,
      },
      {
        partnerX: {
          id: 1933,
        },
        partnerY: {
          id: 3991,
        },
        round_number: 3,
        event_id: 387,
      },
      {
        partnerX: {
          id: 1933,
        },
        partnerY: {
          id: 2152,
        },
        round_number: 4,
        event_id: 387,
      },
      {
        partnerX: {
          id: 1635,
        },
        partnerY: {
          id: 8,
        },
        round_number: 4,
        event_id: 387,
      },
      {
        partnerX: {
          id: 3400,
        },
        partnerY: {
          id: 3955,
        },
        round_number: 4,
        event_id: 387,
      },
      {
        partnerX: {
          id: 1933,
        },
        partnerY: {
          id: 3955,
        },
        round_number: 5,
        event_id: 387,
      },
      {
        partnerX: {
          id: 3609,
        },
        partnerY: {
          id: 4046,
        },
        round_number: 1,
        event_id: 437,
      },
      {
        partnerX: {
          id: 3457,
        },
        partnerY: {
          id: 3651,
        },
        round_number: 2,
        event_id: 373,
      },
      {
        partnerX: {
          id: 1933,
        },
        partnerY: {
          id: 3400,
        },
        round_number: 6,
        event_id: 387,
      },
      {
        partnerX: {
          id: 4032,
        },
        partnerY: {
          id: 4040,
        },
        round_number: 1,
        event_id: 437,
      },
      {
        partnerX: {
          id: 3955,
        },
        partnerY: {
          id: 8,
        },
        round_number: 6,
        event_id: 387,
      },
      {
        partnerX: {
          id: 3145,
        },
        partnerY: {
          id: 3991,
        },
        round_number: 6,
        event_id: 387,
      },
      {
        partnerX: {
          id: 2924,
        },
        partnerY: {
          id: 4042,
        },
        round_number: 2,
        event_id: 373,
      },
      {
        partnerX: {
          id: 319,
        },
        partnerY: {
          id: 3955,
        },
        round_number: 7,
        event_id: 387,
      },
      {
        partnerX: {
          id: 3481,
        },
        partnerY: {
          id: 3572,
        },
        round_number: 2,
        event_id: 373,
      },
      {
        partnerX: {
          id: 3400,
        },
        partnerY: {
          id: 8,
        },
        round_number: 7,
        event_id: 387,
      },
      {
        partnerX: {
          id: 2924,
        },
        partnerY: {
          id: 3654,
        },
        round_number: 4,
        event_id: 373,
      },
      {
        partnerX: {
          id: 3481,
        },
        partnerY: {
          id: 4042,
        },
        round_number: 3,
        event_id: 373,
      },
      {
        partnerX: {
          id: 3572,
        },
        partnerY: {
          id: 3654,
        },
        round_number: 3,
        event_id: 373,
      },
      {
        partnerX: {
          id: 3578,
        },
        partnerY: {
          id: 3651,
        },
        round_number: 3,
        event_id: 373,
      },
      {
        partnerX: {
          id: 2924,
        },
        partnerY: {
          id: 3457,
        },
        round_number: 3,
        event_id: 373,
      },
      {
        partnerX: {
          id: 4044,
        },
        partnerY: {
          id: 4046,
        },
        round_number: 2,
        event_id: 437,
      },
      {
        partnerX: {
          id: 3609,
        },
        partnerY: {
          id: 4040,
        },
        round_number: 2,
        event_id: 437,
      },
      {
        partnerX: {
          id: 2924,
        },
        partnerY: {
          id: 4045,
        },
        round_number: 5,
        event_id: 373,
      },
      {
        partnerX: {
          id: 3457,
        },
        partnerY: {
          id: 3481,
        },
        round_number: 4,
        event_id: 373,
      },
      {
        partnerX: {
          id: 3572,
        },
        partnerY: {
          id: 4042,
        },
        round_number: 5,
        event_id: 373,
      },
      {
        partnerX: {
          id: 3572,
        },
        partnerY: {
          id: 4045,
        },
        round_number: 4,
        event_id: 373,
      },
      {
        partnerX: {
          id: 3609,
        },
        partnerY: {
          id: 4044,
        },
        round_number: 3,
        event_id: 437,
      },
      {
        partnerX: {
          id: 3481,
        },
        partnerY: {
          id: 3651,
        },
        round_number: 5,
        event_id: 373,
      },
      {
        partnerX: {
          id: 3651,
        },
        partnerY: {
          id: 3654,
        },
        round_number: 6,
        event_id: 373,
      },
      {
        partnerX: {
          id: 3961,
        },
        partnerY: {
          id: 3963,
        },
        round_number: 4,
        event_id: 429,
      },
      {
        partnerX: {
          id: 3970,
        },
        partnerY: {
          id: 4049,
        },
        round_number: 4,
        event_id: 429,
      },
      {
        partnerX: {
          id: 3966,
        },
        partnerY: {
          id: 4028,
        },
        round_number: 4,
        event_id: 429,
      },
      {
        partnerX: {
          id: 3963,
        },
        partnerY: {
          id: 4049,
        },
        round_number: 8,
        event_id: 429,
      },
      {
        partnerX: {
          id: 2152,
        },
        partnerY: {
          id: 3970,
        },
        round_number: 8,
        event_id: 429,
      },
      {
        partnerX: {
          id: 3961,
        },
        partnerY: {
          id: 3966,
        },
        round_number: 8,
        event_id: 429,
      },
      {
        partnerX: {
          id: 2552,
        },
        partnerY: {
          id: 4022,
        },
        round_number: 7,
        event_id: 427,
      },
      {
        partnerX: {
          id: 2152,
        },
        partnerY: {
          id: 3966,
        },
        round_number: 5,
        event_id: 429,
      },
      {
        partnerX: {
          id: 3963,
        },
        partnerY: {
          id: 4028,
        },
        round_number: 5,
        event_id: 429,
      },
      {
        partnerX: {
          id: 4060,
        },
        partnerY: {
          id: 4062,
        },
        round_number: 5,
        event_id: 439,
      },
      {
        partnerX: {
          id: 2152,
        },
        partnerY: {
          id: 3961,
        },
        round_number: 9,
        event_id: 429,
      },
      {
        partnerX: {
          id: 2152,
        },
        partnerY: {
          id: 4056,
        },
        round_number: 7,
        event_id: 427,
      },
      {
        partnerX: {
          id: 3966,
        },
        partnerY: {
          id: 3970,
        },
        round_number: 3,
        event_id: 429,
      },
      {
        partnerX: {
          id: 3961,
        },
        partnerY: {
          id: 3968,
        },
        round_number: 3,
        event_id: 429,
      },
      {
        partnerX: {
          id: 2152,
        },
        partnerY: {
          id: 4028,
        },
        round_number: 3,
        event_id: 429,
      },
      {
        partnerX: {
          id: 2152,
        },
        partnerY: {
          id: 4049,
        },
        round_number: 6,
        event_id: 429,
      },
      {
        partnerX: {
          id: 3966,
        },
        partnerY: {
          id: 4049,
        },
        round_number: 7,
        event_id: 429,
      },
      {
        partnerX: {
          id: 3961,
        },
        partnerY: {
          id: 4028,
        },
        round_number: 7,
        event_id: 429,
      },
      {
        partnerX: {
          id: 2152,
        },
        partnerY: {
          id: 3963,
        },
        round_number: 7,
        event_id: 429,
      },
      {
        partnerX: {
          id: 2152,
        },
        partnerY: {
          id: 3933,
        },
        round_number: 4,
        event_id: 427,
      },
      {
        partnerX: {
          id: 2854,
        },
        partnerY: {
          id: 4056,
        },
        round_number: 4,
        event_id: 427,
      },
      {
        partnerX: {
          id: 2854,
        },
        partnerY: {
          id: 3932,
        },
        round_number: 7,
        event_id: 427,
      },
      {
        partnerX: {
          id: 3934,
        },
        partnerY: {
          id: 4057,
        },
        round_number: 4,
        event_id: 427,
      },
      {
        partnerX: {
          id: 3932,
        },
        partnerY: {
          id: 4022,
        },
        round_number: 4,
        event_id: 427,
      },
      {
        partnerX: {
          id: 2152,
        },
        partnerY: {
          id: 4000,
        },
        round_number: 1,
        event_id: 427,
      },
      {
        partnerX: {
          id: 2552,
        },
        partnerY: {
          id: 4056,
        },
        round_number: 1,
        event_id: 427,
      },
      {
        partnerX: {
          id: 2854,
        },
        partnerY: {
          id: 3933,
        },
        round_number: 1,
        event_id: 427,
      },
      {
        partnerX: {
          id: 4022,
        },
        partnerY: {
          id: 4057,
        },
        round_number: 1,
        event_id: 427,
      },
      {
        partnerX: {
          id: 3932,
        },
        partnerY: {
          id: 3935,
        },
        round_number: 1,
        event_id: 427,
      },
      {
        partnerX: {
          id: 2552,
        },
        partnerY: {
          id: 3940,
        },
        round_number: 4,
        event_id: 427,
      },
      {
        partnerX: {
          id: 2552,
        },
        partnerY: {
          id: 3933,
        },
        round_number: 2,
        event_id: 427,
      },
      {
        partnerX: {
          id: 4022,
        },
        partnerY: {
          id: 4056,
        },
        round_number: 2,
        event_id: 427,
      },
      {
        partnerX: {
          id: 3932,
        },
        partnerY: {
          id: 4057,
        },
        round_number: 2,
        event_id: 427,
      },
      {
        partnerX: {
          id: 2152,
        },
        partnerY: {
          id: 3935,
        },
        round_number: 2,
        event_id: 427,
      },
      {
        partnerX: {
          id: 2854,
        },
        partnerY: {
          id: 3940,
        },
        round_number: 2,
        event_id: 427,
      },
      {
        partnerX: {
          id: 2552,
        },
        partnerY: {
          id: 2854,
        },
        round_number: 3,
        event_id: 427,
      },
      {
        partnerX: {
          id: 2152,
        },
        partnerY: {
          id: 4022,
        },
        round_number: 3,
        event_id: 427,
      },
      {
        partnerX: {
          id: 3932,
        },
        partnerY: {
          id: 4056,
        },
        round_number: 3,
        event_id: 427,
      },
      {
        partnerX: {
          id: 3933,
        },
        partnerY: {
          id: 4057,
        },
        round_number: 7,
        event_id: 427,
      },
      {
        partnerX: {
          id: 4056,
        },
        partnerY: {
          id: 4057,
        },
        round_number: 5,
        event_id: 427,
      },
      {
        partnerX: {
          id: 2152,
        },
        partnerY: {
          id: 3934,
        },
        round_number: 5,
        event_id: 427,
      },
      {
        partnerX: {
          id: 2854,
        },
        partnerY: {
          id: 3935,
        },
        round_number: 5,
        event_id: 427,
      },
      {
        partnerX: {
          id: 3934,
        },
        partnerY: {
          id: 3935,
        },
        round_number: 7,
        event_id: 427,
      },
      {
        partnerX: {
          id: 3552,
        },
        partnerY: {
          id: 4061,
        },
        round_number: 1,
        event_id: 439,
      },
      {
        partnerX: {
          id: 3932,
        },
        partnerY: {
          id: 3934,
        },
        round_number: 6,
        event_id: 427,
      },
      {
        partnerX: {
          id: 2152,
        },
        partnerY: {
          id: 4057,
        },
        round_number: 6,
        event_id: 427,
      },
      {
        partnerX: {
          id: 3933,
        },
        partnerY: {
          id: 4056,
        },
        round_number: 6,
        event_id: 427,
      },
      {
        partnerX: {
          id: 2552,
        },
        partnerY: {
          id: 3935,
        },
        round_number: 6,
        event_id: 427,
      },
      {
        partnerX: {
          id: 2854,
        },
        partnerY: {
          id: 4022,
        },
        round_number: 6,
        event_id: 427,
      },
      {
        partnerX: {
          id: 3552,
        },
        partnerY: {
          id: 4062,
        },
        round_number: 2,
        event_id: 439,
      },
      {
        partnerX: {
          id: 4061,
        },
        partnerY: {
          id: 4062,
        },
        round_number: 3,
        event_id: 439,
      },
      {
        partnerX: {
          id: 3552,
        },
        partnerY: {
          id: 4060,
        },
        round_number: 3,
        event_id: 439,
      },
      {
        partnerX: {
          id: 4060,
        },
        partnerY: {
          id: 4061,
        },
        round_number: 4,
        event_id: 439,
      },
    ]
    const variablesArr = []

    rounds.forEach((round) => {
      variablesArr.push({
        user_id: round.partnerX.id,
        partner_id: round.partnerY.id,
        event_id: round.event_id,
        round: round.round_number,
        partner_shared_details: true,
        i_shared_details: true,
      })

      variablesArr.push({
        user_id: round.partnerY.id,
        partner_id: round.partnerX.id,
        event_id: round.event_id,
        round: round.round_number,
        partner_shared_details: true,
        i_shared_details: true,
      })
    })
    // write to partners table
    const bulkInsertPartnersRes = await orm.request(bulkInsertPartners, {
      objects: variablesArr,
    })
    console.log('insertPartners -> bulkInsertPartnersRes', bulkInsertPartnersRes)

    if (bulkInsertPartnersRes.errors) {
      throw new Error(bulkInsertPartnersRes.errors[0].message)
    }
  } catch (error) {
    console.log('error = ', error)
  }
}

insertPartners()

module.exports = app
