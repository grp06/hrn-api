import * as Sentry from '@sentry/node'
import orm from '../../services/orm'
import { findUserByEmail } from '../../gql/queries'
import { signUp, updateUserRole } from '../../gql/mutations'
import { hashPassword } from '../../services/auth-service'
import { createToken } from '../../extensions/jwtHelper'
import UsersService from './users-service'
import { signUpConfirmation } from '../../services/email-service'
import { channel } from '../../discord-bots/new-host'
import { configure } from '../../logger'

const express = require('express')

const usersRouter = express.Router()
const jsonBodyParser = express.json()
const { NODE_ENV } = require('../../config')

usersRouter.post('/', jsonBodyParser, async (req, res) => {
  const { email, name, password, role } = req.body
  console.log('req.body at root /signup', req.body)

  const nameError = UsersService.validateName(name)
  if (nameError) return res.status(400).json({ error: nameError })

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

  const userObject = { name, email: email.toLowerCase(), password: hashedPassword, role }

  console.log({ userObject })

  const variables = { objects: [userObject] }
  let newUser
  console.log('🚀 ~ usersRouter.post ~ variables', variables)

  // insert user into db
  try {
    const insertUserResult = await orm.request(signUp, variables)

    console.log(insertUserResult)
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
