import * as Sentry from '@sentry/node'

import { resetEvent, omniFinishRounds, endEvent } from './runEventHelpers'
import orm from '../../services/orm'
import getAvailableLobbyUsers from '../../gql/queries/users/getAvailableLobbyUsers'
import getPartnersFromListOfUserIds from '../../gql/queries/users/getPartnersFromListOfUserIds'
import makePairings from './makePairings'
import transformPairingsToGqlVars from './transformPairingsToGqlVars'
import bulkInsertPartners from '../../gql/mutations/users/bulkInsertPartners'
import updateEventObject from '../../gql/mutations/event/updateEventObject'
import initNextRound from './initNextRound'

const nextRound = async ({ req, res, params }) => {
  const oneMinuteInMs = 60000
  let eventId
  let numRounds
  let round_length
  let currentRound

  try {
    if (req) {
      // we just called start event. First round
      eventId = parseInt(req.params.eventId, 10)
      numRounds = req.body.num_rounds || 10 // default ten rounds
      round_length = req.body.round_length * oneMinuteInMs || 300000
      if (req.body.reset) {
        return resetEvent(eventId)
      }

      await omniFinishRounds(currentRound, eventId)

      currentRound = 1
    } else {
      // at least round 2
      eventId = params.eventId
      numRounds = params.numRounds
      round_length = params.round_length
      currentRound = params.currentRound
    }

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

    if (pairings.length < onlineUsers.length / 2) {
      console.log('no more pairings')
      return endEvent(eventId)
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

    // set event status to in-progress
    const updateEventObjectRes = await orm.request(updateEventObject, {
      id: eventId,
      newCurrentRound: currentRound,
      newStatus: 'room-in-progress',
    })

    if (updateEventObjectRes.errors) {
      Sentry.captureException(updateEventObjectRes.errors[0].message)
      throw new Error(updateEventObjectRes.errors[0].message)
    }
  } catch (error) {
    console.log('error = ', error)
    if (res) {
      Sentry.captureException(error)
      return res.status(500).json({ error })
    }
    return Sentry.captureException(error)
  }

  initNextRound({ numRounds, eventId, roundLength: round_length, currentRound })

  if (res) {
    return res
      .status(200)
      .json({ message: 'Success starting the event and queueing up next round' })
  }

  // only in round 1
  // subscribe to online users
  // check to see if neither has blocked the other
  // pair off and insert rounds
}

export default nextRound
