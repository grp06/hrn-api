import * as Sentry from '@sentry/node'
import { startServer } from './server-graphql'
import logger from './logger'
import './services/cron-service'
import webhooks from './webhooks'
import orm from './services/orm'
import { bulkInsertPartners } from './gql/mutations'

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

// const insertPartners = async () => {
//   try {
//     const rounds = [
//       {
//         partnerX: {
//           id: 84,
//         },
//         partnerY: {
//           id: 89,
//         },
//         event_id: 36,
//         round_number: 3,
//       },
//       {
//         partnerX: {
//           id: 84,
//         },
//         partnerY: {
//           id: 90,
//         },
//         event_id: 89,
//         round_number: 3,
//       },
//       {
//         partnerX: {
//           id: 84,
//         },
//         partnerY: {
//           id: 90,
//         },
//         event_id: 90,
//         round_number: 1,
//       },
//       {
//         partnerX: {
//           id: 84,
//         },
//         partnerY: {
//           id: 90,
//         },
//         event_id: 97,
//         round_number: 6,
//       },
//       {
//         partnerX: {
//           id: 84,
//         },
//         partnerY: {
//           id: 90,
//         },
//         event_id: 92,
//         round_number: 3,
//       },
//       {
//         partnerX: {
//           id: 84,
//         },
//         partnerY: {
//           id: 90,
//         },
//         event_id: 88,
//         round_number: 3,
//       },
//       {
//         partnerX: {
//           id: 84,
//         },
//         partnerY: {
//           id: 85,
//         },
//         event_id: 77,
//         round_number: 1,
//       },
//       {
//         partnerX: {
//           id: 84,
//         },
//         partnerY: {
//           id: 86,
//         },
//         event_id: 36,
//         round_number: 2,
//       },
//       {
//         partnerX: {
//           id: 84,
//         },
//         partnerY: {
//           id: 87,
//         },
//         event_id: 77,
//         round_number: 3,
//       },
//       {
//         partnerX: {
//           id: 85,
//         },
//         partnerY: {
//           id: 87,
//         },
//         event_id: 36,
//         round_number: 2,
//       },
//       {
//         partnerX: {
//           id: 85,
//         },
//         partnerY: {
//           id: 87,
//         },
//         event_id: 77,
//         round_number: 2,
//       },
//       {
//         partnerX: {
//           id: 85,
//         },
//         partnerY: {
//           id: 86,
//         },
//         event_id: 36,
//         round_number: 3,
//       },
//       {
//         partnerX: {
//           id: 85,
//         },
//         partnerY: {
//           id: 89,
//         },
//         event_id: 77,
//         round_number: 3,
//       },
//       {
//         partnerX: {
//           id: 86,
//         },
//         partnerY: {
//           id: 87,
//         },
//         event_id: 77,
//         round_number: 1,
//       },
//       {
//         partnerX: {
//           id: 116,
//         },
//         partnerY: {
//           id: 175,
//         },
//         event_id: 92,
//         round_number: 4,
//       },
//       {
//         partnerX: {
//           id: 116,
//         },
//         partnerY: {
//           id: 90,
//         },
//         event_id: 97,
//         round_number: 3,
//       },
//       {
//         partnerX: {
//           id: 116,
//         },
//         partnerY: {
//           id: 190,
//         },
//         event_id: 93,
//         round_number: 2,
//       },
//       {
//         partnerX: {
//           id: 116,
//         },
//         partnerY: {
//           id: 185,
//         },
//         event_id: 97,
//         round_number: 4,
//       },
//       {
//         partnerX: {
//           id: 116,
//         },
//         partnerY: {
//           id: 85,
//         },
//         event_id: 94,
//         round_number: 3,
//       },
//       {
//         partnerX: {
//           id: 116,
//         },
//         partnerY: {
//           id: 85,
//         },
//         event_id: 93,
//         round_number: 1,
//       },
//       {
//         partnerX: {
//           id: 175,
//         },
//         partnerY: {
//           id: 182,
//         },
//         event_id: 97,
//         round_number: 2,
//       },
//       {
//         partnerX: {
//           id: 175,
//         },
//         partnerY: {
//           id: 84,
//         },
//         event_id: 92,
//         round_number: 1,
//       },
//       {
//         partnerX: {
//           id: 175,
//         },
//         partnerY: {
//           id: 84,
//         },
//         event_id: 90,
//         round_number: 5,
//       },
//       {
//         partnerX: {
//           id: 175,
//         },
//         partnerY: {
//           id: 90,
//         },
//         event_id: 92,
//         round_number: 5,
//       },
//       {
//         partnerX: {
//           id: 175,
//         },
//         partnerY: {
//           id: 90,
//         },
//         event_id: 90,
//         round_number: 3,
//       },
//       {
//         partnerX: {
//           id: 175,
//         },
//         partnerY: {
//           id: 90,
//         },
//         event_id: 97,
//         round_number: 4,
//       },
//       {
//         partnerX: {
//           id: 175,
//         },
//         partnerY: {
//           id: 182,
//         },
//         event_id: 92,
//         round_number: 2,
//       },
//       {
//         partnerX: {
//           id: 175,
//         },
//         partnerY: {
//           id: 182,
//         },
//         event_id: 90,
//         round_number: 4,
//       },
//       {
//         partnerX: {
//           id: 175,
//         },
//         partnerY: {
//           id: 182,
//         },
//         event_id: 88,
//         round_number: 4,
//       },
//       {
//         partnerX: {
//           id: 175,
//         },
//         partnerY: {
//           id: 183,
//         },
//         event_id: 88,
//         round_number: 3,
//       },
//       {
//         partnerX: {
//           id: 175,
//         },
//         partnerY: {
//           id: 185,
//         },
//         event_id: 92,
//         round_number: 3,
//       },
//       {
//         partnerX: {
//           id: 175,
//         },
//         partnerY: {
//           id: 185,
//         },
//         event_id: 97,
//         round_number: 5,
//       },
//       {
//         partnerX: {
//           id: 181,
//         },
//         partnerY: {
//           id: 90,
//         },
//         event_id: 90,
//         round_number: 5,
//       },
//       {
//         partnerX: {
//           id: 181,
//         },
//         partnerY: {
//           id: 84,
//         },
//         event_id: 90,
//         round_number: 4,
//       },
//       {
//         partnerX: {
//           id: 181,
//         },
//         partnerY: {
//           id: 182,
//         },
//         event_id: 90,
//         round_number: 1,
//       },
//       {
//         partnerX: {
//           id: 182,
//         },
//         partnerY: {
//           id: 84,
//         },
//         event_id: 92,
//         round_number: 5,
//       },
//       {
//         partnerX: {
//           id: 182,
//         },
//         partnerY: {
//           id: 84,
//         },
//         event_id: 90,
//         round_number: 3,
//       },
//       {
//         partnerX: {
//           id: 182,
//         },
//         partnerY: {
//           id: 185,
//         },
//         event_id: 97,
//         round_number: 6,
//       },
//       {
//         partnerX: {
//           id: 182,
//         },
//         partnerY: {
//           id: 84,
//         },
//         event_id: 89,
//         round_number: 1,
//       },
//       {
//         partnerX: {
//           id: 182,
//         },
//         partnerY: {
//           id: 183,
//         },
//         event_id: 88,
//         round_number: 5,
//       },
//       {
//         partnerX: {
//           id: 182,
//         },
//         partnerY: {
//           id: 90,
//         },
//         event_id: 90,
//         round_number: 2,
//       },
//       {
//         partnerX: {
//           id: 182,
//         },
//         partnerY: {
//           id: 84,
//         },
//         event_id: 88,
//         round_number: 1,
//       },
//       {
//         partnerX: {
//           id: 182,
//         },
//         partnerY: {
//           id: 90,
//         },
//         event_id: 89,
//         round_number: 2,
//       },
//       {
//         partnerX: {
//           id: 182,
//         },
//         partnerY: {
//           id: 90,
//         },
//         event_id: 92,
//         round_number: 4,
//       },
//       {
//         partnerX: {
//           id: 182,
//         },
//         partnerY: {
//           id: 185,
//         },
//         event_id: 92,
//         round_number: 1,
//       },
//       {
//         partnerX: {
//           id: 183,
//         },
//         partnerY: {
//           id: 84,
//         },
//         event_id: 88,
//         round_number: 2,
//       },
//       {
//         partnerX: {
//           id: 183,
//         },
//         partnerY: {
//           id: 90,
//         },
//         event_id: 88,
//         round_number: 1,
//       },
//       {
//         partnerX: {
//           id: 185,
//         },
//         partnerY: {
//           id: 84,
//         },
//         event_id: 92,
//         round_number: 4,
//       },
//       {
//         partnerX: {
//           id: 185,
//         },
//         partnerY: {
//           id: 90,
//         },
//         event_id: 97,
//         round_number: 1,
//       },
//       {
//         partnerX: {
//           id: 190,
//         },
//         partnerY: {
//           id: 84,
//         },
//         event_id: 94,
//         round_number: 3,
//       },
//       {
//         partnerX: {
//           id: 190,
//         },
//         partnerY: {
//           id: 84,
//         },
//         event_id: 93,
//         round_number: 1,
//       },
//     ]
//     const variablesArr = []

//     rounds.forEach((round) => {
//       variablesArr.push({
//         user_id: round.partnerX.id,
//         partner_id: round.partnerY.id,
//         event_id: round.event_id,
//         round: round.round_number,
//         partner_shared_details: true,
//         i_shared_details: true,
//       })

//       variablesArr.push({
//         user_id: round.partnerY.id,
//         partner_id: round.partnerX.id,
//         event_id: round.event_id,
//         round: round.round_number,
//         partner_shared_details: true,
//         i_shared_details: true,
//       })
//     })
//     // write to partners table
//     const bulkInsertPartnersRes = await orm.request(bulkInsertPartners, {
//       objects: variablesArr,
//     })
//     console.log('insertPartners -> bulkInsertPartnersRes', bulkInsertPartnersRes)

//     if (bulkInsertPartnersRes.errors) {
//       throw new Error(bulkInsertPartnersRes.errors[0].message)
//     }
//   } catch (error) {
//     console.log('error = ', error)
//   }
// }

// insertPartners()

module.exports = app
