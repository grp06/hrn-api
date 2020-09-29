import * as Sentry from '@sentry/node'

import getAvailableLobbyUsers from '../../../gql/queries/users/getAvailableLobbyUsers'
import getPartnersFromListOfUserIds from '../../../gql/queries/users/getPartnersFromListOfUserIds'
import makePairings from '.'
import orm from '../../../services/orm'
import { endEvent } from '../runEventHelpers'
import transformPairingsToGqlVars from '../transformPairingsToGqlVars'
import bulkInsertPartners from '../../../gql/mutations/users/bulkInsertPartners'

const _ = require('lodash')

const createPairingsFromOnlineUsers = async ({ eventId, currentRound, fromLobbyScan }) => {
  try {
    // get all online users for this eventId
    const onlineUsersResponse = await orm.request(getAvailableLobbyUsers, {
      eventId,
    })

    if (onlineUsersResponse.errors) {
      Sentry.captureException(onlineUsersResponse.errors[0].message)
      throw new Error(onlineUsersResponse.errors[0].message)
    }

    const onlineUsers = onlineUsersResponse.data.online_users
    console.log('createPairingsFromOnlineUsers -> onlineUsers', onlineUsers)

    if (onlineUsers.length < 2 && fromLobbyScan) {
      console.log('not enough to pair from lobby scan')
      return null
    }

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

    // don't end it if we're just dealing with 3 people, we're most likely testing
    const tooManyBadPairings = pairings.length > 3 && pairings.length < onlineUsers.length / 2
    if (tooManyBadPairings && !fromLobbyScan) {
      console.log('no more pairings, end the event')
      endEvent(eventId)
      return 'ended event early'
    }

    const flattenedPairings = _.flatten(pairings)
    const difference = _.difference(userIds, flattenedPairings)
    console.log(' difference', difference)

    // figure out which users didn't get a partner, push them to the pariings array with a null partner
    difference.forEach((userWithoutPairing) => pairings.push([userWithoutPairing, null]))
    console.log('pairings = ', pairings)
    // transform pairings to be ready for insertion to partners table
    const variablesArray = transformPairingsToGqlVars({ pairings, eventId, round: currentRound })

    // write to partners table
    const bulkInsertPartnersRes = await orm.request(bulkInsertPartners, {
      objects: variablesArray,
    })

    if (bulkInsertPartnersRes.errors) {
      throw new Error(bulkInsertPartnersRes.errors[0].message)
    }
  } catch (error) {
    Sentry.captureException(error)
    console.log('error = ', error)
  }
}

export default createPairingsFromOnlineUsers
