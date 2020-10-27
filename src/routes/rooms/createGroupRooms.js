import client from '../../extensions/twilioClient'

const createGroupRooms = async (numRooms, eventId) => {
  const roomsArray = Array.apply(null, Array(numRooms))

  return roomsArray.map((room, idx) => {
    return client.video.rooms.create({
      uniqueName: `${eventId}-pre-event-${idx + 1}`,
      type: 'group',
      videoCodecs: ['VP8'],
    })
  })
}

export default createGroupRooms
