import jwt from 'jsonwebtoken'
import { getPasswordResetURL, resetPasswordTemplate } from '../../modules/email'
import findUserByEmail from '../../gql/queries/users/findUserByEmail'
import updatePasswordByUserId from '../../gql/mutations/users/updatePasswordByUserId'
import orm from '../../services/orm'
import findUserById from '../../gql/queries/users/findUserById'
import { hashPassword, verifyJwt } from '../../services/auth-service'
import { createToken } from '../../extensions/jwtHelper'
const sgMail = require('@sendgrid/mail')

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
    console.log('user sendPasswordResetEmail', user)
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

  console.log(emailTemplate)

  //send email
  try {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY)
    await sgMail.send(emailTemplate)
    return res.send('email template sent')
  } catch {
    console.log('Something went wrong sending the password reset email')
  }
  return res.send('template sent')
}

export const receiveNewPassword = async (req, res) => {
  const { userId, token } = req.params

  const { password } = req.body

  //find user by ID
  let user
  try {
    const checkIdRequest = await orm.request(findUserById, { id: userId })
    user = checkIdRequest.data.users[0]
    if (!user) {
      return res.status(400).json({ error: 'No user with that email' })
    }
  } catch (err) {
    return res.status(404).json({error: 'Error finding user'})
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
