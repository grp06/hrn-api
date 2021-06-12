import * as Sentry from '@sentry/node'

import { deleteRooms } from '../gql/mutations'
import { getRecentlyCreatedRooms } from '../gql/queries'
import orm from './orm'

const cron = require('node-cron')

const deleteStagnantRooms = async () => {
  const threeHoursInMs = 10800000
  const threeHoursAgoAsTimestamp = new Date(Date.now() - threeHoursInMs).toISOString()

  try {
    const getRecentRoomsRes = await orm.request(getRecentlyCreatedRooms, {
      timestamp: threeHoursAgoAsTimestamp,
    })
    const { rooms } = getRecentRoomsRes.data

    const getStagnantUnclaimedRooms = (allRooms) => {
      const twoHoursOld = 1000 * 60 * 60 * 2

      const now = new Date().getTime()
      const stagnantRoomIds = allRooms.map((room) => {
        const lastActive = new Date(room.updated_at).getTime()
        if (now - lastActive > twoHoursOld) {
          return room.id
        }
      })
      return stagnantRoomIds
    }

    const stagnantUnclaimedRoomIds = getStagnantUnclaimedRooms(rooms)
    console.log('🚀 ~ roomIds to deletee', stagnantUnclaimedRoomIds)

    await orm.request(deleteRooms, {
      roomIds: stagnantUnclaimedRoomIds,
    })
  } catch (error) {
    console.log('error = ', error)
  }
}

cron.schedule('0 0 */3 * * *', async () => {
  deleteStagnantRooms()
})
