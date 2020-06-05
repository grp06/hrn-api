import completeRooms from './complete-rooms'

import { getEventUsers } from '../../gql/queries/users/getEventUsers'
import { getRoundsByEventId } from '../../gql/queries/users/getRoundsByEventId'
import updateRoundEndedAt from '../../gql/mutations/users/updateRoundEndedAt'
import bulkInsertRounds from '../../gql/mutations/users/bulkInsertRounds'
import createRooms from './create-rooms'
import samyakAlgoPro from './samyakAlgoPro'
import createRoundsMap from './createRoundsMap'
import orm from '../../services/orm'

let betweenRoundsTimeout
let roundsTimeout
let currentRound = 0
let totalRounds
const runEvent = async (req, res) => {
  const eventId = req.params.id
  const roundLength = 120000

  const completedRoomsPromises = await completeRooms()

  if (req.body.reset) {
    currentRound = 0
    clearTimeout(betweenRoundsTimeout)
    clearTimeout(roundsTimeout)
    return
  }

  await Promise.all(completedRoomsPromises)

  // set and end time for the round we just completed
  if (currentRound > 0) {
    await orm.request(updateRoundEndedAt, {
      event_id: eventId,
      roundNumber: currentRound,
      endedAt: new Date().toISOString(),
    })
  }

  const numRounds = 3
  if (currentRound === totalRounds) {
    clearTimeout(betweenRoundsTimeout)
    clearTimeout(roundsTimeout)
    currentRound = 0
    return
  }

  const delayBetweenRounds = currentRound === 0 ? 0 : 20000

  betweenRoundsTimeout = setTimeout(async () => {
    let eventUsers

    try {
      const eventUsersResponse = await orm.request(getEventUsers, { event_id: eventId })
      eventUsers = eventUsersResponse.data.event_users
    } catch (e) {
      // if theres an error here, we should send a response to the client and display a warning

      clearTimeout(roundsTimeout)
    }

    const onlineUsers = eventUsers
      .filter((user) => {
        const lastSeen = new Date(user.user.last_seen).getTime()
        const now = Date.now()
        const seenInLast30secs = now - lastSeen < 30000
        return seenInLast30secs
      })
      .map((user) => user.user.id)
    console.log('onlineUsers', onlineUsers)
    totalRounds = onlineUsers.length - 1
    console.log('totalRounds', totalRounds)
    // hardcoding admin ID into online users. need to set this up on the frontend

    // we should set a min number of users here --- and send a warning back to the UI
    if (!onlineUsers.length) {
      console.log('not enough users to start event')
      clearTimeout(roundsTimeout)
    }

    let roundsData
    try {
      const getRoundsResponse = await orm.request(getRoundsByEventId, { event_id: eventId })
      roundsData = getRoundsResponse.data
    } catch (e) {
      // if theres an error here, we should send a response to the client and display a warning
      console.log('getRounds error = ', e)
      clearTimeout(roundsTimeout)
    }

    const variablesArr = []
    const roundsMap = createRoundsMap(roundsData, onlineUsers)

    const { pairingsArray } = samyakAlgoPro(onlineUsers, roundsMap)

    // maybe a .map would be cleaner here?
    pairingsArray.forEach((pairing) => {
      variablesArr.push({
        partnerX_id: pairing[0],
        partnerY_id: pairing[1],
        round_number: currentRound + 1,
        event_id: eventId,
      })
    })

    let insertedRounds
    try {
      insertedRounds = await orm.request(bulkInsertRounds, {
        objects: variablesArr,
      })
      console.log('inserted rounds - ', insertedRounds)
    } catch (e) {
      // if theres an error here, we should send a response to the client and display a warning
      console.log('getRounds error = ', e)
      clearTimeout(roundsTimeout)
    }

    const currentRoundData = insertedRounds.data.insert_rounds.returning
    const newCurrentRound = currentRoundData.reduce((all, item) => {
      if (item.round_number > all) {
        return item.round_number
      }
      return all
    }, 0)

    currentRound = newCurrentRound
    console.log('NEW CURRENT ROUND = ', newCurrentRound)

    const allRoomIds = currentRoundData.reduce((all, item) => {
      all.push(item.id)
      return all
    }, [])

    // on the frontend maybe consider putting in a delay on the 'join room'  function
    // to make sure clients dont join rooms before they're created? Unlikely, but technically possible
    const createdRoomsPromises = await createRooms(allRoomIds)
    await Promise.all(createdRoomsPromises)

    if (currentRound <= numRounds) {
      console.log('created rooms')
      console.log('TIMEOUT = ', roundsTimeout)

      clearTimeout(roundsTimeout)
      roundsTimeout = setTimeout(() => runEvent(req, res), roundLength)
    }
  }, delayBetweenRounds)
}

export default runEvent
