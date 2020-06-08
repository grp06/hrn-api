import setRoomsCompleted from './set-rooms-completed'
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
  const roundLength = 10000

  // const numRounds = req.body.num_rounds
  // const roundLength = req.body.round_length

  // put in try/catch
  // one function lines 21-43 ---> omniFinishRound
  // ensures that rooms are closed before next round
  const completedRoomsPromises = await setRoomsCompleted()

  if (req.body.reset) {
    currentRound = 0
    clearTimeout(betweenRoundsTimeout)
    clearTimeout(roundsTimeout)
    return
  }

  await Promise.all(completedRoomsPromises)

  // set ended_at for the round we just completed
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

    // [1,2,3,4,5]
    // 143-151 createNewRooms()  use const currentRoundData = insertedRounds.data.insert_rounds.returning
    const newRoundsByRowId = currentRoundData.reduce((all, row) => {
      all.push(row.id)
      return all
    }, [])

    // on the frontend maybe consider putting in a delay on the 'join room'  function
    // to make sure clients dont join rooms before they're created? Unlikely, but technically possible
    // twilio room id is the same as the round id in the db
    try {
      const createdRoomsPromises = await createRooms(newRoundsByRowId)
      await Promise.all(createdRoomsPromises)
    } catch (error) {
      console.log('error = ', error)
    }

    if (currentRound > 1) {
      console.log('created rooms')

      clearTimeout(roundsTimeout)
      roundsTimeout = setTimeout(() => runEvent(req, res), roundLength)
    }
  }, delayBetweenRounds)
}

export default runEvent
