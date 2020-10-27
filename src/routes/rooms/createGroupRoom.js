import client from '../../extensions/twilioClient'

const createGroupRoom = async (eventId) => {
  return client.video.rooms.create({
    uniqueName: `${eventId}-post-event`,
    type: 'group',
    videoCodecs: ['VP8'],
  })
}

export default createGroupRoom
