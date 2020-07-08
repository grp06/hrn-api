import { oneHourReminderTemplate } from '../modules/email'
const sgMail = require('@sendgrid/mail')

export const sendOneHourEmailReminder = async (event, eventUser) => {
  let message
  try {
    message = await oneHourReminderTemplate(event, eventUser)
  } catch (error) {
    __Sentry.captureException(error)
    console.log('error making one hour reminder template', error)
  }

  try {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY)
    await sgMail.send(message)
  } catch (error) {
    __Sentry.captureException(error)
    console.log('Something went wrong sending the one hour reminder email', error)
  }
}