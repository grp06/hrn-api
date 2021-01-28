import * as Sentry from '@sentry/node'
import orm from '../../services/orm'
import { findUserByEmail, findUserByPhoneNumber, findUserByUsername } from '../../gql/queries'
import { signUp, signUpNew, insertEventUserNew } from '../../gql/mutations'
import { createToken } from '../../extensions/jwtHelper'
import UsersService from '../users/users-service'
import { signUpConfirmation } from '../../services/email-service'
import { hashPassword } from '../../services/auth-service'
import { sendConfirmationText } from '../sms/sms-helpers'

const express = require('express')

const usersNewRouter = express.Router()
const jsonBodyParser = express.json()

usersNewRouter.post('/', jsonBodyParser, async (req, res) => {
  const {
    cash_app,
    email,
    name,
    password,
    phone_number,
    role,
    venmo,
    chitChat,
    username,
  } = req.body

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

  const usernameError = UsersService.validateUsername(username)
  if (usernameError) return res.status(400).json({ error: usernameError })

  if (role === 'fan') {
    let existingPhoneNumber
    let existingUsername
    try {
      const checkPhoneNumberRequest = await orm.request(findUserByPhoneNumber, { phone_number })
      console.log('🚀 ~ usersNewRouter.post ~ phone_number', phone_number)
      console.log('🚀 ~ usersNewRouter.post ~ checkPhoneNumberRequest', checkPhoneNumberRequest)
      existingPhoneNumber = checkPhoneNumberRequest.data.users_new[0]
      console.log('existingPhoneNumber', existingPhoneNumber)

      if (existingPhoneNumber) {
        const message = 'Phone Number already in use'
        Sentry.captureMessage(message)
        return res.status(400).json({ error: message })
      }
      const checkUsernameRequest = await orm.request(findUserByUsername, { username })
      console.log('🚀 ~ usersNewRouter.post ~ username', username)
      console.log('🚀 ~ usersNewRouter.post ~ checkUsernameRequest', checkUsernameRequest)
      existingUsername = checkUsernameRequest.data.users_new[0]
      console.log('existingUsername', existingUsername)

      if (existingUsername) {
        const message = 'Username already in use'
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

    let hashedPassword
    try {
      hashedPassword = await hashPassword(password)
    } catch (error) {
      Sentry.captureException(error)
      return res.status(500).json({
        error,
      })
    }

    const userObject = { name, phone_number, username, role: 'fan', password: hashedPassword }
    console.log('userObject ->', { userObject })
    const variables = { objects: [userObject] }
    let newFan

    // insert user into db
    try {
      const insertUserResult = await orm.request(signUpNew, variables)
      console.log('🚀 ~ usersNewRouter.post ~ insertUserResult', insertUserResult)

      newFan = insertUserResult.data.insert_users_new.returning[0]

      const eventUsersNewRes = await orm.request(insertEventUserNew, {
        event_id: chitChat.id,
        user_id: newFan.id,
      })

      if (eventUsersNewRes.errors) {
        throw new Error(eventUsersNewRes.errors[0].message)
      }

      await sendConfirmationText({ newFan, chitChat, eventUsersNewRes })
    } catch (error) {
      console.log('error', error)
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
        ...UsersService.serializeUser(newFan),
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
  console.log('🚀 ~ usersNewRouter.post ~ variables', variables)

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

module.exports = usersNewRouter
