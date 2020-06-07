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
const runEvent = async (req, res) => {
  const eventId = req.params.id
  const roundLength = process.env.ROUND_LENGTH

  // put in try/catch
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
    try {
      await orm.request(updateRoundEndedAt, {
        event_id: eventId,
        roundNumber: currentRound,
        endedAt: new Date().toISOString(),
      })
    } catch (error) {
      console.log('error = ', error)
    }
  }

  console.log('runEvent -> process.env.NUM_ROUNDS', process.env.NUM_ROUNDS)
  console.log('runEvent -> currentRound', currentRound)
  if (parseInt(currentRound, 10) === parseInt(process.env.NUM_ROUNDS, 10)) {
    clearTimeout(betweenRoundsTimeout)
    clearTimeout(roundsTimeout)
    currentRound = 0
    console.log('EVENT FINISHED')

    return
  }

  const delayBetweenRounds = currentRound === 0 ? 0 : process.env.DELAY_BETWEEN_ROUNDS

  betweenRoundsTimeout = setTimeout(async () => {
    let eventUsers

    try {
      const eventUsersResponse = await orm.request(getEventUsers, { event_id: eventId })
      eventUsers = eventUsersResponse.data.event_users
    } catch (error) {
      console.log('error = ', error)

      clearTimeout(roundsTimeout)
    }

    const onlineUsers = eventUsers
      .filter((user) => {
        const lastSeen = new Date(user.user.last_seen).getTime()
        const now = Date.now()
        const seenInLast60secs = now - lastSeen < 60000
        return seenInLast60secs
      })
      .map((user) => user.user.id)
    console.log('onlineUsers', onlineUsers)

    if (!onlineUsers.length) {
      console.log('not enough users to start event')
      clearTimeout(roundsTimeout)
    }

    let roundsData
    try {
      const getRoundsResponse = await orm.request(getRoundsByEventId, { event_id: eventId })
      roundsData = getRoundsResponse.data
    } catch (error) {
      console.log('getRounds error = ', error)
      clearTimeout(roundsTimeout)
    }

    const variablesArr = []
    const roundsMap = createRoundsMap(roundsData, onlineUsers)

    const { pairingsArray } = samyakAlgoPro(onlineUsers, roundsMap)
    console.log('pairingsArray', pairingsArray)

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

    try {
      const createdRoomsPromises = await createRooms(allRoomIds)
      await Promise.all(createdRoomsPromises)
    } catch (error) {
      console.log('error = ', error)
    }

    if (currentRound <= process.env.NUM_ROUNDS) {
      console.log('created rooms')

      clearTimeout(roundsTimeout)
      roundsTimeout = setTimeout(() => runEvent(req, res), roundLength)
    }
  }, delayBetweenRounds)
}

export default runEvent
