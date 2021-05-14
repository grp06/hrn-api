import * as Sentry from '@sentry/node'

import { createToken } from '../../extensions/jwtHelper'
import { findUserByEmail } from '../../gql/queries'
import { comparePasswords } from '../../services/auth-service'
import orm from '../../services/orm'

const express = require('express')

const authRouter = express.Router()

authRouter.post('/get-login-details', async (req, res) => {
  const { email, password } = req.body.input.input

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
      return res.status(400).json({ message: 'Incorrect email or password' })
    }

    // compare passwords with hashing
    const passwordCheck = await comparePasswords(loginUser.password, dbUser.password)

    if (!passwordCheck) {
      return res.status(400).json({
        message: 'Incorrect user_name or password',
      })
    }
  } catch (error) {
    console.log('Error logging in', error)
    Sentry.captureException(error)
    return res.status(500).json({
      message: 'There was an error logging in',
    })
  }

  console.log(dbUser)

  return res.json({
    token: await createToken(dbUser, process.env.SECRET),
    role: dbUser.role,
    id: dbUser.id,
  })
})

authRouter.post('/get-anonymous-token', async (req, res) => {
  try {
    return res.json({
      token: await createToken({ id: null, email: null, role: 'anonymous' }, process.env.SECRET),
    })
  } catch (error) {
    Sentry.captureException(error)
    return res.status(400).json({
      error,
    })
  }
})

module.exports = authRouter
