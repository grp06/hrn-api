import { getOnlineUsersByEventId } from '../../gql/queries/users/getOnlineUsersByEventId'
import { getRoundsByEventId } from '../../gql/queries/users/getRoundsByEventId'
import bulkInsertRounds from '../../gql/mutations/users/bulkInsertRounds'
import samyakAlgoPro from './samyakAlgoPro'
import createRoundsMap from './createRoundsMap'
import orm from '../../services/orm'
import { omniFinishRounds, createNewRooms } from './runEventHelpers'
import updateCurrentRoundByEventId from '../../gql/mutations/event/updateCurrentRoundByEventId'
import setEventEndedAt from '../../gql/mutations/users/setEventEndedAt'
import updateEventStatus from '../../gql/mutations/users/updateEventStatus'
import setRoomsCompleted from './set-rooms-completed'

let betweenRoundsTimeout
let roundsTimeout
let currentRound = 0
const runEvent = async (req, res) => {
  const eventId = req.params.id
  const numRounds = req.body.num_rounds || 4 // default ten rounds
  const roundLength = req.body.round_length || 20000 // default 5 minute rounds
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
    await omniFinishRounds(req, currentRound, eventId, betweenRoundsTimeout, roundsTimeout)
  } catch (e) {
    console.log(e)
  }

  console.log('runEvent -> numRounds', numRounds)
  console.log('runEvent -> currentRound', currentRound)

  // end event if numRounds reached
  if (parseInt(currentRound, 10) === parseInt(numRounds, 10)) {
    try {
      await orm.request(setEventEndedAt, {
        id: eventId,
        ended_at: new Date().toISOString(),
      })
    } catch (error) {
      console.log('error = ', error)
    }

    try {
      await orm.request(updateEventStatus, {
        eventId,
        newStatus: 'complete',
      })
    } catch (error) {
      console.log('error = ', error)
    }

    clearTimeout(betweenRoundsTimeout)
    clearTimeout(roundsTimeout)
    console.log('EVENT FINISHED')
    return
  }

  // to be used for timeout function
  const delayBetweenRounds = currentRound === 0 ? 0 : roundInterval

  // big function defining what to do during each round
  betweenRoundsTimeout = setTimeout(async () => {
    let onlineEventUsers

    // get the online users for a given event by checking last_seen
    try {
      // make the last seen a bit longer to accomodate buffer/lag between clients/server?
      const now = Date.now() // Unix timestamp
      const millisecondsAgo = 60000 // 60 seconds
      const timeDiff = now - millisecondsAgo // Unix timestamp
      const seenBefore = new Date(timeDiff)

      const eventUsersResponse = await orm.request(getOnlineUsersByEventId, {
        later_than: seenBefore,
        event_id: eventId,
      })

      onlineEventUsers = eventUsersResponse.data.event_users.map((user) => user.user.id)
      console.log('betweenRoundsTimeout -> onlineEventUsers', onlineEventUsers)
    } catch (error) {
      console.log('error = ', error)
      clearTimeout(roundsTimeout)
    }

    // get data for rounds
    let roundsData

    try {
      const getRoundsResponse = await orm.request(getRoundsByEventId, { event_id: eventId })
      roundsData = getRoundsResponse.data
    } catch (error) {
      console.log('getRounds error = ', error)
      clearTimeout(roundsTimeout)
    }

    // create an array of pairings for a given round/event for use in algorithm
    const variablesArr = []
    const roundsMap = createRoundsMap(roundsData, onlineEventUsers)

    const { pairingsArray: newPairings } = samyakAlgoPro(onlineEventUsers, roundsMap)

    // do something to check for NULL matches or if game is over somehow
    // -------------------------------mutation to update eventComplete (ended_at in db)

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
    } catch (e) {
      // if theres an error here, we should send a response to the client and display a warning
      console.log('getRounds error = ', e)
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
      console.log('betweenRoundsTimeout -> roundUpdated', roundUpdated)
    } catch (e) {
      console.log(e, 'Error incrementing round_number in db')
    }

    try {
      await orm.request(updateEventStatus, {
        eventId,
        newStatus: 'room-in-progress',
      })
      console.log('set room to in-progress')
    } catch (error) {
      console.log('error = ', error)
    }

    if (currentRound > 0) {
      console.log(currentRound, 'in last If block')
      clearTimeout(roundsTimeout)
      roundsTimeout = setTimeout(() => runEvent(req, res), roundLength)
    }
  }, delayBetweenRounds)
}

export default runEvent
