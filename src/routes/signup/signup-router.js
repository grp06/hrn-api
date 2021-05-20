import * as Sentry from '@sentry/node'

import { createToken } from '../../extensions/jwtHelper'
import { insertUser, insertRoomUser, completeUserProfile } from '../../gql/mutations'
import { findUserByEmail } from '../../gql/queries'
import { hashPassword } from '../../services/auth-service'
import orm from '../../services/orm'
import UsersService from './users-service'

const express = require('express')

const usersRouter = express.Router()

// Request Handler
usersRouter.post('/complete-user-profile', async (req, res) => {
  // get request input
  const { first_name, last_name, email, password, id } = req.body.input.input
  console.log('🚀 ~ usersRouter.post ~ req.body.input', req.body.input)

  for (const field of ['first_name', 'last_name', 'email', 'password']) {
    if (!req.body.input.input[field]) {
      return res.status(400).json({
        error: `Missing '${field}' in request body`,
      })
    }
  }

  // name, email, password validation

  // add logging for these errors?

  const nameError = UsersService.validateName(first_name)
  if (nameError) return res.status(400).json({ error: nameError })

  const emailError = UsersService.validateEmail(email)
  if (emailError) return res.status(400).json({ error: emailError })

  const passwordError = UsersService.validatePassword(password)
  if (passwordError) return res.status(400).json({ error: passwordError })

  // check if user with email exists
  let existingUser
  try {
    const checkEmailRequest = await orm.request(findUserByEmail, { email })
    existingUser = checkEmailRequest.data.users[0]
    console.log('checkEmailRequest', checkEmailRequest)

    if (existingUser) {
      const error = 'Email already in use'
      Sentry.captureMessage(console.error())
      return res.status(400).json({ error })
    }
  } catch (error) {
    Sentry.captureException(error)
    console.log('message: ', error)

    return res.status(500).json({
      error,
    })
  }

  // hash the password
  let hashedPassword
  try {
    hashedPassword = await hashPassword(password)
  } catch (error) {
    Sentry.captureException(error)
    console.log('🚀 ~ usersRouter.post ~ error', error)
    return res.status(500).json({
      error,
    })
  }

  const variables = { first_name, last_name, email, password: hashedPassword, id }
  let updatedUser

  // insert user into db
  try {
    const updatedUserResult = await orm.request(completeUserProfile, variables)
    console.log('🚀 ~ usersRouter.post ~ updatedUserResult', updatedUserResult)

    updatedUser = updatedUserResult.data.update_users.returning[0]
    console.log('updatedUser', updatedUser)
  } catch (error) {
    Sentry.captureException(error)
    console.log('🚀 ~ usersRouter.post ~ error', error)
    return res.status(500).json({
      error,
    })
  }

  // send token and user details
  __logger.info(`User with email ${email} updated`)
  try {
    return res.json({
      token: await createToken(updatedUser, process.env.SECRET),
      ...UsersService.serializeUser(updatedUser),
    })
  } catch (error) {
    Sentry.captureException(error)
    return res.status(500).json({
      error,
    })
  }
})

usersRouter.post('/create-guest-user', async (req, res) => {
  // get request input
  const { firstName, roomId } = req.body.input
  try {
    const insertUserReq = await orm.request(insertUser, {
      objects: {
        first_name: firstName,
      },
    })

    const createdUser = insertUserReq.data.insert_users.returning[0]
    if (insertUserReq.errors) {
      throw new Error(insertUserReq.errors[0].message)
    }
    const userId = insertUserReq.data.insert_users.returning[0].id
    const insertRoomUserRes = await orm.request(insertRoomUser, {
      objects: {
        room_id: roomId,
        user_id: userId,
      },
    })

    if (insertRoomUserRes.errors) {
      throw new Error(insertRoomUserRes.errors[0].message)
    }

    // success
    return res.json({
      error: null,
      token: await createToken(createdUser, process.env.SECRET),
      ...createdUser,
    })
  } catch (error) {
    return res.status(400).json({
      error,
    })
  }
})

usersRouter.post('/fetch-user-by-token', async (req, res) => {
  // get request input
  console.log('req.body.input = ', req.body.input)
  console.log('req.body.session_variables = ', req.body.session_variables)

  // run some business logic

  /*
  // In case of errors:
  return res.status(400).json({
    message: "error happened"
  })
  */

  // success
  return res.json({
    created_at: '<value>',
    email: '<value>',
    error: '<value>',
    first_name: '<value>',
    id: '<value>',
    last_name: '<value>',
    role: '<value>',
    token: '<value>',
  })
})
export default usersRouter
