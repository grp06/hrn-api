require('dotenv').config()
const cors = require('cors')
const express = require('express')
const morgan = require('morgan')
const { NODE_ENV, PORT } = require('./config.js')
const bodyParser = require('body-parser')
const roomsRouter = require('./routes/rooms/rooms-router')
const tokenRouter = require('./routes/twilio-token/twilio-token-router')
const app = express()
const AuthService = require('./services/auth-service')
import { startServer } from './server-graphql'
import { createToken } from './extensions/jwtHelper'

const morganOption = NODE_ENV === 'production' ? 'tiny' : 'common'

const jsonBodyParser = express.json();
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
)
app.use(bodyParser.json())
app.use(morgan(morganOption))
app.use(cors())
startServer(app, 8000)
console.log(`Apollo :${PORT}/graphql`)
app.use('/api/rooms', roomsRouter)
app.use('/api/token', tokenRouter)

app.get('/token', jsonBodyParser, (req, res, next) => {

  const sub = 'bob'
  const payload = {
    user_id: 1,
    date_created: "2020-05-19T19:13:49.74303+00:00"
  }
  res.send({
    payload,
    authToken: AuthService.createJwt(sub, payload)
  });
}) 

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
