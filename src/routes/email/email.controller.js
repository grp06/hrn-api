/*** Documentation:
 * To make this token a one-time-use token, I encourage you to
 * use the user’s current password hash in conjunction with
 * the user’s created date (in ticks) as the secret key to
 * generate the JWT. This helps to ensure that if the user’s
 * password was the target of a previous attack (on an unrelated website),
 * then the user’s created date will make the secret key unique
 * from the potentially leaked password.
 * With the combination of the user’s password hash and created date,
 * the JWT will become a one-time-use token, because once the user
 * has changed their password, it will generate a new password hash
 * invalidating the secret key that references the old password
 * Reference: https://www.smashingmagazine.com/2017/11/safe-password-resets-with-json-web-tokens/
 **/

import jwt from 'jsonwebtoken'
import bcrypt, { hash } from 'bcryptjs'
import { transporter, getPasswordResetURL, resetPasswordTemplate } from '../../modules/email'
import findUserByEmail from '../../gql/queries/users/findUserByEmail'
import updatePasswordByUserId from '../../gql/mutations/users/updatePasswordByUserId'
import orm from '../../services/orm'
import findUserById from '../../gql/queries/users/findUserById'
import { hashPassword } from '../../services/auth-service'
import { createToken } from '../../extensions/jwtHelper'
const sgMail = require('@sendgrid/mail')

// `secret` is passwordHash concatenated with user's createdAt,
// so if someones gets a user token they still need a timestamp to intercept.
export const usePasswordHashToMakeToken = ({ password: passwordHash, id: userId, created_at }) => {
  console.log('created_at: ', created_at)
  const secret = passwordHash + '-' + created_at
  console.log('first secret', secret);
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
  const token = usePasswordHashToMakeToken(user)
  const url = getPasswordResetURL(user, token)
  const emailTemplate = resetPasswordTemplate(user, url)

  console.log(emailTemplate)

  // try {
  //   sgMail.setApiKey(process.env.SENDGRID_API_KEY)
  //   console.log('trying to send email')
  //   await sgMail.send(emailTemplate)
  //   return res.send('email template sent')
  // } catch {
  //   console.log('Something went wrong sending the password reset email')
  // }
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
    return res.status(404).json('Error finding user')
  }

  //in a try block?

  console.log('initial user', user);
  const secret = user.password + '-' + user.created_at
  console.log('second secret', secret);
  const payload = jwt.decode(token, secret)
  console.log(payload);

  if (payload.userId === user.id) {
    let hashedPassword
    let updatedUser
    try {
       bcrypt.genSalt(10, function(err, salt) {
        if (err) return
        // hashedPassword = await hashPassword(password)
        hashedPassword = bcrypt.hash(password, salt)
      console.log('hashedPassword', hashedPassword);
      })
      
    } catch {
      return res.send('error hashing password')
    }

    //find user and update
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
      id: updatedUser.id
    })
  } else {
    return res.status(404).json({ error: 'Something went wrong with the link you used.' })
  }
}
