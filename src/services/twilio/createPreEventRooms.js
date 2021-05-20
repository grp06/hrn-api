import client from '../../extensions/twilioClient'

/**
 * Create X video rooms
 * @param numRooms
 * @param eventId
 */
const createPreEventRooms = async (numRooms, eventId) => {
  // Generate an array of length = `numRooms`
  const roomsArray = Array.from(Array(3).keys())

  // Create a room for each
  return roomsArray.map((roomNr) =>
    client.video.rooms.create({
      uniqueName: `${eventId}-pre-event-${roomNr + 1}`,
      type: 'group',
      videoCodecs: ['VP8'],
    })
  )
}

export default createPreEventRooms
