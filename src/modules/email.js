import { makeCalendarInvite } from './rsvp'
const path = require('path')
const ejs = require('ejs')

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

export const rsvpTemplate = async (fields) => {
  let htmlTemplate

  const { name, email, event_name, event_id, description, host_name, event_start_time } = fields
  const eventLink = `https://launch.hirightnow.co/events/${event_id}`
  try {
    const ejsResponse = await ejs.renderFile(path.join(__dirname, '/views/rsvp-email.ejs'), {
      user_firstname: name,
      event_link: eventLink,
      event_name: event_name,
    })

    htmlTemplate = ejsResponse
  } catch (error) {
    return 'ejs error'
  }

  let iCalString
  try {
    iCalString = await makeCalendarInvite(event_name, host_name, event_id, event_start_time)
  } catch (error) {
    return 'calendar invite error'
  }

  const from = process.env.EMAIL_LOGIN
  const to = email
  const subject = `HiRightNow - ${event_name} confirmation`
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

export const oneHourReminderTemplate = (event, eventUser) => {

  const { name, email } = eventUser.user
  console.log('eventUser: ', eventUser);

  const { event_name, id: event_id } = event

  const eventLink = `https://launch.hirightnow.co/events/${event_id}`

  const html = `
  <p>Hey ${name || email},</p>
  <p>Your event is about to start!</p>
  <a href=${eventLink}>${eventLink}</a>
  <p>–Your friends at HiRightNow</p>
  `

  const from = process.env.EMAIL_LOGIN
  const to = email
  const subject = `HiRightNow - ${event_name} starts in one hour!`
  const content = [
    // {
    //   type: 'text/html',
    //   value: htmlTemplate,
    // },
    {
      type: 'text/html',
      value: html
    }
  ]
  return { from, to, subject, content }
}
