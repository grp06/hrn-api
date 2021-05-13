import * as Sentry from '@sentry/node'

import { createToken } from '../../extensions/jwtHelper'
import { signUp } from '../../gql/mutations'
import { findUserByEmail } from '../../gql/queries'
import { hashPassword } from '../../services/auth-service'
import { signUpConfirmation } from '../../services/email-service'
import orm from '../../services/orm'
import UsersService from './users-service'

const express = require('express')

const usersRouter = express.Router()
const jsonBodyParser = express.json()

usersRouter.post('/', jsonBodyParser, async (req, res) => {
  const { first_name, last_name, email, password, role } = req.body.input.input
  console.log('🚀 ~ usersRouter.post ~ req.body', req.body)

  for (const field of ['first_name', 'last_name', 'email', 'password', 'role'])
    if (!req.body.input.input[field]) {
      return res.status(400).json({
        message: `Missing '${field}' in request body`,
      })
    }

  // name, email, password validation

  // add logging for these errors?

  const nameError = UsersService.validateName(first_name)
  if (nameError) return res.status(400).json({ message: nameError })

  const emailError = UsersService.validateEmail(email)
  if (emailError) return res.status(400).json({ message: emailError })

  const passwordError = UsersService.validatePassword(password)
  if (passwordError) return res.status(400).json({ message: passwordError })

  // check if user with email exists
  let existingUser
  try {
    const checkEmailRequest = await orm.request(findUserByEmail, { email })
    console.log('checkEmailRequest', checkEmailRequest)
    existingUser = checkEmailRequest.data.users[0]

    if (existingUser) {
      const message = 'Email already in use'
      Sentry.captureMessage(message)
      return res.status(400).json({ message })
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
    return res.status(500).json({
      error,
    })
  }

  const userObject = { first_name, last_name, email, password: hashedPassword, role }

  const variables = { objects: [userObject] }
  let newUser

  // insert user into db
  try {
    const insertUserResult = await orm.request(signUp, variables)

    newUser = insertUserResult.data.insert_users.returning[0]
    console.log('newUser', newUser)
    signUpConfirmation(newUser)
  } catch (error) {
    console.log('🚀 ~ usersRouter.post ~ error', error)
    Sentry.captureException(error)
    return res.status(500).json({
      error,
    })
  }

  // send token and user details
  __logger.info(`User with email ${email} created`)
  try {
    return res.json({
      token: await createToken(newUser, process.env.SECRET),
      ...UsersService.serializeUser(newUser),
    })
  } catch (error) {
    Sentry.captureException(error)
    return res.status(500).json({
      error,
    })
  }
})
usersRouter.post('/reset-password', async (req, res) => {
  const { email } = req.body
  if (!email) {
    return res.status(400).json({
      error: `Missing 'email' in request body`,
    })
  }

  let existingUser
  try {
    const checkEmailRequest = await orm.request(findUserByEmail, { email: email })
    existingUser = checkEmailRequest.data.users[0]

    if (!existingUser) {
      return res.status(400).json({ error: 'Could not find user with that email' })
    }
  } catch (error) {
    return res.status(500).json({
      error,
    })
  }
})

usersRouter.get('/get-anonymous-token', async (req, res) => {
  try {
    return res.status(201).json({
      token: await createToken({ id: null, email: null, role: 'anonymous' }, process.env.SECRET),
    })
  } catch (error) {
    Sentry.captureException(error)
    return res.status(500).json({
      error,
    })
  }
})

module.exports = usersRouter
