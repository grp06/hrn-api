import client from '../../extensions/twilioClient'

const createRooms = async (allRoomIds) => {
  return allRoomIds.map((id) => {
    return client.video.rooms.create({
      uniqueName: id,
      type: 'peer-to-peer',
    })
  })
}

export default createRooms
