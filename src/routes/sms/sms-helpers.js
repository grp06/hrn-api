import client from '../../extensions/twilioClient'

const hrnTwilioPhoneNumber = '+19518012833'
const moment = require('moment')

export const sendConfirmationText = ({ newFan, chitChat, eventUsersNewRes }) => {
  const chit_chat_users =
    eventUsersNewRes.data.insert_chit_chat_users.returning[0].event.chit_chat_users

  const { host, start_at } = chitChat
  const { name: hostName } = host
  const hostFirstName = hostName.split(' ')[0]
  const positionInQueue = chit_chat_users.findIndex((user) => user.user_id === newFan.id) + 1
  const { phone_number: phoneNumber, name, username } = newFan
  const nameToCallUser = name ? name.split(' ')[0] : username
  const eventDateString = moment(start_at).format('MMMM Do @ h:mma')

  const messageContent = `Hey ${nameToCallUser}, we hope you're excited to meet ${hostFirstName}.

You can wait for your turn to meet ${hostFirstName} on this page: https://launch.hirightnow.co/chit-chat/${chitChat.id}

The event starts at ${eventDateString}. Your position in the queue is #${positionInQueue}, we'll send you a text about ten minutes before it's time to meet ${hostFirstName}.

Reminder, this meet and greet a donation based event, so you can make a donation to ${hostFirstName} right after your chat via Venmo or Cash app. See you soon!`

  client.messages
    .create({
      body: messageContent,
      from: hrnTwilioPhoneNumber,
      to: phoneNumber,
    })
    .then((message) => console.log('text message sent'))
}

export const sendPasswordResetText = ({ user, url }) => {
  console.log('🚀 ~ sendPasswordResetText ~ user', user)
  const { phone_number: phoneNumber, name, username } = user
  const nameToCallUser = name ? name.split(' ')[0] : username

  const messageContent = `Hey ${nameToCallUser}, sorry to hear you forgot your password.
  
You can reset it here: ${url}`

  client.messages
    .create({
      body: messageContent,
      from: hrnTwilioPhoneNumber,
      to: phoneNumber,
    })
    .then((message) => console.log('password reset text sent'))
}
