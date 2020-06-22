import client from '../../extensions/twilioClient'

const createRooms = async (allRowIds, eventId) => {
  return allRowIds.map((rowId) => {
    console.log(`${eventId}-${rowId}`)

    return client.video.rooms.create({
      uniqueName: `${eventId}-${rowId}`,
      type: 'peer-to-peer',
    })
  })
}

export default createRooms
