import client from '../../extensions/twilioClient'

const hrnTwilioPhoneNumber = '+19518012833'
const moment = require('moment')

export const sendConfirmationText = ({ newFan, chitChat, eventUsersNewRes }) => {
  const event_users_new =
    eventUsersNewRes.data.insert_event_users_new.returning[0].event.event_users_new

  const { host, start_at } = chitChat
  const { name: hostName } = host

  const positionInQueue = event_users_new.findIndex((user) => user.user_id === newFan.id) + 1
  const { phone_number, name } = newFan
  const firstName = name.split(' ')[0]
  const eventDateString = moment(start_at).format('MMMM Do @ h:mma')

  const messageContent = `Hey ${firstName}, we hope you're excited to meet ${hostName}.

You can wait for your turn to meet ${hostName} on this page: https://launch.hirightnow.co/chit-chats/${chitChat.id}

The event starts at ${eventDateString}. Your position in the queue is #${positionInQueue}, we'll send you a text about ten minutes before it's time to meet ${hostName}.

Reminder, this meet and greet a donation based event, so you can make a donation to ${hostName} right after your chat via Venmo or Cash app. See you soon!`

  client.messages
    .create({
      body: messageContent,
      from: hrnTwilioPhoneNumber,
      to: phone_number,
      mediaUrl: ['https://media.giphy.com/media/hVJMypEGoupddzNFM9/giphy.gif'],
    })
    .then((message) => console.log('text message sent'))
}
