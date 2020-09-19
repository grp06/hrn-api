import * as Sentry from '@sentry/node'

import getAvailableLobbyUsers from '../../../gql/queries/users/getAvailableLobbyUsers'
import getPartnersFromListOfUserIds from '../../../gql/queries/users/getPartnersFromListOfUserIds'
import makePairings from '.'
import orm from '../../../services/orm'

const createPairingsFromOnlineUsers = async (eventId, currentRound) => {
  console.log('createPairingsFromOnlineUsers -> eventId', eventId)
  // get all online users for this eventId
  const onlineUsersResponse = await orm.request(getAvailableLobbyUsers, {
    eventId,
  })

  if (onlineUsersResponse.errors) {
    Sentry.captureException(onlineUsersResponse.errors[0].message)
    throw new Error(onlineUsersResponse.errors[0].message)
  }

  const onlineUsers = onlineUsersResponse.data.online_users

  const userIds = onlineUsers.map((user) => user.id)
  const partnersListResponse = await orm.request(getPartnersFromListOfUserIds, {
    userIds,
  })

  if (partnersListResponse.errors) {
    Sentry.captureException(partnersListResponse.errors[0].message)
    throw new Error(partnersListResponse.errors[0].message)
  }

  const allRoundsDataForOnlineUsers = partnersListResponse.data.partners

  const pairings = makePairings({
    onlineUsers,
    allRoundsDataForOnlineUsers,
    currentRound,
    eventId,
  })

  return [pairings, onlineUsers]
}

export default createPairingsFromOnlineUsers
