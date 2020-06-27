const ical = require('ical-generator')
const moment = require('moment')

export const makeCalendarInvite = (event_name, host_name, event_id, event_start_time) => {
  const cal = ical({
    domain: 'https://launch.hirightnow.co',
    prodId: { company: 'HiRightNow', product: 'ical-generator' },
    timezone: 'UTC',
  })
  
  // create a new event
  const event = cal.createEvent({
    start: moment(event_start_time),
    end: moment(event_start_time).add(1, 'hour'),
    timestamp: moment(),
    summary: event_name,
    organizer: `${host_name} <info@hirightnow.co>`,
    location: `https://launch.hirightnow.co/events/${event_id}`
  })
  
  // get the iCal string
  const iCalString = cal.toString() // --> "BEGIN:VCALENDAR…"
  return iCalString
}
// Create new Calendar and set optional fields
