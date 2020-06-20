import client from '../../extensions/twilioClient'

const setRoomsCompleted = async () => {
  // TODO: scope rooms list by event id
  const allRooms = await client.video.rooms.list({ status: 'in-progress' })
  return allRooms.map((r) => {
    // TODO: scope rooms update by event id
    return client.video.rooms(r.sid).update({ status: 'completed' })
  })
}

export default setRoomsCompleted
