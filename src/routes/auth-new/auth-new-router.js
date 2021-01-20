import * as Sentry from '@sentry/node'
import orm from '../../services/orm'
import { findUserNewByEmail, findUserNewById } from '../../gql/queries'
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
    const checkEmailRequest = await orm.request(findUserNewByEmail, { email: email })
    dbUser = checkEmailRequest.data.users_new[0]

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

authRouter.post('/get-user-by-id', async (req, res) => {
  const { userId } = req.body

  if (!userId) {
    return res.status(400).json({
      error: `Missing 'userId' in request body`,
    })
  }

  try {
    const userRes = await orm.request(findUserNewById, { id: userId })

    if (!userRes) {
      return res.status(400).json({ error: 'Could not find user with that email' })
    }

    const userObj = userRes.data.users_new[0]

    return res.status(200).json({ userObj })
  } catch (error) {
    console.log('error = ', error)
    return res.status(500).json({
      error,
    })
  }
})

module.exports = authRouter
