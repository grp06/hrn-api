import * as Sentry from '@sentry/node'

import {
  oneHourReminderTemplate,
  twentyFourHourReminderTemplate,
  postEventTemplate,
  signUpConfirmationTemplate,
} from '../modules/email'



const sgMail = require('@sendgrid/mail')

export const sendEmail = async (fields) => {
  let message
  try {
    message = await postEventTemplate(fields)
  } catch (error) {
    __Sentry.captureException(error)
    console.log('error making email template', error)
  }

  try {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY)
    await sgMail.send(message)
  } catch (error) {
    __Sentry.captureException(error)
    console.log('Something went wrong sending email', error)
  }
}

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

export const signUpConfirmation = async (user) => {
  let message
  try {
    message = await signUpConfirmationTemplate(user)
  } catch (error) {
    console.log('error making signup email template', error)
    __Sentry.captureException(error)
  }

  try {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY)
    await sgMail.send(message)
  } catch (error) {
    console.log('Something went wrong sending the signup template email', error)
    __Sentry.captureException(error)
  }
}

export const sendEmailsToEventUsers = async (eventUsersPromises, timeframe) => {
  try {
    const eventUsersFromOneEvent = await Promise.all(eventUsersPromises)
    const listOfEmailMessagesPromises = []

    eventUsersFromOneEvent.forEach((eventUserObj) => {
      eventUserObj.data.event_users.forEach((eventUser) => {
        const { event } = eventUser
        const { user } = eventUser
        const { email } = user
        const { event_name, start_at, id: event_id } = event
        if (timeframe === 'one hour') {
          listOfEmailMessagesPromises.push(
            oneHourReminderTemplate({
              email,
              event_name,
              start_at,
              event_id,
            })
          )

          if (timeframe === '24 hours') {
            listOfEmailMessagesPromises.push(
              twentyFourHourReminderTemplate({
                email,
                event_name,
                start_at,
                event_id,
              })
            )          

        }
      })
    })

    const resolvedMessages = await Promise.all(listOfEmailMessagesPromises)
    const emailsToSendPromies = []
    sgMail.setApiKey(process.env.SENDGRID_API_KEY)

    resolvedMessages.forEach((message) => {
      emailsToSendPromies.push(sgMail.send(message))
    })

    // await Promise.all(emailsToSendPromies)
    console.log('success sending emails')
  } catch (error) {
    console.log('error sending email = ', error)
    return __Sentry.captureException(error)
  }
}
