import nodemailer from 'nodemailer'

export const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_LOGIN,
    pass: process.env.EMAIL_PASSWORD,
  },
})
const endpoint =
  process.env.NODE_ENV === 'development' ? 'http://localhost:8000' : 'https://api.hirightnow.co'
// API endpoint
export const getPasswordResetURL = (user, token) => {
  console.log('user in getPasswordResetURL', user)
  // this should point to front end code, which will have a POST request to the /password_reset/receive_new_password endpoint
  // return `http://hrn.com/password/reset/${user.id}/${token}`
  return `${endpoint}/api/receive_new_password/${user.id}/${token}`
}

export const resetPasswordTemplate = (user, url) => {
  const from = process.env.EMAIL_LOGIN
  const to = user.email
  const subject = '🌻 HiRightNow Password Reset 🌻'
  const html = `
  <p>Hey ${user.name || user.email},</p>
  <p>We heard that you lost your HiRightNow password. Sorry about that!</p>
  <p>But don’t worry! You can use the following link to reset your password:</p>
  <a href=${url}>${url}</a>
  <p>If you don’t use this link within 1 hour, it will expire.</p>
  <p>Do something outside today! </p>
  <p>–Your friends at HiRightNow</p>
  `

  return { from, to, subject, html }
}
