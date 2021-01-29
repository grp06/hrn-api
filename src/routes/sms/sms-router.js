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

const express = require('express')

const smsRouter = express.Router()
const hrnTwilioPhoneNumber = '+19518012833'

smsRouter.post('/send-ten-minute-reminder-text', async (req, res) => {
  console.log('hey')
  const recipientPhoneNumber = req.body.recipientPhoneNumber || '+13219176436'
  const recipientName = req.body.recipientName.split(' ')[0] || 'George'
  const celebName = req.body.celebName || 'Johhny Bravo'
  const eventId = req.body.eventId || 47
  const messageContent = `Hey ${recipientName}, in about 10 minutes you get to meet ${celebName}!

You can wait for your turn here: https://launch.hirightnow.co/meet-and-greet/${eventId}.

Reminder, this meet and greet a donation based event, so you can make a donation to ${celebName} right after your chat via Venmo or Cash app. See you soon!`

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

smsRouter.post('/send-post-event-text', async (req, res) => {
  console.log('hey')
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

export const usePasswordHashToMakeToken = ({ password: passwordHash, id: userId, created_at }) => {
  const secret = `${passwordHash}-${created_at}`
  const token = jwt.sign({ userId }, secret, {
    expiresIn: 3600, // 1 hour
  })
  return token
}

smsRouter.post('/reset-password', async (req, res) => {
  const { phoneNumber } = req.body

  let user

  // find user
  try {
    const userResponse = await orm.request(findUserByPhoneNumber, { phoneNumber })
    user = userResponse.data.users_new[0]
    if (!user) {
      return res.status(400).json({ error: 'No user with that email' })
    }
  } catch (err) {
    return res.status(404).json('Error finding user')
  }

  // make the relevant items to send in an email
  const token = usePasswordHashToMakeToken(user)
  console.log('🚀 ~ smsRouter.post ~ token', token)
  const url = getPasswordResetURL(user, token)
  console.log('🚀 ~ smsRouter.post ~ url', url)

  // send email
  // try {
  //   sgMail.setApiKey(process.env.SENDGRID_API_KEY)

  //   const sendRes = await sgMail.send(emailTemplate)
  // } catch (error) {
  //   return res.status(400).json({ error: error.response.body.errors[0].message })
  // }
  return res.send('secucces')
})

smsRouter.post('/set-new-password/:userId/:token', async (req, res) => {
  const { userId, token } = req.params
  console.log('🚀 ~ smsRouter.post ~ token', token)
  console.log('🚀 ~ smsRouter.post ~ userId', userId)

  const { password } = req.body
  console.log('🚀 ~ smsRouter.post ~ req.body', req.body)
  console.log('🚀 ~ smsRouter.post ~ password', password)

  const passwordError = UsersService.validatePassword(password)
  console.log('🚀 ~ smsRouter.post ~ passwordError', passwordError)
  if (passwordError) return res.status(400).json({ error: passwordError })

  // find user by ID
  let user
  try {
    const checkIdRequest = await orm.request(findUserNewById, { id: userId })
    console.log('🚀 ~ smsRouter.post ~ checkIdRequest', checkIdRequest)
    user = checkIdRequest.data.users_new[0]
    console.log('🚀 ~ smsRouter.post ~ user', user)
    if (!user) {
      console.log('🚀 ~ smsRouter.post ~ user', user)
      return res.status(400).json({ error: 'No user with that phone number' })
    }
  } catch (err) {
    return res.status(404).json({ error: 'Error finding user' })
  }

  let payload
  try {
    const secret = `${user.password}-${user.created_at}`
    console.log('🚀 ~ smsRouter.post ~ token', token)
    console.log('🚀 ~ smsRouter.post ~ secret', secret)
    payload = jwt.verify(token, secret)
    console.log('🚀 ~ smsRouter.post ~ payload', payload)
  } catch (error) {
    console.log('🚀 ~ smsRouter.post ~ error', error)
    return res.status(401).json({ error: 'Unauthorized request' })
  }

  if (payload.userId === user.id) {
    let hashedPassword
    let updatedUser

    try {
      hashedPassword = await hashPassword(password)
      console.log('🚀 ~ smsRouter.post ~ hashedPassword', hashedPassword)
    } catch (error) {
      return res.send('error hashing password')
    }

    // find user and update
    try {
      const userObject = { id: userId, newPassword: hashedPassword }
      const updatePasswordResult = await orm.request(updatePasswordByUserNewId, userObject)
      console.log('🚀 ~ smsRouter.post ~ updatePasswordResult', updatePasswordResult)

      updatedUser = updatePasswordResult.data.update_users_new.returning[0]
      console.log('🚀 ~ smsRouter.post ~ updatedUser', updatedUser)
    } catch (error) {
      return res.send('error inserting new password')
    }
    const newToken = await createToken(updatedUser, process.env.SECRET)
    console.log('🚀 ~ smsRouter.post ~ newToken', newToken)
    return res.status(200).send({
      token: newToken,
      role: updatedUser.role,
      id: updatedUser.id,
    })
  }
  return res.status(404).json({ error: 'Something went wrong with the link you used.' })
})

module.exports = smsRouter
