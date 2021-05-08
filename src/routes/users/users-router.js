import * as Sentry from '@sentry/node'

import { channel } from '../../discord-bots/new-host'
import { createToken } from '../../extensions/jwtHelper'
import { signUp, updateUserRole } from '../../gql/mutations'
import { findUserByEmail } from '../../gql/queries'
import { hashPassword } from '../../services/auth-service'
import { signUpConfirmation } from '../../services/email-service'
import orm from '../../services/orm'
import UsersService from './users-service'

const express = require('express')

const usersRouter = express.Router()
const jsonBodyParser = express.json()
const { NODE_ENV } = require('../../config')

usersRouter.post('/', jsonBodyParser, async (req, res) => {
  const { first_name, last_name, email, password, role } = req.body
  console.log('req.body at root /signup', req.body)

  for (const field of ['first_name', 'last_name', 'email', 'password', 'role'])
    if (!req.body[field]) {
      return res.status(400).json({
        error: `Missing '${field}' in request body`,
      })
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
    const checkEmailRequest = await orm.request(findUserByEmail, { email: email })
    existingUser = checkEmailRequest.data.users[0]
    console.log('checkEmailRequest', checkEmailRequest)

    if (existingUser) {
      const message = 'Email already in use'
      Sentry.captureMessage(message)
      return res.status(400).json({ error: message })
    }
  } catch (error) {
    Sentry.captureException(error)
    console.log('error: ', error)

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
    Sentry.captureException(error)
    return res.status(500).json({
      error,
    })
  }

  // send token and user details
  __logger.info(`User with email ${email} created`)
  try {
    return res.status(201).json({
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

usersRouter.get('/get-anonymous-token', async (req, res) => {
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

module.exports = usersRouter
