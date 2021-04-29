import * as Sentry from '@sentry/node'

import {
  postEventTemplate,
  signUpConfirmationTemplate,
  stripeSubscriptionConfirmationTemplate,
} from '../modules/email'

require('dotenv').config()

/** MAILS */
const sgMail = require('@sendgrid/mail')
const { APIClient, SendEmailRequest } = require('customerio-node/api')

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

export const stripeSubscriptionConfirmation = async (stripeEmailFieldsObject) => {
  let message
  try {
    message = await stripeSubscriptionConfirmationTemplate(stripeEmailFieldsObject)
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

/** Initialize the CIO client */
const client = new APIClient(process.env.CIO_APP_API_KEY)

/**
 * Basic service of sending transactional email to an individual with CIO using a template
 * @see https://fly.customer.io/
 * @param email - The email to send
 * @param msgData - The object of variables used in templates
 * @param templateID - The Id of the transactional email template on fly.customer.io
 * @param attachments - The object of attachments with filename as key and base64-encoded-file-body as value
 * @see https://customer.io/docs/transactional-api-examples
 */
export const sendEmailWithCIO = (email = '', msgData = {}, templateID = '', attachments = {}) => {
  const data = {
    to: email,
    transactional_message_id: templateID,
    message_data: msgData,
    identifiers: {
      email,
    },
    attachments,
  }
  const request = new SendEmailRequest(data)

  client
    .sendEmail(request)
    .then((res) => console.log('CIO mail delivery ID ', res.delivery_id))
    .catch((err) => console.log('Email service failed ', err.statusCode, err.message))
}
