require('dotenv').config({ path: __dirname + '/.env' })
const cors = require('cors')
const express = require('express')
const morgan = require('morgan')
const { NODE_ENV } = require('./config.js')
const bodyParser = require('body-parser')
const roomsRouter = require('./routes/rooms/rooms-router')
const tokenRouter = require('./routes/twilio-token/twilio-token-router')
const app = express()
// import { startServer } from './server-graphql'

const morganOption = NODE_ENV === 'production' ? 'tiny' : 'common'

app.use(
  bodyParser.urlencoded({
    extended: true,
  })
)
app.use(bodyParser.json())
app.use(morgan(morganOption))
app.use(cors())
// startServer(app, 8000)
// console.log(`Apollo :${port}/graphql`)
app.use('/api/rooms', roomsRouter)
app.use('/api/token', tokenRouter)

// app.get('/api/rooms/yo', (req, res) => {
//   console.log('hello!')
//   res.send('wow')
// })

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

module.exports = app
