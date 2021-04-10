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
  const { email, first_name, last_name, password, role } = req.body
  console.log('req.body at root /signup', req.body)

  // for (const field of requiredFields)
  //   if (!req.body[field]) {
  //     return res.status(400).json({
  //       error: `Missing '${field}' in request body`,
  //     })
  //   }

  // name, email, password validation

  // add logging for these errors?

  const emailError = UsersService.validateEmail(email)
  if (emailError) return res.status(400).json({ error: emailError })

  const firstNameError = UsersService.validateName(first_name)
  if (firstNameError) return res.status(400).json({ error: firstNameError })

  const lastNameError = UsersService.validateName(last_name)
  if (lastNameError) return res.status(400).json({ error: lastNameError })

  const passwordError = UsersService.validatePassword(password)
  if (passwordError) return res.status(400).json({ error: passwordError })

  // check if user with email exists
  try {
    const checkEmailRequest = await orm.request(findUserByEmail, { email: email })
    const existingUser = checkEmailRequest.data.users[0]
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

  const userObject = { email, first_name, last_name, password: hashedPassword, role }

  const variables = { objects: [userObject] }
  // insert user into db
  try {
    const insertUserResult = await orm.request(signUp, variables)

    const newUser = insertUserResult.data.insert_users.returning[0]
    console.log('newUser', newUser)
    signUpConfirmation(newUser)
    // send token and user details
    __logger.info(`User with email ${email} created`)
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

usersRouter.post('/reset-password', async (req, res) => {
  const { email } = req.body
  if (!email) {
    return res.status(400).json({
      error: `Missing 'email' in request body`,
    })
  }

  try {
    const checkEmailRequest = await orm.request(findUserByEmail, { email: email })
    const existingUser = checkEmailRequest.data.users[0]

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

usersRouter.post('/upgrade-to-host', async (req, res) => {
  const { userId } = req.body
  try {
    const userRoleResponse = await orm.request(updateUserRole, {
      user_id: userId,
      role: 'host',
      became_host_at: new Date().toISOString(),
    })
    const userObject = userRoleResponse.data.update_users.returning[0]
    const { name, email, city, linkedIn_url } = userObject
    if (NODE_ENV === 'production') {
      channel.send('🦦🦦🦦')
      channel.send('**New Host Signup!**')
      channel.send(`
\`\`\`
${name} from ${city}
${email} ... ${linkedIn_url || ''}
\`\`\``)
      channel.send('🦦🦦🦦')
    }

    return res.status(201).json({
      token: await createToken(userObject, process.env.SECRET),
    })
  } catch (error) {
    Sentry.captureException(error)
    return res.status(500).json({
      error,
    })
  }
})

module.exports = usersRouter
