import { iCalString } from './rsvp'
const path = require('path')
const ejs = require('ejs')

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

export const rsvpTemplate = async () => {
  let htmlTemplate
  try {
    const ejsResponse = await ejs.renderFile(path.join(__dirname, '/views/rsvp-email.ejs'), {
      user_firstname: 'Kevin',
      confirm_link: 'www.google.com',
    })

    htmlTemplate = ejsResponse
  } catch (error) {
    console.log('error creating rsvp ejs file', error)
    return 'ejs error'
  }

  const from = process.env.EMAIL_LOGIN
  const to = process.env.EMAIL_RECIPIENT
  const subject = 'RSVP to HRN!!!'
  const content = [
    {
      type: 'text/html',
      value: htmlTemplate,
    },
    {
      type: 'text/calendar',
      value: iCalString,
    },
  ]

  return { from, to, subject, content }
}
