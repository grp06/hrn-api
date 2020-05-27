require('dotenv').config()
const cors = require('cors')
const express = require('express')
const morgan = require('morgan')
const { NODE_ENV, PORT } = require('./config.js')
const bodyParser = require('body-parser')
const roomsRouter = require('./routes/rooms/rooms-router')
const tokenRouter = require('./routes/twilio-token/twilio-token-router')
const usersRouter = require('./routes/users/users-router')
const authRouter = require('./routes/auth/auth-router')
const emailRouter = require('./routes/email/email-router')
const app = express()
const sgMail = require('@sendgrid/mail');
import { startServer } from './server-graphql'
// import { emailRouter } from './routes/email/email-router'

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
app.use('/api/signup', usersRouter)
app.use('/api/auth', authRouter)
// app.use('/api/reset_password', emailRouter)

app.use('/password_reset', emailRouter)
// app.post('/email', async (req, res) => {

//   try {
//     sgMail.setApiKey(process.env.SENDGRID_API_KEY);
//     const msg = {
//       to: 'kevin.dan.rob@gmail.com',
//       from: 'kevinrobinsondeveloper@gmail.com',
//       subject: 'Sending with Twilio SendGrid is Fun',
//       text: 'and easy to do anywhere, even with Node.js',
//       html: '<strong>and easy to do anywhere, even with Node.js</strong>',
//     };
//     await sgMail.send(msg)
//     res.send('cool')
//   } catch {
//     console.log('not right');
//   }



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
