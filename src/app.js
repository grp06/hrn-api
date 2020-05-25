require('dotenv').config()
const cors = require('cors')
const express = require('express')
const morgan = require('morgan')
const { NODE_ENV, PORT } = require('./config.js')
const bodyParser = require('body-parser')
const roomsRouter = require('./routes/rooms/rooms-router')
const tokenRouter = require('./routes/twilio-token/twilio-token-router')
const app = express()
import orm from './services/orm'
const AuthService = require('./services/auth-service')
import { startServer } from './server-graphql'
import { createToken } from './extensions/jwtHelper'
import { users } from './resolvers/user'
import getUsers from './gql/queries/users/getUsers'
import findUserByEmail from './gql/queries/users/findUserByEmail'

const morganOption = NODE_ENV === 'production' ? 'tiny' : 'common'

const jsonBodyParser = express.json()
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

app.get('/users', (req, res) => {
  console.log('/users endpoint')
  const stuff = users
  res.json(stuff)
})

app.post('/signup', async (req, res) => {
  const { email } = req.body
  console.log('email', email)
  let user
  const emailRequest = await orm.request(findUserByEmail, { email: email })

  user = emailRequest.data.users[0]
  console.log(user)

  if (user) {
    console.log('error!!')
    res.send(500).status('does not compute')
  }
  res.status(200).json(user)
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
