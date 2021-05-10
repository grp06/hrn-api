import client from '../../extensions/twilioClient'

const setRoomsAsCompleted = async (eventId) => {
  const allRooms = await client.video.rooms.list({ status: 'in-progress' })
  const listOfRoomsToComplete = allRooms.filter((room) => {
    return room.uniqueName.indexOf(`${eventId}-`) > -1
  })
  console.log('num rooms to complete = ', listOfRoomsToComplete.length)

  return listOfRoomsToComplete.map((r) => {
    return client.video.rooms(r.sid).update({ status: 'completed' })
  })
}

export default setRoomsAsCompleted
