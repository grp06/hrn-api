import client from '../../extensions/twilioClient'

const hrnTwilioPhoneNumber = '+19518012833'
const moment = require('moment')

export const sendConfirmationText = ({ newFan, chitChat, eventUsersNewRes }) => {
  const chit_chat_users =
    eventUsersNewRes.data.insert_chit_chat_users.returning[0].event.chit_chat_users

  const { host, start_at } = chitChat
  const { name: hostName } = host

  const positionInQueue = chit_chat_users.findIndex((user) => user.user_id === newFan.id) + 1
  const { phone_number, name, username } = newFan
  const nameToCallUser = name ? name.split(' ')[0] : username
  const eventDateString = moment(start_at).format('MMMM Do @ h:mma')

  const messageContent = `Hey ${nameToCallUser}, we hope you're excited to meet ${hostName}.

You can wait for your turn to meet ${hostName} on this page: https://launch.hirightnow.co/chit-chats/${chitChat.id}

The event starts at ${eventDateString}. Your position in the queue is #${positionInQueue}, we'll send you a text about ten minutes before it's time to meet ${hostName}.

Reminder, this meet and greet a donation based event, so you can make a donation to ${hostName} right after your chat via Venmo or Cash app. See you soon!`

  client.messages
    .create({
      body: messageContent,
      from: hrnTwilioPhoneNumber,
      to: phone_number,
    })
    .then((message) => console.log('text message sent'))
}
