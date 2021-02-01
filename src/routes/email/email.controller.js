import jwt from 'jsonwebtoken'
import { getPasswordResetURL, resetPasswordTemplate, rsvpTemplate } from '../../modules/email'
import orm from '../../services/orm'
import { updatePasswordByUserId } from '../../gql/mutations'

import { hashPassword, verifyJwt } from '../../services/auth-service'
import { createToken } from '../../extensions/jwtHelper'
import UsersService from '../users/users-service'
import { findUserByEmail, findUserById } from '../../gql/queries'

const sgMail = require('@sendgrid/mail')
// `secret` is passwordHash concatenated with user's createdAt,
// so if someones gets a user token they still need a timestamp to intercept.
export const usePasswordHashToMakeToken = ({ password: passwordHash, id: userId, created_at }) => {
  const secret = `${passwordHash}-${created_at}`
  console.log('🚀 ~ usePasswordHashToMakeToken ~ secret', secret)
  const token = jwt.sign({ userId }, secret, {
    expiresIn: 3600, // 1 hour
  })
  return token
}

export const sendPasswordResetEmail = async (req, res) => {
  const { email } = req.params

  let user

  // find user
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
  const emailTemplate = resetPasswordTemplate(user, url)

  // send email
  try {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY)

    const sendRes = await sgMail.send(emailTemplate)
  } catch (error) {
    return res.status(400).json({ error: error.response.body.errors[0].message })
  }
  return res.send('template sent')
}

export const receiveNewPassword = async (req, res) => {
  const { userId, token } = req.params

  const { password } = req.body

  const passwordError = UsersService.validatePassword(password)
  if (passwordError) return res.status(400).json({ error: passwordError })

  // find user by ID
  let user
  try {
    const checkIdRequest = await orm.request(findUserById, { id: userId })
    user = checkIdRequest.data.users[0]
    console.log('🚀 ~ receiveNewPassword ~ user', user)
    if (!user) {
      return res.status(400).json({ error: 'No user with that email' })
    }
  } catch (err) {
    return res.status(404).json({ error: 'Error finding user' })
  }

  let payload
  try {
    const secret = `${user.password}-${user.created_at}`
    console.log('🚀 ~ smsRouter.post ~ user.created_at', user.created_at.length)
    console.log('🚀 ~ smsRouter.post ~ user.password', user.password.length)
    console.log('🚀 ~ smsRouter.post ~ token type', token.length)
    console.log('🚀 ~ smsRouter.post ~ secret type', secret.length)
    payload = jwt.verify(token, secret)
    console.log('🚀 ~ receiveNewPassword ~ payload', payload)
  } catch (error) {
    return res.status(401).json({ error: 'Unauthorized request' })
  }

  if (payload.userId === user.id) {
    let hashedPassword
    let updatedUser

    try {
      hashedPassword = await hashPassword(password)
    } catch (error) {
      return res.send('error hashing password')
    }

    // find user and update
    try {
      const userObject = { id: userId, newPassword: hashedPassword }
      const updatePasswordResult = await orm.request(updatePasswordByUserId, userObject)

      updatedUser = updatePasswordResult.data.update_users.returning[0]
    } catch (error) {
      return res.send('error inserting new password')
    }

    return res.status(200).send({
      token: await createToken(updatedUser, process.env.SECRET),
      role: updatedUser.role,
      id: updatedUser.id,
    })
  }
  return res.status(404).json({ error: 'Something went wrong with the link you used.' })
}

export const sendCalendarInvite = async (req, res) => {
  let message
  try {
    message = await rsvpTemplate(req.body)
  } catch (error) {
    console.log('error making rsvp template', error)
  }

  try {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY)
    await sgMail.send(message)
    return res.send('rsvp message sent')
  } catch (error) {
    console.log('Something went wrong sending the iCal email', error)
  }
}
