import * as Sentry from '@sentry/node'
import { getRoundsByEventId } from '../../gql/queries/users/getRoundsByEventId'
import bulkInsertRounds from '../../gql/mutations/users/bulkInsertRounds'
import { getEventStatusByEventId } from '../../gql/queries/events/getEventStatusByEventId'
import samyakAlgoPro from './samyakAlgoPro'
import createRoundsMap from './createRoundsMap'
import orm from '../../services/orm'
import { omniFinishRounds, endEvent, resetEvent } from './runEventHelpers'
import updateEventObject from '../../gql/mutations/event/updateEventObject'
import getOnlineUsers from './getOnlineUsers'


const runEvent = async (req, res, currentRound = 0, betweenRoundsTimeout, roundsTimeout) => {
  const oneMinuteInMs = 60000
  const eventId = req.params.id
  const numRounds = req.body.num_rounds || 10 // default ten rounds
  const round_length = req.body.round_length * oneMinuteInMs || 300000 // default 5 minute rounds
  console.log(`currentRound: ${currentRound} ||| eventId ${eventId}`)

  const roundInterval = req.body.round_interval || 20000 // default 35 second interval

  if (req.body.reset) {
    await resetEvent(eventId, betweenRoundsTimeout, roundsTimeout)

    console.log('reset event complete,')
    console.log('eventId = ', eventId)

    return
  }

  let eventStatus
  try {
    const eventStatusResponse = await orm.request(getEventStatusByEventId, { eventId })
    eventStatus = eventStatusResponse.data.events.status
    console.log('runEvent -> eventStatus', eventStatus)
  } catch (error) {
    console.log(error)
    Sentry.captureException(error)
  }

  if (eventStatus !== 'not-started' || eventStatus !== 'complete') {
    // ensures that rooms are closed before next round
    try {
      await omniFinishRounds(currentRound, eventId)
    } catch (error) {
      Sentry.captureException(error)
      console.log(error)
    }

    // end event if numRounds reached
    if (parseInt(currentRound, 10) === parseInt(numRounds, 10)) {
      console.log('reached last round, going to end event')

      setTimeout(() => {
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
      try {
        onlineEventUsers = await getOnlineUsers(eventId)
      } catch (error) {
        console.log('error = ', error)
        Sentry.captureException(error)
        return clearTimeout(roundsTimeout)
      }

      // get data for rounds
      let roundsData

      try {
        const getRoundsResponse = await orm.request(getRoundsByEventId, { event_id: eventId })
        roundsData = getRoundsResponse.data
      } catch (error) {
        Sentry.captureException(error)
        return clearTimeout(roundsTimeout)
      }

      // create an array of pairings for a given round/event for use in algorithm
      const variablesArr = []
      const roundsMap = createRoundsMap(roundsData, onlineEventUsers)

      const { pairingsArray: newPairings } = samyakAlgoPro(onlineEventUsers, roundsMap)
      console.log('betweenRoundsTimeout -> newPairings', newPairings)
      console.log('eventId = ', eventId)
      // do something to check for NULL matches or if game is over somehow
      // -------------------------------mutation to update eventComplete (ended_at in db)

      const numNullPairings = newPairings.reduce((all, item, index) => {
        if (item.indexOf(null) > -1) {
          all += 1
        }
        return all
      }, 0)

      if (newPairings.length === 0 || numNullPairings > onlineEventUsers.length / 2) {
        return setTimeout(() => {
          endEvent(eventId, betweenRoundsTimeout, roundsTimeout)
        }, roundInterval / 2)
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
        Sentry.captureException(error)
        console.log('error inserting rounds data = ', error)
        clearTimeout(roundsTimeout)
      }

      // increment current round in events table
      try {
        await orm.request(updateEventObject, {
          id: eventId,
          newCurrentRound: currentRound + 1,
          newStatus: 'room-in-progress',
        })
        console.log('set room to in-progress')
        console.log('eventId = ', eventId)
      } catch (error) {
        Sentry.captureException(error)
      }

      console.log('currentRound = ', currentRound)

      clearTimeout(roundsTimeout)
      roundsTimeout = setTimeout(
        () => runEvent(req, res, currentRound + 1, betweenRoundsTimeout, roundsTimeout),
        round_length
      )
    }, delayBetweenRounds)
  }
}

export default runEvent
