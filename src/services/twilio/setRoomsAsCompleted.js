import client from '../../extensions/twilioClient'

const setRoomsAsCompleted = async (roomId) => {
  const allRooms = await client.video.rooms.list({ status: 'in-progress' })

  const listOfRoomsToComplete = allRooms.filter(
    (room) => room.uniqueName.indexOf(`${roomId}-`) > -1
  )

  console.log('num rooms to complete = ', listOfRoomsToComplete.length)

  return listOfRoomsToComplete.map((r) => client.video.rooms(r.sid).update({ status: 'completed' }))
}

export default setRoomsAsCompleted
