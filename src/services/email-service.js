import * as Sentry from '@sentry/node'

import { postEventTemplate, signUpConfirmationTemplate } from '../modules/email'

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
