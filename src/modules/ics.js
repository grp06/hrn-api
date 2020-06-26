const ics = require('ics')
 
const event = {
  start: [2018, 5, 30, 6, 30],
  duration: { hours: 6, minutes: 30 },
  title: 'Bolder Boulder',
  description: 'Annual 10-kilometer run in Boulder, Colorado',
  location: 'Folsom Field, University of Colorado (finish line)',
  url: 'http://www.bolderboulder.com/',
}

 
export const iCalString = ics.createEvent(event, (error, value) => {
  if (error) {
    console.log(error)
    return
  }

  return value
 
  console.log(value)
  // BEGIN:VCALENDAR
  // VERSION:2.0
  // CALSCALE:GREGORIAN
  // PRODID:adamgibbons/ics
  // METHOD:PUBLISH
  // X-PUBLISHED-TTL:PT1H
  // BEGIN:VEVENT
  // UID:d9e5e080-d25e-11e8-806a-e73a41d3e47b
  // SUMMARY:Bolder Boulder
  // DTSTAMP:20181017T204900Z
  // DTSTART:20180530T043000Z
  // DESCRIPTION:Annual 10-kilometer run in Boulder\, Colorado
  // X-MICROSOFT-CDO-BUSYSTATUS:BUSY
  // URL:http://www.bolderboulder.com/
  // GEO:40.0095;105.2669
  // LOCATION:Folsom Field, University of Colorado (finish line)
  // STATUS:CONFIRMED
  // CATEGORIES:10k races,Memorial Day Weekend,Boulder CO
  // ORGANIZER;CN=Admin:mailto:Race@BolderBOULDER.com
  // ATTENDEE;RSVP=TRUE;ROLE=REQ-PARTICIPANT;PARTSTAT=ACCEPTED;CN=Adam Gibbons:mailto:adam@example.com
  // ATTENDEE;RSVP=FALSE;ROLE=OPT-PARTICIPANT;DIR=https://linkedin.com/in/brittanyseaton;CN=Brittany
  //   Seaton:mailto:brittany@example2.org
  // DURATION:PT6H30M
  // END:VEVENT
  // END:VCALENDAR
})