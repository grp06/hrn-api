import jwt from 'jsonwebtoken'

import { createToken } from '../../extensions/jwtHelper'
import { updatePasswordByUserId } from '../../gql/mutations'
import { findUserByEmail, findUserById } from '../../gql/queries'
import { getPasswordResetURL, resetPasswordTemplate } from '../../modules/email'
import { hashPassword } from '../../services/auth-service'
import orm from '../../services/orm'
import UsersService from '../signup/users-service'

const sgMail = require('@sendgrid/mail')
const express = require('express')

const emailRouter = express.Router()

const usePasswordHashToMakeToken = ({ password: passwordHash, id: userId, created_at }) => {
  const secret = `${passwordHash}-${created_at}`
  const token = jwt.sign({ userId }, secret, {
    expiresIn: 3600, // 1 hour
  })
  return token
}

emailRouter.post('/reset-password', async (req, res) => {
  const { email } = req.body.input
  console.log('🚀 ~ emailRouter.post ~ email', email)

  let user

  try {
    const checkEmailRequest = await orm.request(findUserByEmail, { email: email })
    user = checkEmailRequest.data.users[0]
    if (!user) {
      return res.status(400).json({ error: 'No user with that email' })
    }
  } catch (err) {
    return res.status(404).json('Error finding user')
  }

  // make the relevant items to send in an email
  const token = usePasswordHashToMakeToken(user)
  const url = getPasswordResetURL(user, token)
  console.log('🚀 ~ emailRouter.post ~ url', url)
  const emailTemplate = resetPasswordTemplate(user, url)

  // send email
  try {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY)
    await sgMail.send(emailTemplate)
  } catch (error) {
    console.log('🚀 ~ emailRouter.post ~ error', error)
    return res.status(400).json({ error: error.response.body.errors[0].message })
  }
  return res.json({ success: 'true' })
})

emailRouter.post('/set-new-password', async (req, res) => {
  const { userId, token, password } = req.body.input.input

  const passwordError = UsersService.validatePassword(password)
  if (passwordError) return res.status(400).json({ message: 'Password not valid' })

  // find user by ID
  let user
  try {
    const checkIdRequest = await orm.request(findUserById, { id: userId })
    console.log('🚀 ~ emailRouter.post ~ checkIdRequest', checkIdRequest)
    user = checkIdRequest.data.users[0]
    if (!user) {
      return res.status(400).json({ error: 'No user with that email' })
    }
  } catch (err) {
    console.log('🚀 ~ emailRouter.post ~ err', err)
    return res.status(404).json({ error: 'Error finding user' })
  }

  let payload
  try {
    const secret = `${user.password}-${user.created_at}`
    payload = jwt.verify(token, secret)
  } catch (error) {
    return res.status(401).json({ message: 'Unauthorized request' })
  }

  if (payload.userId === user.id) {
    let hashedPassword
    let updatedUser

    try {
      hashedPassword = await hashPassword(password)
    } catch (error) {
      return res.status(400).json({ message: 'error hashing password' })
    }

    // find user and update
    try {
      const userObject = { id: userId, newPassword: hashedPassword }
      const updatePasswordResult = await orm.request(updatePasswordByUserId, userObject)

      updatedUser = updatePasswordResult.data.update_users.returning[0]
    } catch (error) {
      return res.status(400).json({ message: 'error inserting new password' })
    }

    return res.json({
      token: await createToken(updatedUser, process.env.SECRET),
      role: updatedUser.role,
      id: updatedUser.id,
    })
  }
  return res.status(404).json({ error: 'Something went wrong with the link you used.' })
})

export default emailRouter
