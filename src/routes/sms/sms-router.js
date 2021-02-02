import * as Sentry from '@sentry/node'
import jwt from 'jsonwebtoken'
import client from '../../extensions/twilioClient'
import { findUserByPhoneNumber, findUserNewById } from '../../gql/queries'
import { getPasswordResetURL } from '../../modules/email'
import orm from '../../services/orm'
import UsersService from '../users/users-service'
import { createToken } from '../../extensions/jwtHelper'
import { hashPassword } from '../../services/auth-service'
import { updatePasswordByUserNewId } from '../../gql/mutations'
import { sendPasswordResetText } from './sms-helpers'

const express = require('express')

const smsRouter = express.Router()
const hrnTwilioPhoneNumber = '+19518012833'

export const usePasswordHashToMakeToken = ({ password: passwordHash, id: userId, created_at }) => {
  const secret = `${passwordHash}-${created_at}`
  const token = jwt.sign({ userId }, secret, {
    expiresIn: 3600, // 1 hour
  })
  return token
}

smsRouter.post('/send-post-event-text', async (req, res) => {
  const recipientPhoneNumber = req.body.recipientPhoneNumber || '+13219176436'
  const recipientName = req.body.recipientName.split(' ')[0] || 'George'
  const celebName = req.body.celebName || 'Johhny Bravo'
  const celebVenmo = req.body.venmo
  const celebCashApp = req.body.cashApp
  let donationString
  if (celebVenmo && celebCashApp) {
    donationString = `Venmo: ${celebVenmo} or CashApp: ${celebCashApp}`
  } else if (!celebVenmo) {
    donationString = `CashApp: ${celebCashApp}`
  } else {
    donationString = `Venmo: ${celebVenmo}`
  }
  const messageContent = `Hey ${recipientName}, we hope you enjoyed your chat with ${celebName}!

You can can make a donation to ${celebName} via ${donationString}

Hope to see you again soon!
`

  try {
    client.messages
      .create({
        body: messageContent,
        from: hrnTwilioPhoneNumber,
        to: recipientPhoneNumber,
      })
      .then((message) => console.log(message.sid))
    return res.status(201).send({ success: 'true' })
  } catch (error) {
    return res.status(500).send({ error })
  }
})

smsRouter.post('/reset-password', async (req, res) => {
  const { phoneNumber } = req.body

  let user

  // find user
  try {
    const userResponse = await orm.request(findUserByPhoneNumber, { phoneNumber })
    user = userResponse.data.users_new[0]
    console.log('🚀 ~ smsRouter.post ~ user', user)
    if (!user) {
      return res.status(400).json({ error: 'No user with that email' })
    }
  } catch (err) {
    return res.status(404).json('Error finding user')
  }

  const { id, password, created_at } = user
  // make the relevant items to send in an email
  const token = usePasswordHashToMakeToken({ password, id, created_at })
  const url = getPasswordResetURL(user, token, true)

  try {
    await sendPasswordResetText({ user, url })
  } catch (error) {
    console.log('error = ', error)
    return res.status(400).json({ error })
  }

  return res.send('success!')
})

smsRouter.post('/set-new-password-via-sms/:userId/:token', async (req, res) => {
  const { userId, token } = req.params

  const { password } = req.body

  const passwordError = UsersService.validatePassword(password)

  if (passwordError) return res.status(400).json({ error: passwordError })

  // find user by ID
  let user
  try {
    const checkIdRequest = await orm.request(findUserNewById, { id: userId })

    user = checkIdRequest.data.users_new[0]

    if (!user) {
      return res.status(400).json({ error: 'No user with that phone number' })
    }
  } catch (err) {
    console.log('🚀 ~ smsRouter.post ~ err', err)
    return res.status(404).json({ error: 'Error finding user' })
  }

  let payload
  try {
    const secret = `${user.password}-${user.created_at}`
    payload = jwt.verify(token, secret)
  } catch (error) {
    return res.status(401).json({ error: 'couldnt verify token' })
  }

  if (payload.userId === user.id) {
    let hashedPassword
    let updatedUser

    try {
      hashedPassword = await hashPassword(password)
    } catch (error) {
      console.log('🚀 ~ smsRouter.post ~ error', error)
      return res.send('error hashing password')
    }

    // find user and update
    try {
      const userObject = { id: userId, newPassword: hashedPassword }
      const updatePasswordResult = await orm.request(updatePasswordByUserNewId, userObject)
      updatedUser = updatePasswordResult.data.update_users_new.returning[0]
    } catch (error) {
      return res.send('error inserting new password')
    }
    const newToken = await createToken(updatedUser, process.env.SECRET)
    return res.status(200).send({
      token: newToken,
      role: updatedUser.role,
      id: updatedUser.id,
    })
  }
  return res.status(404).json({ error: 'Something went wrong with the link you used.' })
})

smsRouter.post('/send-event-started-reminder', async (req, res) => {
  const { chitChatRSVPs, chitChat } = req.body

  const { host } = chitChat
  const { name: hostName } = host
  const hostFirstName = hostName.split(' ')[0]

  const messageContent = `Hey   ${hostFirstName}'s event just started. Get there soon!`

  const sendMessage = async (eventUser) => {
    await client.messages
      .create({
        body: messageContent,
        from: hrnTwilioPhoneNumber,
        to: eventUser.user.phone_number,
      })
      .then((message) => console.log('text message sent'))
  }
  const promises = []

  chitChatRSVPs.forEach((eventUser) => {
    promises.push(sendMessage(eventUser))
  })

  try {
    await Promise.all(promises)
  } catch (error) {
    return res.status(200).send({
      error: 'error sending text messages',
    })
  }
  return res.status(200).send({ success: true })
})

module.exports = smsRouter
