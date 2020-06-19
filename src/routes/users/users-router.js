import * as Sentry from '@sentry/node'
import orm from '../../services/orm'
import { findUserByEmail } from '../../gql/queries/users/findUserByEmail'
import signUp from '../../gql/mutations/users/signUp'
import { hashPassword } from '../../services/auth-service'
import { createToken } from '../../extensions/jwtHelper'
import UsersService from './users-service'

const express = require('express')

const usersRouter = express.Router()
const jsonBodyParser = express.json()

usersRouter.post('/', jsonBodyParser, async (req, res) => {
  const { name, email, password, role } = req.body

  for (const field of ['name', 'email', 'password', 'role'])
    if (!req.body[field]) {
      return res.status(400).json({
        error: `Missing '${field}' in request body`,
      })
    }

  // password and email validation
  const emailError = UsersService.validateEmail(email)
  if (emailError) return res.status(400).json({ error: emailError })

  const passwordError = UsersService.validatePassword(password)
  if (passwordError) return res.status(400).json({ error: passwordError })

  // check if user with email exists
  let existingUser
  try {
    const checkEmailRequest = await orm.request(findUserByEmail, { email: email })
    existingUser = checkEmailRequest.data.users[0]

    if (existingUser) {
      const message = 'Email already in use'
      Sentry.captureMessage(message)
      return res.status(400).json({ message })
    }
  } catch (error) {
    Sentry.captureMessage(error)
    return res.status(500).json({
      error,
    })
  }

  // hash the password
  let hashedPassword
  try {
    hashedPassword = await hashPassword(password)
  } catch (error) {
    Sentry.captureMessage(error)
    return res.status(500).json({
      error,
    })
  }

  const userObject = { name, email, password: hashedPassword, role }

  const variables = { objects: [userObject] }
  let newUser

  // insert user into db
  try {
    const insertUserResult = await orm.request(signUp, variables)
    console.log('insertUserResult', insertUserResult)

    newUser = insertUserResult.data.insert_users.returning[0]
  } catch (error) {
    Sentry.captureMessage(error)
    return res.status(500).json({
      error,
    })
  }


  // send token and user details
  __logger.info(`User with email ${email} created`)
  console.log('last');
  try {
    return res.status(201).json({
      token: await createToken(newUser, process.env.SECRET),
      ...UsersService.serializeUser(newUser),
    })
  } catch (error) {
    Sentry.captureMessage(error)
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

module.exports = usersRouter
