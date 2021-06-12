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
      const stagnantRooms = allRooms.filter((room) => {
        const lastActive = new Date(room.room_mode.updated_at).getTime()
        return now - lastActive > twoHoursOld
      })
      return stagnantRooms
    }

    const stagnantUnclaimedRoomIds = getStagnantUnclaimedRooms(rooms).map((room) => room.id)
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
