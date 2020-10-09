import * as Sentry from '@sentry/node'

import { getPartnersFromListOfUserIds } from '../gql/queries'
import orm from '../services/orm'

const getAllRoundsDataForOnlineUsers = async (userIds) => {
  console.log('getAllRoundsDataForOnlineUsers -> userIds', userIds)
  const partnersListResponse = await orm.request(getPartnersFromListOfUserIds, {
    userIds,
  })
  console.log('getAllRoundsDataForOnlineUsers -> partnersListResponse', partnersListResponse)

  if (partnersListResponse.errors) {
    Sentry.captureException(partnersListResponse.errors[0].message)
    throw new Error(partnersListResponse.errors[0].message)
  }

  return partnersListResponse.data.partners
}

export default getAllRoundsDataForOnlineUsers
