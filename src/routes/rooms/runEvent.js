import { getOnlineUsersByEventId } from '../../gql/queries/users/getOnlineUsersByEventId'
import { getRoundsByEventId } from '../../gql/queries/users/getRoundsByEventId'
import bulkInsertRounds from '../../gql/mutations/users/bulkInsertRounds'
import samyakAlgoPro from './samyakAlgoPro'
import createRoundsMap from './createRoundsMap'
import orm from '../../services/orm'
import { omniFinishRounds, endEvent } from './runEventHelpers'
import updateCurrentRoundByEventId from '../../gql/mutations/event/updateCurrentRoundByEventId'
import updateEventStatus from '../../gql/mutations/event/updateEventStatus'
import setRoomsCompleted from './set-rooms-completed'
import * as Sentry from '@sentry/node'

let betweenRoundsTimeout
let roundsTimeout
let currentRound = 0
const runEvent = async (req, res) => {
  const oneMinuteInMs = 60000
  const eventId = req.params.id
  const numRounds = req.body.num_rounds || 10 // default ten rounds
  const round_length = req.body.round_length * oneMinuteInMs || 300000 // default 5 minute rounds

  const roundInterval = req.body.round_interval || 20000 // default 15 second interval

  if (req.body.reset) {
    console.log('resetting event')
    const completedRoomsPromises = await setRoomsCompleted(eventId)
    await Promise.all(completedRoomsPromises)
    currentRound = 0
    clearTimeout(betweenRoundsTimeout)
    clearTimeout(roundsTimeout)
    return
  }
  // ensures that rooms are closed before next round
  try {
    await omniFinishRounds(currentRound, eventId)
  } catch (error) {
    Sentry.captureException(error)
    console.log(error)
  }

  // end event if numRounds reached
  if (parseInt(currentRound, 10) === parseInt(numRounds, 10)) {
    console.log('runEvent -> numRounds', numRounds)
    console.log('reached last round, going to end event')

    setTimeout(() => {
      currentRound = 0
      endEvent(eventId, betweenRoundsTimeout, roundsTimeout)
    }, roundInterval / 2)
    return
  }

  // to be used for timeout function
  const delayBetweenRounds = currentRound === 0 ? 0 : roundInterval

  // big function defining what to do during each round
  // first round it executes immediately. Otherwise its every ${roundInterval} secs
  betweenRoundsTimeout = setTimeout(async () => {
    let onlineEventUsers

    // get the online users for a given event by checking updated_at
    try {
      // make the last seen a bit longer to accomodate buffer/lag between clients/server?
      const now = Date.now() // Unix timestamp
      const xMsAgo = 20000 // 20 seconds
      const timestampXMsAgo = now - xMsAgo // Unix timestamp
      const seenAfter = new Date(timestampXMsAgo)

      const eventUsersResponse = await orm.request(getOnlineUsersByEventId, {
        later_than: seenAfter,
        event_id: eventId,
      })

      onlineEventUsers = eventUsersResponse.data.event_users.map((user) => user.user.id)
    } catch (error) {
      Sentry.captureException(error)
      console.log('error = ', error)
      clearTimeout(roundsTimeout)
    }

    // get data for rounds
    let roundsData

    try {
      const getRoundsResponse = await orm.request(getRoundsByEventId, { event_id: eventId })
      roundsData = getRoundsResponse.data
    } catch (error) {
      Sentry.captureException(error)
      console.log('getRounds error = ', error)
      clearTimeout(roundsTimeout)
    }

    // create an array of pairings for a given round/event for use in algorithm
    const variablesArr = []
    const roundsMap = createRoundsMap(roundsData, onlineEventUsers)

    const { pairingsArray: newPairings } = samyakAlgoPro(onlineEventUsers, roundsMap)

    // do something to check for NULL matches or if game is over somehow
    // -------------------------------mutation to update eventComplete (ended_at in db)

    const numNullPairings = newPairings.reduce((all, item, index) => {
      if (item.indexOf(null) > -1) {
        all += 1
      }
      return all
    }, 0)

    if (newPairings.length === 0) {
      console.log('betweenRoundsTimeout -> newPairings.length', newPairings.length)
      setTimeout(() => {
        currentRound = 0
        endEvent(eventId, betweenRoundsTimeout, roundsTimeout)
      }, roundInterval / 2)
      return
    }

    // insert data for given round
    // maybe a .map would be cleaner here?
    newPairings.forEach((pairing) => {
      variablesArr.push({
        partnerX_id: pairing[0],
        partnerY_id: pairing[1],
        round_number: currentRound + 1,
        event_id: eventId,
      })
    })

    // insert new pairings result into db
    try {
      await orm.request(bulkInsertRounds, {
        objects: variablesArr,
      })
    } catch (error) {
      // if theres an error here, we should send a response to the client and display a warning
      Sentry.captureException(error)
      console.log('error inserting rounds data = ', error)
      clearTimeout(roundsTimeout)
    }

    // increment current round in events table
    try {
      // newCurrentRound = currentRound + 1
      currentRound += 1
      const roundUpdated = await orm.request(updateCurrentRoundByEventId, {
        id: eventId,
        newCurrentRound: currentRound,
      })
    } catch (error) {
      Sentry.captureException(error)
      console.log(error, 'Error incrementing round_number in db')
    }

    try {
      await orm.request(updateEventStatus, {
        eventId,
        newStatus: 'room-in-progress',
      })
      console.log('set room to in-progress')
    } catch (error) {
      Sentry.captureException(error)
      console.log('error updating room-in-progress = ', error)
    }

    if (currentRound > 0) {
      clearTimeout(roundsTimeout)
      roundsTimeout = setTimeout(() => runEvent(req, res), round_length)
    }
  }, delayBetweenRounds)
}

export default runEvent
