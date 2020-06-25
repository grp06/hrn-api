import jwt from 'jsonwebtoken'
import { getPasswordResetURL, resetPasswordTemplate } from '../../modules/email'
import findUserByEmail from '../../gql/queries/users/findUserByEmail'
import updatePasswordByUserId from '../../gql/mutations/users/updatePasswordByUserId'
import orm from '../../services/orm'
import findUserById from '../../gql/queries/users/findUserById'
import { hashPassword, verifyJwt } from '../../services/auth-service'
import { createToken } from '../../extensions/jwtHelper'
const sgMail = require('@sendgrid/mail')
import UsersService from '../users/users-service'

// `secret` is passwordHash concatenated with user's createdAt,
// so if someones gets a user token they still need a timestamp to intercept.
export const usePasswordHashToMakeToken = ({ password: passwordHash, id: userId, created_at }) => {
  const secret = passwordHash + '-' + created_at
  const token = jwt.sign({ userId }, secret, {
    expiresIn: 3600, // 1 hour
  })
  return token
}

export const sendPasswordResetEmail = async (req, res) => {
  const { email } = req.params

  let user

  //find user
  try {
    const checkEmailRequest = await orm.request(findUserByEmail, { email: email })

    user = checkEmailRequest.data.users[0]

    if (!user) {
      return res.status(400).json({ error: 'No user with that email' })
    }
  } catch (err) {
    return res.status(404).json('Error finding user')
  }

  //make the relevant items to send in an email
  const token = usePasswordHashToMakeToken(user)
  const url = getPasswordResetURL(user, token)
  const emailTemplate = resetPasswordTemplate(user, url)

  //send email
  try {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY)

    const sendRes = await sgMail.send(emailTemplate)

    return res.send('email template sent')
  } catch (error) {
    return res.status(400).json({ error: error.response.body.errors[0].message })
  }
  return res.send('template sent')
}

export const receiveNewPassword = async (req, res) => {
  console.log('receiveNewPassword -> receiveNewPassword', receiveNewPassword)
  const { userId, token } = req.params

  const { password } = req.body

  const passwordError = UsersService.validatePassword(password)
  if (passwordError) return res.status(400).json({ error: passwordError })

  //find user by ID
  let user
  try {
    const checkIdRequest = await orm.request(findUserById, { id: userId })
    user = checkIdRequest.data.users[0]
    if (!user) {
      return res.status(400).json({ error: 'No user with that email' })
    }
  } catch (err) {
    return res.status(404).json({ error: 'Error finding user' })
  }

  let payload
  try {
    const secret = user.password + '-' + user.created_at
    payload = jwt.verify(token, secret)
  } catch (error) {
    return res.status(401).json({ error: 'Unauthorized request' })
  }

  if (payload.userId === user.id) {
    let hashedPassword
    let updatedUser

    try {
      hashedPassword = await hashPassword(password)
    } catch {
      return res.send('error hashing password')
    }

    // find user and update
    try {
      const userObject = { id: userId, newPassword: hashedPassword }
      const updatePasswordResult = await orm.request(updatePasswordByUserId, userObject)

      updatedUser = updatePasswordResult.data.update_users.returning[0]
    } catch {
      return res.send('error inserting new password')
    }

    return res.status(200).send({
      token: await createToken(updatedUser, process.env.SECRET),
      role: updatedUser.role,
      id: updatedUser.id,
    })
  } else {
    return res.status(404).json({ error: 'Something went wrong with the link you used.' })
  }
}
