import * as Sentry from '@sentry/node'
import orm from '../../services/orm'
import {
  findUserNewByEmail,
  findUserNewById,
  findUserByUsername,
  findUserByPhoneNumber,
} from '../../gql/queries'
import { createToken } from '../../extensions/jwtHelper'
import { comparePasswords } from '../../services/auth-service'

const express = require('express')

const authRouter = express.Router()
const jsonBodyParser = express.json()

authRouter.post('/login', jsonBodyParser, async (req, res, next) => {
  const { phone_number, usernameOrEmail, password } = req.body
  let email
  let username
  if (usernameOrEmail.indexOf('@') > -1) {
    email = usernameOrEmail.toLowerCase()
  } else {
    username = usernameOrEmail
  }

  const loginUser = { phone_number, username, email, password }

  let dbUser

  // is the await functionality correct here?
  try {
    if (username) {
      const checkUsernameRequest = await orm.request(findUserByUsername, { username })
      dbUser = checkUsernameRequest.data.users_new[0]
    }

    if (email) {
      const checkEmailRequest = await orm.request(findUserNewByEmail, { email: email })
      dbUser = checkEmailRequest.data.users_new[0]
    }

    if (phone_number) {
      const checkPhoneNumberRequest = await orm.request(findUserByPhoneNumber, { phone_number })
      dbUser = checkPhoneNumberRequest.data.users_new[0]
    }

    if (!dbUser) {
      return res.status(400).json({ error: 'Incorrect login info' })
    }

    // compare passwords with hashing
    const passwordCheck = await comparePasswords(loginUser.password, dbUser.password)

    if (!passwordCheck) {
      return res.status(400).json({
        error: 'Incorrect login info',
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
