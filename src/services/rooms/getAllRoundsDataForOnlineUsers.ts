import * as Sentry from '@sentry/node'

import getPartnersFromListOfUserIds, {
  Partner,
  PartnersFromListOfUserIdsResponse,
} from '../../gql/queries/getPartnersFromListOfUserIds'
import orm from '../orm'

type GetAllRoundsDataForOnlineUsers = (userIds: number[], roomModeId: number) => Promise<Partner[]>

const getAllRoundsDataForOnlineUsers: GetAllRoundsDataForOnlineUsers = async (
  userIds,
  roomModeId
) => {
  console.log('(getAllRoundsDataForOnlineUsers) 🔢 User ids:', userIds)

  const partnersListResponse: PartnersFromListOfUserIdsResponse = await orm.request(
    getPartnersFromListOfUserIds,
    { userIds, roomModeId },
  )

  if (partnersListResponse.errors) {
    Sentry.captureException(partnersListResponse.errors[0].message)
    throw new Error(partnersListResponse.errors[0].message)
  }

  return partnersListResponse.data.partners
}

export default getAllRoundsDataForOnlineUsers
