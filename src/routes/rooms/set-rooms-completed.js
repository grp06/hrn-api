import client from '../../extensions/twilioClient'

const setRoomsCompleted = async (eventId) => {
  // TODO: scope rooms list by event id
  const allRooms = await client.video.rooms.list({ status: 'in-progress' })
  const listOfRoomsToComplete = allRooms.filter((room) => {
    return room.uniqueName.indexOf(`${eventId}-`) > -1
  })

  return listOfRoomsToComplete.map((r) => {
    // TODO: scope rooms update by event id
    return client.video.rooms(r.sid).update({ status: 'completed' })
  })
}

export default setRoomsCompleted
