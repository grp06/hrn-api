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

export const sendEmailsToEventUsers = async ({ promises: eventUsersPromises, emailType }) => {
  // console.log('🚀 ~ sendEmailsToEventUsers ~ eventUsersPromises', eventUsersPromises)
  // console.log('🚀 ~ sendEmailsToEventUsers ~ emailType', emailType)
  // try {
  //   // this is an array of event_users objects (from all events)
  //   const resolvedEventUsersPromises = await Promise.all(eventUsersPromises)
  //   const emailsToSendArray = []
  //   resolvedEventUsersPromises.forEach((eventUsersObj) => {
  //     console.log('🚀 ~ resolvedEventUsersPromises.forEach ~ eventUsersObj', eventUsersObj)
  //     eventUsersObj.data.event_users.forEach((eventUser) => {
  //       const { event } = eventUser
  //       const { event_name, start_at, id: event_id, banner_photo_url } = event
  //       // if (emailType === 'one hour reminder') {
  //       //   emailsToSendArray.push(
  //       //     oneHourReminderTemplate({
  //       //       email,
  //       //       event_name,
  //       //       start_at,
  //       //       event_id,
  //       //       banner_photo_url,
  //       //     })
  //       //   )
  //       // }
  //       if (emailType === '24 hour reminder') {
  //         emailsToSendArray.push(
  //           twentyFourHourReminderTemplate({
  //             event_name,
  //             start_at,
  //             event_id,
  //           })
  //         )
  //       }
  //     })
  //   })
  //   const emailTemplatesPreparedToSend = await Promise.all(emailsToSendArray)
  //   console.log(
  //     '🚀 ~ sendEmailsToEventUsers ~ emailTemplatesPreparedToSend',
  //     emailTemplatesPreparedToSend
  //   )
  //   sgMail.setApiKey(process.env.SENDGRID_API_KEY)
  //   emailTemplatesPreparedToSend.forEach((message) => {
  //     sgMail.send(message)
  //   })
  //   console.log('success sending emails')
  // } catch (error) {
  //   console.log('error sending email = ', error)
  //   return __Sentry.captureException(error)
  // }
}
