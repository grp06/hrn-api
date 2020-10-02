import * as Sentry from '@sentry/node'

import { getPartnersFromListOfUserIds, getAvailableLobbyUsers } from '../gql/queries'

import makePairings from './makePairings'
import orm from '../services/orm'
import transformPairingsToGqlVars from '../routes/rooms/transformPairingsToGqlVars'
import { bulkInsertPartners } from '../gql/mutations'
import getOnlineUsers from './getOnlineUsers'
import getAllRoundsDataForOnlineUsers from './getAllRoundsDataForOnlineUsers'

const _ = require('lodash')

const omniCreatePairings = async ({ eventId, currentRound, fromLobbyScan }) => {
  try {
    // get all online users for this eventId
    const [userIds, onlineUsers] = await getOnlineUsers(eventId)

    if (userIds.length < 2 && fromLobbyScan) {
      console.log('not enough to pair from lobby scan')
      return null
    }

    const allRoundsDataForOnlineUsers = await getAllRoundsDataForOnlineUsers(userIds)

    const pairings = makePairings({
      onlineUsers,
      allRoundsDataForOnlineUsers,
      currentRound,
      eventId,
      fromLobbyScan,
    })

    // don't end it if we're just dealing with 3 people, we're most likely testing
    const tooManyBadPairings = pairings.length > 3 && pairings.length < onlineUsers.length / 2

    if (tooManyBadPairings && !fromLobbyScan) {
      return 'ended event early'
    }

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
    console.log('omniCreatePairings -> error', error)
    Sentry.captureException(error)
  }
}

export default omniCreatePairings
