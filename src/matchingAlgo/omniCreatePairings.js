import * as Sentry from '@sentry/node'
import makePairingsFromSamyakAlgo from './makePairingsFromSamyakAlgo'

import makePairings from './makePairings'
import orm from '../services/orm'
import transformPairingsToGqlVars from '../routes/rooms/transformPairingsToGqlVars'
import { bulkInsertPartners } from '../gql/mutations'
import getOnlineUsers from './getOnlineUsers'
import getAllRoundsDataForOnlineUsers from './getAllRoundsDataForOnlineUsers'
import getPredeterminedPartners from './getPredeterminedPartners'

const omniCreatePairings = async ({ eventId, currentRound, fromLobbyScan, useSamyakAlgo }) => {
  try {
    // get all online users for this eventId
    const [userIds, onlineUsers] = await getOnlineUsers(eventId)

    if (userIds.length < 2 && fromLobbyScan) {
      console.log('not enough to pair from lobby scan')
      return null
    }

    const allRoundsDataForOnlineUsers = await getAllRoundsDataForOnlineUsers(userIds)
    const predeterminedPartnersQueryResponse = await getPredeterminedPartners({
      userIds,
      eventId,
    })

    let pairings
    let isSamyakAlgo

    // revert 1 to 15
    if (onlineUsers.length < 15 || useSamyakAlgo) {
      console.log('making assignments with samyak algo')
      pairings = makePairingsFromSamyakAlgo({
        allRoundsDataForOnlineUsers,
        userIds,
        eventId,
      })
      isSamyakAlgo = true
    } else {
      console.log('making assignment with the new algo')
      pairings = makePairings({
        onlineUsers,
        allRoundsDataForOnlineUsers,
        currentRound,
        eventId,
        fromLobbyScan,
        userIds,
        predeterminedPartnersQueryResponse,
      })
    }

    const numNullPairings = pairings.reduce((all, item) => {
      if (item[1] === null) {
        all += 1
      }
      return all
    }, 0)

    // don't end it if we're just dealing with 3 people, we're most likely testing
    let tooManyBadPairings = numNullPairings >= onlineUsers.length / 2 || pairings.length === 0
    if (eventId === 656) {
      tooManyBadPairings = false
    }
    if (tooManyBadPairings && !fromLobbyScan) {
      console.log('ended event early')
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
    return isSamyakAlgo
  } catch (error) {
    console.log('omniCreatePairings -> error', error)
    Sentry.captureException(error)
  }
}

export default omniCreatePairings
