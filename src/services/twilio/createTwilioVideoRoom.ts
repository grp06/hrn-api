import { RoomInstance } from 'twilio/lib/rest/video/v1/room'

import client from '../../extensions/twilioClient'

/**
 * Create a video room
 * @param eventId
 */
const createTwilioVideoRoom = async (eventId: number): Promise<RoomInstance> =>
  client.video.rooms.create({
    uniqueName: `${eventId}-post-event`,
    type: 'group',
    videoCodecs: ['VP8'],
  })

export default createTwilioVideoRoom
