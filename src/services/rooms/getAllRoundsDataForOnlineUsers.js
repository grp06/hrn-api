import * as Sentry from '@sentry/node'

import { getPartnersFromListOfUserIds } from '../../gql/queries'
import orm from '../orm'

const getAllRoundsDataForOnlineUsers = async (userIds) => {
  console.log('(getAllRoundsDataForOnlineUsers) 🔢 User ids:', userIds)

  const partnersListResponse = await orm.request(getPartnersFromListOfUserIds, {
    userIds,
  })

  if (partnersListResponse.errors) {
    Sentry.captureException(partnersListResponse.errors[0].message)
    throw new Error(partnersListResponse.errors[0].message)
  }

  return partnersListResponse.data.partners
}

export default getAllRoundsDataForOnlineUsers
