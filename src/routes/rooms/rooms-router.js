import orm from '../../services/orm'
import axios from 'axios'

import getEventUsers from '../../gql/queries/users/getEventUsers'
import getRoundsByEventId from '../../gql/queries/users/getRoundsByEventId'
import bulkInsertRounds from '../../gql/mutations/users/bulkInsertRounds'
import createRooms from './createRooms'
import completeRooms from './completeRooms'
import samyakAlgoPro from './samyakAlgoPro'
import createRoundsMap from './createRoundsMap'

const express = require('express')
const roomsRouter = express.Router()
const jsonBodyParser = express.json()
const Twilio = require('twilio')
const twilioAccountSid = 'AC712594f590c0d874685c04858f7398f9' // Your Account SID from www.twilio.com/console
const authToken = '95af76d75ebe6811a23ec3b43d7e6477' // Your Auth Token from www.twilio.com/console
const client = new Twilio(twilioAccountSid, authToken)

roomsRouter.post('/start-event/:id', jsonBodyParser, async (req, res, next) => {
  let currentRound = 0
  const roundLength = 30000
  let timeout

  const eventId = req.params.id

  const executeEvent = async () => {
    const completedRoomsPromises = await completeRooms()
    console.log('rooms completed = ', completedRoomsPromises.length)

    await Promise.all(completedRoomsPromises)

    if (currentRound === 3) {
      console.log('event is over')
      return clearTimeout(timeout)
    }

    let eventUsers
    let roundsData

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
      console.log('got rounds data')
    } catch (e) {
      console.log('getRounds error = ', e)
    }

    const onlineUsers = eventUsers.map((userObj) => userObj.user.id)

    // hardcoding admin ID into online users. need to set this up on the frontend
    onlineUsers.push(237)

    if (!eventUsers.length) {
      console.log('not enough users to start evetn')
      return res.status(400).json({ error: 'not enough users to start event' })
    }

    const variablesArr = []
    const roundsMap = createRoundsMap(roundsData, onlineUsers)
    const { pairingsArray, userIdsMap } = samyakAlgoPro(onlineUsers, roundsMap)

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
      console.log('inserted rounds')
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
      timeout = setTimeout(executeEvent, roundLength)
    }
  }

  executeEvent()

  return res.status(200).json({ res: 'response' })
})

roomsRouter.route('/reset-event').get((req, res) => {
  completeRooms()
  clearTimeout(timeout)
  return res.status(200).json({ res: 'reset the event yo' })
})

roomsRouter
  .route('/:room_id')
  //check room exists...maybe just keep error response in catch
  .get((req, res) => {
    client.video
      .rooms(req.params.id)
      .fetch()
      .then((room) => {
        res.status(200).send(room)
      })
  })

roomsRouter
  //rename to make function clearer?
  .route('/complete-rooms')
  .get((req, res) => {
    client.video.rooms.list({ status: 'in-progress' }).then((rooms) =>
      rooms.forEach((r) => {
        client.video
          .rooms(r.sid)
          .update({ status: 'completed' })
          .then((room) => console.log('completed rooms'))
      })
    )
    res.status(200).send(JSON.stringify({ body: 'something' }))
  })

module.exports = roomsRouter
