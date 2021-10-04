import * as Sentry from '@sentry/node'

import { createToken } from '../../extensions/jwtHelper'
import { findUserByEmail, findUserById } from '../../gql/queries'
import { comparePasswords } from '../../services/auth-service'
import orm from '../../services/orm'

const express = require('express')

const authRouter = express.Router()

authRouter.post('/login', async (req, res) => {
  const { email, password } = req.body.input.input

  const loginUser = { email, password }

  let dbUser

  // is the await functionality correct here?
  try {
    // check if user with email exists
    const checkEmailRequest = await orm.request(findUserByEmail, { email: email })
    dbUser = checkEmailRequest.data.users[0]
    console.log('🚀 ~ authRouter.post ~ dbUser', dbUser)

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
  delete dbUser.password
  console.log(dbUser)

  return res.json({
    token: await createToken(dbUser, process.env.SECRET),
    userId: dbUser.id,
  })
})

authRouter.post('/get-anonymous-token', async (req, res) => {
  console.log('get anonymous token')
  console.log('inside anonymous token')
  try {
    return res.json({
      token: await createToken({ id: null, email: null, role: 'anonymous' }, process.env.SECRET),
    })
  } catch (error) {
    console.log('🚀 ~ authRouter.post ~ error', error)
    Sentry.captureException(error)
    return res.status(400).json({
      message: error,
    })
  }
})

authRouter.post('/fetch-user-by-token', async (req, res) => {
  console.log('fetch user by token')
  const userId = req.body.session_variables['x-hasura-user-id']
  try {
    const findUserByIdReq = await orm.request(findUserById, {
      id: userId,
    })
    const user = findUserByIdReq.data.users[0]
    if (findUserByIdReq.errors) {
      Sentry.captureException(findUserByIdReq.errors[0].message)
      // TODO: find another way to throw the error, because we're inside of a try/catch
      throw new Error(findUserByIdReq.errors[0].message)
    }

    return res.json({
      token: await createToken(user, process.env.SECRET),
      userId,
    })
  } catch (error) {
    console.log('🚀 ~ authRouter.post ~ error', error)
    return res.status(400).json({
      message: "couldn't find user",
    })
  }
})

export default authRouter
