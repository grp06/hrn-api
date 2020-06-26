const ical = require('ical-generator')
const moment = require('moment')

// Create new Calendar and set optional fields
export const cal = ical({
  domain: 'sebbo.net',
  prodId: { company: 'superman-industries.com', product: 'ical-generator' },
  name: 'My Testfeed',
  timezone: 'Europe/Berlin',
})

// You can also set values like this…
cal.domain('sebbo.net')

// create a new event
const event = cal.createEvent({
  start: moment(),
  end: moment().add(1, 'hour'),
  timestamp: moment(),
  summary: 'My Event',
  organizer: 'Sebastian Pekarek <mail@example.com>',
})

// like above, you can also set/change values like this…
event.summary('My Super Mega Awesome Event')

// get the iCal string
export const iCalString = cal.toString() // --> "BEGIN:VCALENDAR…"
