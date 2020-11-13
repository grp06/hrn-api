import * as Sentry from '@sentry/node'
import { startServer } from './server-graphql'
import logger from './logger'
import './services/cron-service'
import webhooks from './webhooks'
import orm from './services/orm'
// import { bulkInsertPartners } from './gql/mutations'
import Unsplash, { toJson } from 'unsplash-js'

import initNextRound from './routes/rooms/initNextRound'

import { getCronJobs } from './gql/queries'

import { updateProfilePic } from './gql/mutations'

require('dotenv').config()
require('es6-promise').polyfill()
require('isomorphic-fetch')
const cors = require('cors')
const express = require('express')
const morgan = require('morgan')
const bodyParser = require('body-parser')
const fs = require('fs')
const fileType = require('file-type')
const multiparty = require('multiparty')
const sharp = require('sharp')
const { NODE_ENV, PORT } = require('./config.js')
const roomsRouter = require('./routes/rooms/rooms-router')
const tokenRouter = require('./routes/twilio-token/twilio-token-router')
const usersRouter = require('./routes/users/users-router')
const authRouter = require('./routes/auth/auth-router')
const uploadRouter = require('./routes/upload/upload-router')
const emailRouter = require('./routes/email/email-router')

const unsplash = new Unsplash({ accessKey: process.env.UNSPLASH_ACCESS_KEY })

console.log("uploadRouter", uploadRouter)
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
app.use('/api/rooms', roomsRouter)
app.use('/api/token', tokenRouter)
app.use('/api/signup', usersRouter)
app.use('/api/auth', authRouter)
app.use('/api/upload', uploadRouter)
app.use('/api/email', emailRouter)
app.use('/webhooks', webhooks)

app.get('/', (req, res) => {
  res.send('Looks like the HiRightNow API is working!')
})

app.get('/event-trigger-test', () => {
  console.log('hiii from event trigger test')
})

app.post('/get-unsplash-image', (req, res) => {
  try {
    unsplash.search
      .photos(req.body.keyword, 1, 10, { orientation: 'landscape' })
      .then(toJson)
      .then((json) => {
        console.log('json', json)
        const randomIndex = Math.floor(Math.random() * 10)
        return res.status(200).send({ image: json.results[randomIndex] })
      })
  } catch (error) {
    return res.status(500).send(error)
  }
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

module.exports = app
