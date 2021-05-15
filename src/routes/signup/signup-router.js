import * as Sentry from '@sentry/node'

import { createToken } from '../../extensions/jwtHelper'
import { signUp, completeUserProfile } from '../../gql/mutations'
import { findUserByEmail } from '../../gql/queries'
import { hashPassword } from '../../services/auth-service'
import { signUpConfirmation } from '../../services/email-service'
import orm from '../../services/orm'
import UsersService from './users-service'

const express = require('express')

const usersRouter = express.Router()

// Request Handler
usersRouter.post('/complete-user-profile', async (req, res) => {
  // get request input
  const { first_name: firstName, last_name: lastName, email, password, id } = req.body.input.input
  console.log('🚀 ~ usersRouter.post ~ req.body.input', req.body.input)

  for (const field of ['first_name', 'last_name', 'email', 'password'])
    if (!req.body.input.input[field]) {
      return res.status(400).json({
        message: `Missing '${field}' in request body`,
      })
    }

  // name, email, password validation

  // add logging for these errors?

  const nameError = UsersService.validateName(firstName)
  if (nameError) return res.status(400).json({ message: nameError })

  const emailError = UsersService.validateEmail(email)
  if (emailError) return res.status(400).json({ message: emailError })

  const passwordError = UsersService.validatePassword(password)
  if (passwordError) return res.status(400).json({ message: passwordError })

  // check if user with email exists
  let existingUser
  try {
    const checkEmailRequest = await orm.request(findUserByEmail, { email })
    existingUser = checkEmailRequest.data.users[0]
    console.log('checkEmailRequest', checkEmailRequest)

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
    console.log('🚀 ~ usersRouter.post ~ error', error)
    return res.status(500).json({
      error,
    })
  }

  const variables = { firstName, lastName, email, password: hashedPassword, id }
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

export default usersRouter
