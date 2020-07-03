const cron = require('node-cron')
const moment = require('moment')
import orm from './orm'
import { getEventsByStartTime } from '../gql/queries/events/getEventsByStartTime'
import { sendOneHourEmailReminder } from './email-service'
import { getEventUsers } from '../gql/queries/users/getEventUsers'

// Every 5 minutes
// Checked for events that need to send out an email reminder
const checkForUpcomingEvents = cron.schedule('*/5 * * * *', async () => {
  let eventsInNextHour
  try {
    const oneHourAgo = moment().subtract(1, 'hour')

    const getEventsResponse = await orm.request(getEventsByStartTime, { start_time: oneHourAgo })
    eventsInNextHour = getEventsResponse.data.events
    console.log('eventsInNextHour: ', eventsInNextHour)
  } catch (error) {
    console.log('error checking for upcoming events', error)
  }

  eventsInNextHour.forEach(async (event) => {
    let eventUsers

    // query the event users and send emails from response
    try {
      const getEventUsersResponse = await orm.request(getEventUsers, { event_id: event.id })

      eventUsers = getEventUsersResponse.data.event_users
    } catch (error) {
      console.log(`error getting event users for event ${event.id}`, error)
    }

    // create an array and make a Promise.all with the array with .map (see set-rooms-completed)
    // const promiseArray = 
    eventUsers.forEach((eventUser) => {
      // more async code needed?
      sendOneHourEmailReminder(event, eventUser)
    })

    // await Promise.all
  })
})
