import { getEventUsers } from '../../gql/queries/users/getEventUsers'
import { getRoundsByEventId } from '../../gql/queries/users/getRoundsByEventId'
import bulkInsertRounds from '../../gql/mutations/users/bulkInsertRounds'
import samyakAlgoPro from './samyakAlgoPro'
import createRoundsMap from './createRoundsMap'
import orm from '../../services/orm'
import { omniFinishRounds, createNewRooms } from './runEventHelpers'
import updateCurrentRoundByEventId from '../../gql/mutations/event/updateCurrentRoundByEventId'

let betweenRoundsTimeout
let roundsTimeout
let currentRound = 0
const runEvent = async (req, res) => {
  console.log('runEvent ran')
  const eventId = req.params.id
  const numRounds = req.body.num_rounds
  const roundLength = req.body.round_length
  const roundInterval = req.body.round_interval || 10000

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
    clearTimeout(betweenRoundsTimeout)
    clearTimeout(roundsTimeout)
    currentRound = 0
    console.log('EVENT FINISHED')

    return
  }

  // to be used for timeout function
  const delayBetweenRounds = currentRound === 0 ? 0 : roundInterval

  // big function defining what to do during each round
  betweenRoundsTimeout = setTimeout(async () => {
    let eventUsers

    // get the users for a given event
    try {
      const eventUsersResponse = await orm.request(getEventUsers, { event_id: eventId })
      eventUsers = eventUsersResponse.data.event_users
    } catch (error) {
      console.log('error = ', error)

      clearTimeout(roundsTimeout)
    }

    // see which users are online
    // try this same idea with a better online_users table in Hasura
    // const onlineEventUsers = eventUsers
    //   .filter((user) => {
    //     const lastSeen = new Date(user.user.last_seen).getTime()
    //     const now = Date.now()
    //     const seenInLast60secs = now - lastSeen < 60000
    //     return seenInLast60secs
    //   })
    //   .map((user) => user.user.id)
    // console.log('onlineEventUsers', onlineEventUsers)

    // hard code users online
    const onlineEventUsers = eventUsers.map((user) => user.user.id)
    console.log('onlineEventUsers', onlineEventUsers)

    // get data for rounds
    let roundsData

    try {
      const getRoundsResponse = await orm.request(getRoundsByEventId, { event_id: eventId })
      roundsData = getRoundsResponse.data
    } catch (error) {
      console.log('getRounds error = ', error)
      clearTimeout(roundsTimeout)
    }

    console.log('roundsData', roundsData);


    // create an array of pairings for a given round/event for use in algorithm
    const variablesArr = []
    const roundsMap = createRoundsMap(roundsData, onlineEventUsers)
    console.log('roundsMap', roundsMap)

    const { pairingsArray: newPairings } = samyakAlgoPro(onlineEventUsers, roundsMap)

    console.log('newPairings', newPairings);

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
    let insertedRounds
    try {
      insertedRounds = await orm.request(bulkInsertRounds, {
        objects: variablesArr,
      })
    } catch (e) {
      // if theres an error here, we should send a response to the client and display a warning
      console.log('getRounds error = ', e)
      clearTimeout(roundsTimeout)
    }
    const currentRoundData = insertedRounds.data.insert_rounds.returning

    let newCurrentRound
    // increment current round in events table
    try {
      console.log('trying to increment round')
      newCurrentRound = currentRound++
      await orm.request(updateCurrentRoundByEventId, { id: eventId, newCurrentRound })
    } catch (e) {
      console.log(e, 'Error incrementing round_number in db')
    }

    console.log(newCurrentRound)

    // create new rooms
    try {
      console.log('trying to create new rooms')
      await createNewRooms(currentRoundData)
    } catch (e) {
      console.log(e)
    }

    if (currentRound > 0) {
      console.log(currentRound, 'in last If block')
      clearTimeout(roundsTimeout)
      roundsTimeout = setTimeout(() => runEvent(req, res), roundLength)
    }
  }, delayBetweenRounds)
}

export default runEvent
