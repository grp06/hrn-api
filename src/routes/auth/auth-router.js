import * as Sentry from '@sentry/node'
import orm from '../../services/orm'
import findUserByEmail from '../../gql/queries/users/findUserByEmail'
import { createToken } from '../../extensions/jwtHelper'
import { comparePasswords } from '../../services/auth-service'

const express = require('express')

const authRouter = express.Router()
const jsonBodyParser = express.json()

authRouter.post('/login', jsonBodyParser, async (req, res, next) => {
  const { email, password } = req.body
  const loginUser = { email, password }

  // make sure all keys are in request body
  for (const [key, value] of Object.entries(loginUser))
    if (value == null)
      return res.status(400).json({
        error: `Missing '${key}' in request body`,
      })

  let dbUser

  // is the await functionality correct here?
  try {
    // check if user with email exists
    const checkEmailRequest = await orm.request(findUserByEmail, { email: email })
    dbUser = checkEmailRequest.data.users[0]

    if (!dbUser) {
      return res.status(400).json({ error: 'Incorrect email or password' })
    }

    // compare passwords with hashing
    const passwordCheck = await comparePasswords(loginUser.password, dbUser.password)

    if (!passwordCheck) {
      return res.status(400).json({
        error: 'Incorrect user_name or password',
      })
    }
  } catch (error) {
    console.log('Error logging in', error)
    Sentry.captureException(error)
    return res.status(500).json({
      error: 'There was an error logging in',
    })
  }

  console.log(dbUser)
  return res.send({
    token: await createToken(dbUser, process.env.SECRET),
    role: dbUser.role,
    id: dbUser.id,
  })
})

module.exports = authRouter
