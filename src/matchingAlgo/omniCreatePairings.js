import * as Sentry from '@sentry/node'

import { bulkInsertPartners } from '../gql/mutations'
import orm from '../services/orm'
import getAllRoundsDataForOnlineUsers from '../services/rooms/getAllRoundsDataForOnlineUsers'
import getOnlineEventUsers from '../services/rooms/getOnlineEventUsers'
import getPredeterminedPartners from '../services/rooms/getPredeterminedPartners'
import transformPairingsToGqlVars from '../services/rooms/transformPairingsToGqlVars'
import makePairings from './makePairings'
import makePairingsFromSamyakAlgo from './makePairingsFromSamyakAlgo'

const omniCreatePairings = async ({
  eventId,
  currentRound,
  fromLobbyScan = undefined,
  useSamyakAlgo,
}) => {
  try {
    // get all online users for this eventId
    const [userIds, onlineUsers] = await getOnlineEventUsers(eventId)

    if (userIds.length < 2 && fromLobbyScan) {
      console.log('not enough to pair from lobby scan')
      return {
        isSamyakAlgo: false,
        eventEndedEarly: false,
      }
    }
    const isTwoSidedEvent = onlineUsers.find((eventUser) => eventUser.side)

    const allRoundsDataForOnlineUsers = await getAllRoundsDataForOnlineUsers(userIds)
    const predeterminedPartnersQueryResponse = await getPredeterminedPartners({
      userIds,
      eventId,
    })

    let pairings
    let isSamyakAlgo = false

    // revert 1 to 15
    if ((onlineUsers.length < 15 || useSamyakAlgo) && !isTwoSidedEvent) {
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
    const tooManyBadPairings = numNullPairings >= onlineUsers.length / 2 || pairings.length === 0

    if (tooManyBadPairings && !fromLobbyScan) {
      console.log('ended event early')
      return {
        isSamyakAlgo: false,
        eventEndedEarly: true,
      }
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

    return {
      isSamyakAlgo,
      eventEndedEarly: false,
    }
  } catch (error) {
    console.log('omniCreatePairings -> error', error)
    Sentry.captureException(error)
  }
}

export default omniCreatePairings
