import * as Sentry from '@sentry/node'

import { resetEvent } from './runEventHelpers'
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

  if (req) {
    // we just called start event. First round
    eventId = parseInt(req.params.eventId, 10)
    numRounds = req.body.num_rounds || 10 // default ten rounds
    round_length = req.body.round_length * oneMinuteInMs || 300000
    currentRound = 1
    if (req.body.reset) {
      await resetEvent(eventId)

      console.log('reset event complete,')

      return
    }
  } else {
    // at least round 2
    eventId = params.eventId
    numRounds = params.numRounds
    round_length = params.round_length
    currentRound = params.currentRound
  }

  // get all online users for this eventId
  let onlineUsers
  try {
    const onlineUsersResponse = await orm.request(getAvailableLobbyUsers, {
      eventId,
    })
    onlineUsers = onlineUsersResponse.data.online_users
    console.log('nextRound -> onlineUsers', onlineUsers)
  } catch (error) {
    Sentry.captureException(error)
    return res.status(500).json({ message: 'Failed to get online users' })
  }

  // get all rows from the partners table from those users
  let partnersRows
  try {
    // get an array of just the userIds from onlineUsers
    const userIds = onlineUsers.map((user) => user.id)
    const partnersList = await orm.request(getPartnersFromListOfUserIds, {
      userIds,
    })
    partnersRows = partnersList.data.partners
    console.log('nextRound -> partnersRows', partnersRows)
  } catch (error) {
    Sentry.captureException(error)
    return res.status(500).json({ message: 'Failed to get partners from list of userIds' })
  }

  console.log('currentRound = ', currentRound)
  // make pairings
  const pairings = makePairings(onlineUsers, partnersRows, currentRound)

  // transform pairings to be ready for insertion to partners table
  const variablesArray = transformPairingsToGqlVars({ pairings, eventId, round: currentRound })
  console.log('nextRound -> variablesArray', variablesArray)

  // write to partners table
  try {
    await orm.request(bulkInsertPartners, {
      objects: variablesArray,
    })
  } catch (error) {
    Sentry.captureException(error)
    return res.status(500).json({ message: 'Failed to insert partners rows into the database' })
  }

  // set event status to in-progress
  try {
    await orm.request(updateEventObject, {
      id: eventId,
      newCurrentRound: currentRound,
      newStatus: 'room-in-progress',
    })
  } catch (error) {
    Sentry.captureException(error)
    // TODO: delete the partners we just inserted (because the host will try again)
    return res.status(500).json({ message: 'Failed to update the event object' })
  }

  initNextRound({ numRounds, eventId, roundLength: round_length, currentRound })
  // only in round 1
  // subscribe to online users
  // check to see if neither has blocked the other
  // pair off and insert rounds

  if (res) {
    return res
      .status(200)
      .json({ message: 'Success starting the event and queueing up next round' })
  }
}

export default nextRound
