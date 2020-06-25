import nodemailer from 'nodemailer'

export const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_LOGIN,
    pass: process.env.EMAIL_PASSWORD,
  },
})
// API endpoint
export const getPasswordResetURL = (user, token) => {
  let frontendUrl

  switch (process.env.DEPLOYED_ENV) {
    case 'local':
      frontendUrl = 'http://localhost:3000'
      break
    case 'staging':
      frontendUrl = 'https://staging.launch.hirightnow.co'
      break
    case 'production':
      frontendUrl = 'https://launch.hirightnow.co'
      break
    default:
      frontendUrl = 'http://localhost:3000'
  }

  return `${frontendUrl}/set-new-password/${user.id}/${token}`
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
