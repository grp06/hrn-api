import * as Sentry from '@sentry/node'
import Unsplash, { toJson } from 'unsplash-js'

import { newHost } from './discord-bots/new-host'
import { updateNames } from './gql/mutations'
import { getCronJobs } from './gql/queries'
import logger from './logger'
import initNextRound from './routes/rooms/initNextRound'
import { startServer } from './server-graphql'
import orm from './services/orm'
import webhooks from './webhooks'

import './services/cron-service'

require('dotenv').config()
require('es6-promise').polyfill()
require('isomorphic-fetch')

const bodyParser = require('body-parser')
const cors = require('cors')
const express = require('express')
const morgan = require('morgan')

const { PORT, NODE_ENV } = require('./config.js')
const authRouter = require('./routes/auth/auth-router')
const emailRouter = require('./routes/email/email-router')
const roomsRouter = require('./routes/rooms/rooms-router')
const stripeRouter = require('./routes/stripe/stripe-router')
const tokenRouter = require('./routes/twilio-token/twilio-token-router')
const uploadRouter = require('./routes/upload/upload-router')
const usersRouter = require('./routes/users/users-router')

const unsplash = new Unsplash({ accessKey: process.env.UNSPLASH_ACCESS_KEY })

const app = express()
newHost()
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
app.use('/api/rooms', roomsRouter)
app.use('/api/token', tokenRouter)
app.use('/api/signup', usersRouter)
app.use('/api/auth', authRouter)
app.use('/api/upload', uploadRouter)
app.use('/api/email', emailRouter)
app.use('/api/stripe', stripeRouter)
app.use('/api/webhooks', webhooks)

app.get('/', (req, res) => {
  res.send('Looks like the HiRightNow API is working!')
})

app.post('/get-unsplash-image-url', async (req, res) => {
  const { keyword } = req.body.input

  try {
    unsplash.search
      .photos(keyword, 1, 10, { orientation: 'landscape' })
      .then(toJson)
      .then((json) => {
        const randomIndex = Math.floor(Math.random() * 10)
        const url = json.results[randomIndex].urls.regular
        return res.json({ url })
      })
  } catch (error) {
    return res.status(400).send(error)
  }
})

app.get('/debug-sentry', () => {
  throw new Error('My first Sentry error!')
})

// The error handler must be before any other error middleware
app.use(Sentry.Handlers.errorHandler())
app.set('view engine', 'ejs')

app.use((error, req, res, next) => {
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
  // query the cronJobs table. If there's anything in there at all, it means there's an event in progress
  // when an event ends we remove it from this table
  const cronJobs = await orm.request(getCronJobs)

  console.log('checking for interrupted events')
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

// const bulkUpdateNames = async () => {
//   const userObjects = [
//     {
//       id: 2431,
//       name: 'Mariya Chukas',
//     },
//   ]
//   const namesToUpdatePromises = []
//   console.log(Date.now())
//   userObjects.forEach(async (user) => {
//     // query the event users and send emails from response
//     namesToUpdatePromises.push(
//       orm.request(updateNames, {
//         userId: user.id,
//         firstName: user.name.split(' ')[0],
//         lastName: user.name.split(' ')[1] || null,
//       })
//     )
//   })

//   try {
//     const namesToUpdate = await Promise.all(namesToUpdatePromises)
//     console.log(
//       '🚀 ~ bulkUpdateNames ',
//       namesToUpdate[namesToUpdate.length - 1].data.update_users.returning
//     )
//   } catch (error) {
//     console.log('error = ', error)
//   }

//   console.log(Date.now())
// }

// bulkUpdateNames()

module.exports = app
