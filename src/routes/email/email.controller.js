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
import bcrypt from 'bcryptjs'
import { transporter, getPasswordResetURL, resetPasswordTemplate } from '../../modules/email'
import findUserByEmail from '../../gql/queries/users/findUserByEmail'
import orm from '../../services/orm'
import findUserById from '../../gql/queries/users/findUserById'
const sgMail = require('@sendgrid/mail')

// `secret` is passwordHash concatenated with user's createdAt,
// so if someones gets a user token they still need a timestamp to intercept.
export const usePasswordHashToMakeToken = ({ password: passwordHash, _id: userId, createdAt }) => {
  const secret = passwordHash + '-' + createdAt
  const token = jwt.sign({ userId }, secret, {
    expiresIn: 3600, // 1 hour
  })
  return token
}

/*** Calling this function with a registered user's email sends an email IRL ***/
/*** I think Nodemail has a free service specifically designed for mocking   ***/
export const sendPasswordResetEmail = async (req, res) => {
  const { email } = req.params
  let user
  //find user
  try {
    const checkEmailRequest = await orm.request(findUserByEmail, { email: email })

    console.log('checkEmailRequest', checkEmailRequest)
    user = checkEmailRequest.data.users[0]
    console.log(user)
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

  //---------edit transporter for SendGrid-----------
  //   const sendEmail = async () => {
  // transporter.sendMail(emailTemplate, (err, info) => {
  //   if (err) {
  //     res.status(500).json("Error sending email")
  //   }
  //   console.log(`** Email sent **`, info.response)
  // })

  try {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY)
    console.log('trying to send email')
    await sgMail.send(emailTemplate)
    return res.send('email template sent')
  } catch {
    console.log('Something went wrong sending the password reset email')
  }
  //   }
  //   sendEmail()
}

export const receiveNewPassword = async (req, res) => {
  const { userId, token } = req.params
  const { password } = req.body

  //   User.findOne({ _id: userId })

  //     .then((user) => {
  //       const secret = user.password + '-' + user.createdAt
  //       const payload = jwt.decode(token, secret)
  //       if (payload.userId === user.id) {
  //         bcrypt.genSalt(10, function (err, salt) {
  //           if (err) return
  //           bcrypt.hash(password, salt, function (err, hash) {
  //             if (err) return
  //             //update password, finding by id
  //             User.findOneAndUpdate({ _id: userId }, { password: hash })
  //               .then(() => res.status(202).json('Password changed accepted'))
  //               .catch((err) => res.status(500).json(err))
  //           })
  //         })
  //       }
  //     })

  //     .catch(() => {
  //       res.status(404).json('Invalid user')
  //     })

  //find user by ID
  let user
  try {
    //change to find user by id
    const checkIdRequest = await orm.request(findUserById, { id: userId })

    console.log('checkIdRequest', checkIdRequest)
    user = checkIdRequest.data.users[0]
    console.log(user)
    if (!user) {
      return res.status(400).json({ error: 'No user with that email' })
    }
  } catch (err) {
    return res.status(404).json('Error finding user')
  }

  //in a try block?

  //need to add created_at
//   const secret = user.password + '-' + user.createdAt
//   const payload = jwt.decode(token, secret)

  return res.send('function ended')
}
