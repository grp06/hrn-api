import * as Sentry from '@sentry/node'
import client from '../../extensions/twilioClient'

const express = require('express')

const smsRouter = express.Router()
const hrnTwilioPhoneNumber = '+19518012833'

smsRouter.post('/send-confirmation-text', async (req, res) => {
  console.log('hey')
  const recipientPhoneNumber = req.body.recipientPhoneNumber || '+13219176436'
  const recipientName = req.body.recipientName.split(' ')[0] || 'George'
  const celebName = req.body.celebName || 'Johhny Bravo'
  const eventDateString = req.body.eventDateString || 'January 16 @ 4:30pm'
  const numberInQueue = req.body.numberInQueue || 43
  const eventId = req.body.eventId || 47
  const messageContent = `Hey ${recipientName}, we hope you're excited to meet ${celebName}.

You can wait for your turn to meet ${celebName} on this page: https://launch.hirightnow.co/meet-and-greet/${eventId}

The event starts at ${eventDateString}. Your position in the queue is ${numberInQueue}, we'll send you a text about ten minutes before it's time to meet ${celebName}.

Reminder, this meet and greet a donation based event, so you can make a donation to ${celebName} right after your chat via Venmo or Cash app. See you soon!`

  try {
    client.messages
      .create({
        body: messageContent,
        from: hrnTwilioPhoneNumber,
        to: recipientPhoneNumber,
        mediaUrl: ['https://media.giphy.com/media/hVJMypEGoupddzNFM9/giphy.gif'],
      })
      .then((message) => console.log(message.sid))
    return res.status(201).send({ success: 'true' })
  } catch (error) {
    return res.status(500).send({ error })
  }
})

smsRouter.post('/send-ten-minute-reminder-text', async (req, res) => {
  console.log('hey')
  const recipientPhoneNumber = req.body.recipientPhoneNumber || '+13219176436'
  const recipientName = req.body.recipientName.split(' ')[0] || 'George'
  const celebName = req.body.celebName || 'Johhny Bravo'
  const eventId = req.body.eventId || 47
  const messageContent = `Hey ${recipientName}, in about 10 minutes you get to meet ${celebName}!

You can wait for your turn here: https://launch.hirightnow.co/meet-and-greet/${eventId}.

Reminder, this meet and greet a donation based event, so you can make a donation to ${celebName} right after your chat via Venmo or Cash app. See you soon!`

  try {
    client.messages
      .create({
        body: messageContent,
        from: hrnTwilioPhoneNumber,
        to: recipientPhoneNumber,
      })
      .then((message) => console.log(message.sid))
    return res.status(201).send({ success: 'true' })
  } catch (error) {
    return res.status(500).send({ error })
  }
})

smsRouter.post('/send-post-event-text', async (req, res) => {
  console.log('hey')
  const recipientPhoneNumber = req.body.recipientPhoneNumber || '+13219176436'
  const recipientName = req.body.recipientName.split(' ')[0] || 'George'
  const celebName = req.body.celebName || 'Johhny Bravo'
  const celebVenmo = req.body.venmo
  const celebCashApp = req.body.cashApp
  let donationString
  if (celebVenmo && celebCashApp) {
    donationString = `Venmo: ${celebVenmo} or CashApp: ${celebCashApp}`
  } else if (!celebVenmo) {
    donationString = `CashApp: ${celebCashApp}`
  } else {
    donationString = `Venmo: ${celebVenmo}`
  }
  const messageContent = `Hey ${recipientName}, we hope you enjoyed your chat with ${celebName}!

You can can make a donation to ${celebName} via ${donationString}

Hope to see you again soon!
`

  try {
    client.messages
      .create({
        body: messageContent,
        from: hrnTwilioPhoneNumber,
        to: recipientPhoneNumber,
      })
      .then((message) => console.log(message.sid))
    return res.status(201).send({ success: 'true' })
  } catch (error) {
    return res.status(500).send({ error })
  }
})

module.exports = smsRouter
