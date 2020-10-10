import orm from './orm'
import {
  getEventsByStartTime,
  getEventsByEndTime,
  getEventUsers,
  getContactSharesForSendingEmail,
} from '../gql/queries'

import { sendOneHourEmailReminder, sendEmail } from './email-service'

const cron = require('node-cron')
const moment = require('moment')

// Every 5 minutes
// Checked for events that need to send out an email reminder
const checkForUpcomingEvents = cron.schedule('*/5 * * * *', async () => {
  let eventsInNextHour
  try {
    const oneHourFromNow = moment().add(1, 'hour')
    const fiftyFiveMinutesFromNow = moment().add(55, 'minutes')

    const getEventsResponse = await orm.request(getEventsByStartTime, {
      less_than: oneHourFromNow,
      greater_than: fiftyFiveMinutesFromNow,
    })
    eventsInNextHour = getEventsResponse.data.events
  } catch (error) {
    console.log('error checking for upcoming events', error)
    return __Sentry.captureException(error)
  }

  eventsInNextHour.forEach(async (event) => {
    let eventUsers

    // query the event users and send emails from response
    try {
      const getEventUsersResponse = await orm.request(getEventUsers, { event_id: event.id })

      eventUsers = getEventUsersResponse.data.event_users
    } catch (error) {
      __Sentry.captureException(error)
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

// check for finished events every 5 minutes
cron.schedule('*/5 * * * * *', async () => {
  console.log('cron')
  let eventsRecentlyFinished
  try {
    const fiveMinutesAgo = moment().subtract(5, 'minutes')
    const now = moment().subtract(0, 'minutes')
    const getEventsResponse = await orm.request(getEventsByEndTime, {
      less_than: now,
      greater_than: fiveMinutesAgo,
    })
    // error here
    eventsRecentlyFinished = getEventsResponse.data.events
    console.log('eventsRecentlyFinished', eventsRecentlyFinished)
  } catch (error) {
    __Sentry.captureException(error)
    console.log('error checking for upcoming events', error)
  }

  eventsRecentlyFinished.forEach(async (event) => {
    // query the event users and send emails from response

    let partnersToEmail
    try {
      const getContactSharesForSendingEmailResponse = await orm.request(
        getContactSharesForSendingEmail,
        {
          event_id: event.id,
        }
      )
      console.log(
        'getContactSharesForSendingEmailResponse',
        getContactSharesForSendingEmailResponse
      )
      partnersToEmail = getContactSharesForSendingEmailResponse.data.partners
    } catch (error) {
      __Sentry.captureException(error)
      console.log(`error getting event users for event ${event.id}`, error)
    }

    let eventUsers

    try {
      const getEventUsersResponse = await orm.request(getEventUsers, { event_id: event.id })

      eventUsers = getEventUsersResponse.data.event_users
    } catch (error) {
      __Sentry.captureException(error)
      console.log(`error getting event users for event ${event.id}`, error)
    }

    // const reformattedThumbingData = mutualThumbs.reduce((all, thumbingPair) => {
    //   const idsSavedSoFar = []
    //   all.forEach((person) => {
    //     const id = parseInt(Object.keys(person)[0], 10)
    //     if (idsSavedSoFar.indexOf(id) === -1) {
    //       idsSavedSoFar.push(id)
    //     }
    //   })

    //   if (!all.length) {
    //     all.push({
    //       [thumbingPair.partnerY.id]: [thumbingPair.partnerX],
    //     })
    //     all.push({
    //       [thumbingPair.partnerX.id]: [thumbingPair.partnerY],
    //     })
    //     return all
    //   }

    //   if (idsSavedSoFar.indexOf(thumbingPair.partnerX.id) === -1) {
    //     all.push({
    //       [thumbingPair.partnerX.id]: [thumbingPair.partnerY],
    //     })
    //   } else {
    //     // add on new object to correct key
    //     const objToAddTo = all.find(
    //       (user) => Object.keys(user)[0] === thumbingPair.partnerX.id.toString()
    //     )
    //     objToAddTo[thumbingPair.partnerX.id].push(thumbingPair.partnerY)
    //   }

    //   if (idsSavedSoFar.indexOf(thumbingPair.partnerY.id) === -1) {
    //     all.push({
    //       [thumbingPair.partnerY.id]: [thumbingPair.partnerX],
    //     })
    //   } else {
    //     // add on new object to correct key

    //     const objToAddTo = all.find(
    //       (user) => Object.keys(user)[0] === thumbingPair.partnerY.id.toString()
    //     )
    //     objToAddTo[thumbingPair.partnerY.id].push(thumbingPair.partnerX)
    //   }

    //   return all
    // }, [])

    const listOfMatchesByUserEmail = partnersToEmail.reduce((all, item) => {
      if (!all.length) {
        all.push({
          name: item.user.name,
          email: item.user.email,
          partners: [item.partner],
        })
        return all
      }

      const indexOfUserToOperateOn = all.findIndex((user) => user.email === item.user.email)
      console.log('indexOfUserToOperateOn', indexOfUserToOperateOn)
      if (indexOfUserToOperateOn === -1) {
        all.push({
          name: item.user.name,
          email: item.user.email,
          partners: [item.partner],
        })
        return all
      }
      all[indexOfUserToOperateOn].partners.push(item.partner)
      return all
    }, [])

    console.log('listOfMatchesByUserEmail', listOfMatchesByUserEmail)
    listOfMatchesByUserEmail.forEach((userObj) => {
      const fields = {
        event,
        user: { name: userObj.name.split(' ')[0], email: userObj.email },
        partnerData: userObj.partners,
      }

      sendEmail(fields)
    })

    // await Promise.all
  })
})
