import * as Sentry from '@sentry/node'
import orm from '../../services/orm'
import { findUserByEmail, findUserByPhoneNumber } from '../../gql/queries'
import { signUp, signUpNew, updateUserRole } from '../../gql/mutations'
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
  const { cash_app, email, name, password, phone_number, role, venmo } = req.body
  console.log('req.body at root /signup', req.body)

  if (role === 'fan' && !req.body['phone_number'])
    return res.status(400).json({
      error: `Missing phone_number in request body`,
    })

  if (role === 'celeb' && !req.body['venmo'] && !req.body['cash_app'])
    return res.status(400).json({
      error: `Missing either venmo or cash_app in request body`,
    })

  if (role !== 'fan') {
    for (const field of ['name', 'email', 'password', 'role'])
      if (!req.body[field]) {
        return res.status(400).json({
          error: `Missing '${field}' in request body`,
        })
      }
  }

  // name, email, password validation

  // add logging for these errors?

  const nameError = UsersService.validateName(name)
  if (nameError) return res.status(400).json({ error: nameError })

  if (role === 'fan') {
    let existingFan
    try {
      const checkPhoneNumberRequest = await orm.request(findUserByPhoneNumber, { phone_number })
      existingFan = checkPhoneNumberRequest.data.users_new[0]
      console.log('checkPhoneNumberRequest', checkPhoneNumberRequest)

      if (existingFan) {
        const message = 'Phone Number already in use'
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

    const userObject = { name, phone_number, role: 'fan' }
    console.log('userObject ->', { userObject })
    const variables = { objects: [userObject] }
    let newFan
    console.log('🚀 ~ usersRouter.post ~ variables', variables)

    // insert user into db
    try {
      const insertUserResult = await orm.request(signUpNew, variables)
      console.log(insertUserResult)
      newFan = insertUserResult.data.insert_users_new.returning[0]
      console.log('newFan ->', newFan)
      //TODO Add signup confirmation with number instead of email
    } catch (error) {
      Sentry.captureException(error)
      return res.status(500).json({
        error,
      })
    }

    // send token and user details
    __logger.info(`Fan with phone number ${phone_number} created`)
    try {
      return res.status(201).json({
        token: await createToken(newFan, process.env.SECRET),
        // TODO serializeUser with Phone number instead of email
      })
    } catch (error) {
      Sentry.captureException(error)
      return res.status(500).json({
        error,
      })
    }
  }

  if (role !== 'fan') {
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

  const userObject =
    role === 'celeb'
      ? { name, email, password: hashedPassword, role, venmo, cash_app }
      : { name, email, password: hashedPassword, role }

  console.log({ userObject })

  const variables = { objects: [userObject] }
  let newUser
  console.log('🚀 ~ usersRouter.post ~ variables', variables)

  // insert user into db
  try {
    const insertUserResult =
      role === 'celeb'
        ? await orm.request(signUpNew, variables)
        : await orm.request(signUp, variables)
    console.log(insertUserResult)
    newUser =
      role === 'celeb'
        ? insertUserResult.data.insert_users_new.returning[0]
        : insertUserResult.data.insert_users.returning[0]
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
