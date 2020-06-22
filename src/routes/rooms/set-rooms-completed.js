import client from '../../extensions/twilioClient'

const setRoomsCompleted = async (eventId) => {
  const allRooms = await client.video.rooms.list({ status: 'in-progress' })
  const listOfRoomsToComplete = allRooms.filter((room) => {
    return room.uniqueName.indexOf(`${eventId}-`) > -1
  })
  console.log('completing this many rooms', listOfRoomsToComplete.length)

  return listOfRoomsToComplete.map((r) => {
    return client.video.rooms(r.sid).update({ status: 'completed' })
  })
}

export default setRoomsCompleted
