import * as Sentry from '@sentry/node'
import { startServer } from './server-graphql'

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
app.use('/api/password_reset', emailRouter)
app.get('/', (req, res) => {
  res.send('Looks like the HiRightNow API is working!')
})

app.get('/debug-sentry', function mainHandler(req, res) {
  throw new Error('My first Sentry error!')
})

// The error handler must be before any other error middleware
app.use(Sentry.Handlers.errorHandler())

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

// app.use((req, res, next) => {
//   const error = new Error('Not Found!')
//   error.status = 404
//   next(error)
// })

// app.use((error, req, res, next) => {
//   res.status(error.status || 500)
//   res.json({
//     error: {
//       message: error.message,
//     },
//   })
// })

module.exports = app
