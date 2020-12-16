import * as Sentry from '@sentry/node'
import orm from './orm'

import {
  getEventsByStartTime,
  getEventUsers,
  getEventsByEndTime,
  getContactSharesForSendingEmail,
} from '../gql/queries'

import { sendEmail, sendEmailsToEventUsers } from './email-service'

const cron = require('node-cron')
const moment = require('moment')

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
  let events55to60MinsFromNow
  try {
    const oneDayFromNow = moment().add(1, 'day')
    const oneDayMinusFiveMinsFromNow = moment().add(1435, 'minutes')

    const getEventsResponse = await orm.request(getEventsByStartTime, {
      less_than: oneDayFromNow,
      greater_than: oneDayMinusFiveMinsFromNow,
    })
    events55to60MinsFromNow = getEventsResponse.data.events
  } catch (error) {
    console.log('error checking for upcoming events', error)
    return __Sentry.captureException(error)
  }

  return events55to60MinsFromNow
}


const sendEmailsToUpcomingEventParticipants = async () => {
  const events55to60MinsFromNow = await getEvents55to60MinsFromNow()
  const eventUsersPromisesOneHourFromNow = []

  events55to60MinsFromNow.forEach(async (event) => {
    eventUsersPromisesOneHourFromNow.push(orm.request(getEventUsers, { event_id: event.id }))
  })

  const eventsStartingIn24Hours = await getEventsStartingIn24Hours()
  const eventUsersPromises24HoursFromNow = []

  eventsStartingIn24Hours.forEach(async (event) => {
    eventUsersPromises24HoursFromNow.push(orm.request(getEventUsers, { event_id: event.id }))
  })
  if (eventUsersPromisesOneHourFromNow.length) {
    await sendEmailsToEventUsers(eventUsersPromisesOneHourFromNow, 'one hour')
  }

  if (eventUsersPromises24HoursFromNow.length) {
    await sendEmailsToEventUsers(eventUsersPromises24HoursFromNow, '24 hours')
  }
}


// check for finished events every 5 minutes
cron.schedule('*/5 * * * *', async () => {
  console.log('checking for recently finished events')


  try {
    await sendEmailsToUpcomingEventParticipants()
  } catch (error) {
    console.log('error = ', error)
    return __Sentry.captureException(error)
  }

  let eventsRecentlyFinished
  try {
    const fiveMinutesAgo = moment().subtract(50, 'minutes')
    const now = moment().subtract(0, 'minutes')
    const getEventsResponse = await orm.request(getEventsByEndTime, {
      less_than: now,
      greater_than: fiveMinutesAgo,
    })

    eventsRecentlyFinished = getEventsResponse.data.events
  } catch (error) {
    __Sentry.captureException(error)
    console.log('error checking for upcoming events', error)
  }

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
    const fields = {
      event_name: userObj.event_name,
      user: { name: userObj.name.split(' ')[0], email: userObj.email },
      partnerData: userObj.partners,
    }

    sendPostEventMatchesEmailPromises.push(sendEmail(fields))
  })

  await Promise.all(sendPostEventMatchesEmailPromises)
})
