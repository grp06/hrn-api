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

const user = {
  id: 1,
  name: "bob",
  email: "bob@bob.com",
  role: "user"
}
app.get('/graphql/login', jsonBodyParser, (req, res, next) => {

  console.log('gql login');
  createToken(user, process.env.SECRET).then((data) => {
    console.log('thing', data);
    res.send(data)
  })

  // app.get('/token', jsonBodyParser, (req, res) => {

  //   createToken(user, process.env.SECRET).then((data) => {
  //     console.log('thing', data);
  //     res.send(data)
  //   })
  



  // const sub = 'bozxcxzcb'
  // const payload = {
  //   user_id: 1,
  //   iat: Date.now() / 1000,
  // }
  // res.send({
  //   payload,
  //   authToken: AuthService.createJwt(sub, payload)
  // });
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
