import completeRooms from './complete-rooms'

import { getEventUsers } from '../../gql/queries/users/getEventUsers'
import { getRoundsByEventId } from '../../gql/queries/users/getRoundsByEventId'
import bulkInsertRounds from '../../gql/mutations/users/bulkInsertRounds'
import createRooms from './create-rooms'
import samyakAlgoPro from './samyakAlgoPro'
import createRoundsMap from './createRoundsMap'
import orm from '../../services/orm'

let currentRound = 0
const runEvent = async (req, res) => {
  const roundLength = 10000
  let timeout
  let eventUsers
  let roundsData

  const completedRoomsPromises = await completeRooms()

  await Promise.all(completedRoomsPromises)
  const eventId = req.params.id

  if (currentRound === 3) {
    console.log('event is over')
    return clearTimeout(timeout)
  }
  try {
    const eventUsersResponse = await orm.request(getEventUsers, { event_id: eventId })
    eventUsers = eventUsersResponse.data.event_users
    console.log('got event users')
  } catch (e) {
    console.log('get event users error = ', e)
  }

  try {
    const getRoundsResponse = await orm.request(getRoundsByEventId, { event_id: eventId })
    roundsData = getRoundsResponse.data
    console.log('got rounds data = ', roundsData)
  } catch (e) {
    console.log('getRounds error = ', e)
  }

  const onlineUsers = eventUsers.map((userObj) => userObj.user.id)

  // hardcoding admin ID into online users. need to set this up on the frontend
  onlineUsers.push(3)

  if (!eventUsers.length) {
    console.log('not enough users to start evetn')
    return res.status(400).json({ error: 'not enough users to start event' })
  }

  const variablesArr = []
  const roundsMap = createRoundsMap(roundsData, onlineUsers)
  const { pairingsArray } = samyakAlgoPro(onlineUsers, roundsMap)

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
    console.log('getRounds error = ', e)
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
  const createdRoomsPromises = await createRooms(allRoomIds)
  await Promise.all(createdRoomsPromises)

  if (currentRound < 4) {
    console.log('created rooms')
    clearTimeout(timeout)
    timeout = setTimeout(() => runEvent(req, res), roundLength)
  }
}

export default runEvent
