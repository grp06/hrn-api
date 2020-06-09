import { getEventUsers } from '../../gql/queries/users/getEventUsers'
import { getRoundsByEventId } from '../../gql/queries/users/getRoundsByEventId'
import bulkInsertRounds from '../../gql/mutations/users/bulkInsertRounds'
import samyakAlgoPro from './samyakAlgoPro'
import createRoundsMap from './createRoundsMap'
import orm from '../../services/orm'
import { omniFinishRounds, createNewRooms } from './runEventHelpers'

let betweenRoundsTimeout
let roundsTimeout
let currentRound = 0
const runEvent = async (req, res) => {
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
    const onlineEventUsers = eventUsers
      .filter((user) => {
        const lastSeen = new Date(user.user.last_seen).getTime()
        const now = Date.now()
        const seenInLast60secs = now - lastSeen < 60000
        return seenInLast60secs
      })
      .map((user) => user.user.id)
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

    // create an array of pairings for a given round/event for use in algorithm
    const variablesArr = []
    const roundsMap = createRoundsMap(roundsData, onlineEventUsers)
    console.log('roundsMap', roundsMap)

    const { newPairings } = samyakAlgoPro(onlineEventUsers, roundsMap)

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
      console.log('inserted rounds - ', insertedRounds)
    } catch (e) {
      // if theres an error here, we should send a response to the client and display a warning
      console.log('getRounds error = ', e)
      clearTimeout(roundsTimeout)
    }

    // TODO: update round data in db
    // is this just checking what round to update to? not sure what's going on here
    const currentRoundData = insertedRounds.data.insert_rounds.returning
    const newCurrentRound = currentRoundData.reduce((all, item) => {
      if (item.round_number > all) {
        return item.round_number
      }
      return all
    }, 0)

    currentRound = newCurrentRound
    console.log('NEW CURRENT ROUND = ', newCurrentRound)

    // create new rooms
    try {
      console.log('trying to create new rooms');
      await createNewRooms(currentRoundData)
    } catch {
      console.log(e)
    }


    if (currentRound > 0) {
      console.log('created rooms')

      clearTimeout(roundsTimeout)
      roundsTimeout = setTimeout(() => runEvent(req, res), roundLength)
    }
  }, delayBetweenRounds)
}

export default runEvent
