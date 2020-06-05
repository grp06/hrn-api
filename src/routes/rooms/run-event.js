import completeRooms from './complete-rooms'
import { getEventUsers } from '../../gql/queries/users/getEventUsers'
import { getRoundsByEventId } from '../../gql/queries/users/getRoundsByEventId'
import updateRoundEndedAt from '../../gql/mutations/users/updateRoundEndedAt'
import bulkInsertRounds from '../../gql/mutations/users/bulkInsertRounds'
import createRooms from './create-rooms'
import samyakAlgoPro from './samyakAlgoPro'
import createRoundsMap from './createRoundsMap'
import orm from '../../services/orm'

let currentRound = 0
const runEvent = async (req, res) => {
  const eventId = req.params.id
  const numRounds = req.body.num_rounds
  const roundLength = 10000
  let timeout

  const completedRoomsPromises = await completeRooms()
  console.log('rooms completed = ', completedRoomsPromises.length)

  await Promise.all(completedRoomsPromises)
  console.log('end of round = ', currentRound)

  // set ended_at for the round we just completed
  if (currentRound > 0) {
    console.log('updating last seen')

    try {
      await orm.request(updateRoundEndedAt, {
        event_id: eventId,
        roundNumber: currentRound,
        endedAt: new Date().toISOString(),
      })
    } catch (e) {
      res.json(e)
    }

  }

  // const numRounds = 3
  // stop if round limit reached
  console.log('current, max', currentRound, numRounds)
  if (currentRound === numRounds) {
    return clearTimeout(timeout)
  }

  const delayBetweenRounds = currentRound === 0 ? 0 : 10000

  //this function goes until the end of the file, let's make it more modular.
  setTimeout(async () => {
    let eventUsers

    //get the users for a given event
    try {
      const eventUsersResponse = await orm.request(getEventUsers, { event_id: eventId })
      eventUsers = eventUsersResponse.data.event_users
    } catch (e) {
      // if theres an error here, we should send a response to the client and display a warning
      console.log('get event users error = ', e)
      clearTimeout(timeout)
    }

    //see which users are online... maybe we should tell people on front end they need to be active or something?
    const onlineEventUsers = eventUsers
      .filter((user) => {
        const lastSeen = new Date(user.user.last_seen).getTime()
        const now = Date.now()
        const seenInLast30secs = now - lastSeen < 30000
        return seenInLast30secs
      })
      .map((user) => user.user.id)
    console.log('onlineEventUsers', onlineEventUsers)

    // hardcoding admin ID into online users. need to set this up on the frontend

    // we should set a min number of users here --- and send a warning back to the UI
    if (!onlineEventUsers.length) {
      console.log('not enough users to start event')
      clearTimeout(timeout)
    }

    //get data for rounds
    let roundsData
    try {
      const getRoundsResponse = await orm.request(getRoundsByEventId, { event_id: eventId })
      roundsData = getRoundsResponse.data
      console.log('got rounds data = ')
    } catch (e) {
      // if theres an error here, we should send a response to the client and display a warning
      console.log('getRounds error = ', e)
      clearTimeout(timeout)
    }

    //create an array of pairings for a given rounnd/event for use in algorithm
    const variablesArr = []
    const roundsMap = createRoundsMap(roundsData, onlineEventUsers)
    console.log('roundsMap', roundsMap)

    const { pairingsArray } = samyakAlgoPro(onlineEventUsers, roundsMap)

    // maybe a .map would be cleaner here?
    pairingsArray.forEach((pairing) => {
      variablesArr.push({
        partnerX_id: pairing[0],
        partnerY_id: pairing[1],
        round_number: currentRound + 1,
        event_id: eventId,
      })
    })

    //insert algorithm result into db
    let insertedRounds
    try {
      insertedRounds = await orm.request(bulkInsertRounds, {
        objects: variablesArr,
      })
      console.log('inserted rounds - ', insertedRounds)
    } catch (e) {
      // if theres an error here, we should send a response to the client and display a warning
      console.log('getRounds error = ', e)
      clearTimeout(timeout)
    }

    //is this just checking what round to update to? not sure what's going on here
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
    const createdRoomsPromises = await createRooms(allRoomIds) //Twilio call
    await Promise.all(createdRoomsPromises)

    if (currentRound <= numRounds) {
      console.log('created rooms')
      clearTimeout(timeout)
      timeout = setTimeout(() => runEvent(req, res), roundLength)
    }
  }, delayBetweenRounds)
}

export default runEvent
