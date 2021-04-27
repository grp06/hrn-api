import * as Sentry from '@sentry/node'

import {
  getEventsByStartTime,
  getEventsByEndTime,
  getContactSharesForSendingEmail,
  getEventAttendeesFromListOfEventIds,
  getAllEvents,
} from '../gql/queries'
import { sendEmailsToNoShows, sendReminders, sendFollowupsToHosts } from '../modules/email'
import { sendEmail } from './email-service'
import orm from './orm'

const moment = require('moment')
const cron = require('node-cron')

const oneDayInMs = 86400000
const fiveMinsInMs = 300000

const getEvents55to60MinsFromNow = async () => {
  console.log('check for events in next hour')
  let events55to60MinsFromNow
  try {
    const oneHourFromNow = moment().add(1, 'hour')
    const fiftyFiveMinutesFromNow = moment().add(55, 'minutes')

    const getEventsResponse = await orm.request(getEventsByStartTime, {
      less_than: oneHourFromNow,
      greater_than: fiftyFiveMinutesFromNow,
    })
    events55to60MinsFromNow = getEventsResponse.data.events
  } catch (error) {
    console.log('error checking for upcoming events', error)
    return __Sentry.captureException(error)
  }

  return events55to60MinsFromNow
}

const getEventsStartingIn24Hours = async () => {
  console.log('check for events in next day')
  let eventsOneDayFromNow
  try {
    const oneDayFromNow = moment().add(1, 'day')
    const oneDayMinusFiveMinsFromNow = moment().add(1435, 'minutes')
    const getEventsResponse = await orm.request(getEventsByStartTime, {
      less_than: oneDayFromNow,
      greater_than: oneDayMinusFiveMinsFromNow,
    })
    eventsOneDayFromNow = getEventsResponse.data.events
  } catch (error) {
    console.log('error checking for upcoming events', error)
    return __Sentry.captureException(error)
  }

  return eventsOneDayFromNow
}

const sendEmailsToUpcomingEventParticipants = async () => {
  const events55to60MinsFromNow = await getEvents55to60MinsFromNow()
  const eventsStartingIn24Hours = await getEventsStartingIn24Hours()

  if (events55to60MinsFromNow.length) {
    console.log('send out one hour reminder email')
    sendReminders({
      events: events55to60MinsFromNow,
      filePath: '../../src/modules/views/one-hour-event-reminder.ejs',
      timeframeString: 'one hour',
    })
  }

  if (eventsStartingIn24Hours.length) {
    console.log('send out 24 hour reminder email')
    sendReminders({
      events: eventsStartingIn24Hours,
      filePath: '../../src/modules/views/24-hour-event-reminder.ejs',
      timeframeString: '24 hours',
    })
  }
}

const sendPostEventConnetionEmails = async (eventsRecentlyFinished) => {
  const partnersToEmailPromises = []

  eventsRecentlyFinished.forEach(async (event) => {
    // query the event users and send emails from response
    partnersToEmailPromises.push(
      orm.request(getContactSharesForSendingEmail, {
        event_id: event.id,
      })
    )
  })

  const partnersToEmail = await Promise.all(partnersToEmailPromises)

  const partnersArray = partnersToEmail.reduce((all, item, index) => {
    if (item && item.data && item.data.partners) {
      item.data.partners.forEach((partner) => {
        all.push(partner)
      })
    }
    return all
  }, [])

  const listOfMatchesByUserEmail = partnersArray.reduce((all, item) => {
    if (!all.length) {
      all.push({
        name: item.user.name,
        email: item.user.email,
        partners: [item.partner],
        event_name: item.event.event_name,
      })
      return all
    }

    const indexOfUserToOperateOn = all.findIndex((user) => user.email === item.user.email)
    if (indexOfUserToOperateOn === -1) {
      all.push({
        name: item.user.name,
        email: item.user.email,
        partners: [item.partner],
        event_name: item.event.event_name,
      })
      return all
    }
    all[indexOfUserToOperateOn].partners.push(item.partner)
    return all
  }, [])

  const sendPostEventMatchesEmailPromises = []

  listOfMatchesByUserEmail.forEach((userObj) => {
    const { event_name, email, first_name, partners, profile_pic_url } = userObj
    const fields = {
      event_name: event_name,
      user: { name: first_name, email, profile_pic_url },
      partnerData: partners,
    }

    sendPostEventMatchesEmailPromises.push(sendEmail(fields))
  })

  await Promise.all(sendPostEventMatchesEmailPromises)
}

// check for finished events every 5 minutes
cron.schedule('*/5 * * * *', async () => {
  try {
    await sendEmailsToUpcomingEventParticipants()

    const fiveMinutesAgo = moment().subtract(5, 'minutes')
    const now = moment().subtract(0, 'minutes')
    const eventsEndedWithinLastFiveMins = await orm.request(getEventsByEndTime, {
      less_than: now,
      greater_than: fiveMinutesAgo,
    })

    const eventsRecentlyFinished = eventsEndedWithinLastFiveMins.data.events
    await sendPostEventConnetionEmails(eventsRecentlyFinished)

    if (eventsRecentlyFinished.length) {
      const eventIdsToQuery = eventsRecentlyFinished.map((event) => event.id)
      const attendees = await orm.request(getEventAttendeesFromListOfEventIds, {
        eventIds: eventIdsToQuery,
      })
      const attendeesOfRecentlyFinishedEvents = attendees.data.partners.map(
        (partner) => partner.user.email
      )

      await sendEmailsToNoShows(eventsRecentlyFinished, attendeesOfRecentlyFinishedEvents)
    }

    const oneDayPlusFiveMinsFromNow = new Date(Date.now() - oneDayInMs + fiveMinsInMs).toISOString()

    const oneDayAgo = new Date(Date.now() - oneDayInMs).toISOString()

    const getEventsResponse = await orm.request(getEventsByEndTime, {
      less_than: oneDayPlusFiveMinsFromNow,
      greater_than: oneDayAgo,
    })

    const eventsEndedJustUnderOneDayAgo = getEventsResponse.data.events

    const allEventsResponse = await orm.request(getAllEvents)
    const hostIdsFromAllEvents = allEventsResponse.data.events

    await sendFollowupsToHosts(eventsEndedJustUnderOneDayAgo, hostIdsFromAllEvents)
  } catch (error) {
    console.log('error = ', error)
    return __Sentry.captureException(error)
  }
})
