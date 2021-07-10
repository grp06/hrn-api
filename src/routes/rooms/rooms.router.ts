/**
 * Rooms router v2
 */

import * as Sentry from '@sentry/node'
import { CronJob } from 'cron'
import express from 'express'
import moment from 'moment'
import slug from 'slug'

import { createToken } from '../../extensions/jwtHelper'
import client from '../../extensions/twilioClient'
import {
  insertRoom,
  insertRoomMode,
  insertRoomUser,
  insertUser,
  updateRoom,
  deleteRoomModeCron,
  updateRoomMode,
  updateRoomPassword,
  updateRoomModeRoomSid,
} from '../../gql/mutations'
import { getRoomModesByUserId } from '../../gql/queries'
import getRoomLogin from '../../gql/queries/getRoomLogin'
import { hashPassword, comparePasswords } from '../../services/auth-service'
import jobs from '../../services/jobs'
import orm from '../../services/orm'
import { initSpeedRounds } from '../../services/room-modes/speed-rounds'

const roomsRouter = express.Router()
const countdownSeconds = 20

roomsRouter.post('/create-room', async (req, res) => {
  const { firstName, roomName, userId } = req.body.input
  console.log('🚀 ~ roomsRouter.post ~ userId', userId)
  const { session_variables } = req.body
  const sessionUserId = session_variables['x-hasura-user-id']

  const roomSlug = slug(roomName)
  const statusCallback =
    process.env.NODE_ENV === 'production'
      ? 'https://api.hirightnow.co/status-callbacks'
      : `${process.env.NGROK_STATUS_CALLBACK_URL}/status-callbacks`

  try {
    let ownerId = null
    let token = ''

    // if there's a userId, a logged in user is creating a room
    if (userId) {
      // as long as the sessionId === userId ... set the ownerId to the userId
      if (Number(sessionUserId) === Number(userId)) {
        ownerId = userId
      } else {
        return res.status(400).json({ message: "session doesn't match" })
      }
    } else {
      // if there's not a userId, we need to create a user before creating a room
      const insertUserReq = await orm.request(insertUser, {
        objects: {
          first_name: firstName,
        },
      })
      const insertUserResponse = insertUserReq.data.insert_users.returning[0]
      // use the newly created user's ID to create a token and send it back to the client
      ownerId = insertUserResponse.id
      if (insertUserReq.errors) {
        throw new Error(insertUserReq.errors[0].message)
      }
      token = await createToken(insertUserResponse, process.env.SECRET)
    }

    // insert room_mode ... use the Twilio Room's SID and attach it to the room mode
    // this will allow us to retrieve recordings later on
    const insertRoomModeReq = await orm.request(insertRoomMode, {
      objects: {
        round_number: null,
        round_length: null,
        total_rounds: null,
        owner_id: ownerId,
      },
    })
    console.log('🚀 ~ roomsRouter.post ~ insertRoomModeReq', insertRoomModeReq)
    const roomModesResponse = insertRoomModeReq.data.insert_room_modes.returning[0]

    if (insertRoomModeReq.errors) {
      throw new Error(insertRoomModeReq.errors[0].message)
    }

    const insertRoomReq = await orm.request(insertRoom, {
      objects: {
        name: roomName,
        slug: roomSlug,
        room_modes_id: roomModesResponse.id,
        owner_id: ownerId,
      },
    })

    if (insertRoomReq.errors) {
      if (insertRoomReq.errors[0].message.indexOf('rooms_name_key') > -1) {
        return res.status(400).json({ message: 'room name unavailable' })
      }
    }

    const roomId = insertRoomReq.data.insert_rooms.returning[0].id
    // create a twilio room where the room name is the `roomId`
    const createdRoom = await client.video.rooms.create({
      uniqueName: roomId,
      type: 'group',
      videoCodecs: ['VP8'],
      statusCallback,
      statusCallbackMethod: 'POST',
    })

    console.log('🚀 ~ roomsRouter.post ~ createdRoom', createdRoom)
    await orm.request(updateRoomModeRoomSid, {
      roomModeId: roomModesResponse.id,
      twilioRoomSid: createdRoom.sid,
    })
    const insertRoomUserRes = await orm.request(insertRoomUser, {
      objects: {
        room_id: roomId,
        user_id: ownerId,
        on_stage: true,
      },
    })

    if (insertRoomUserRes.errors) {
      throw new Error(insertRoomUserRes.errors[0].message)
    }

    // console.log('createdRoom = ', createdRoom)

    const { id: roomModeId } = roomModesResponse

    return res.json({
      roomId,
      roomModeId,
      token: token,
    })
  } catch (error) {
    console.log('error = ', error)
    if (error.message.indexOf('Uniqueness violation') > -1) {
      return res
        .status(400)
        .json({ message: 'Room name already claimed, please choose another name' })
    }
    return res.status(400).json({ message: 'Error creating room room' })
  }
})
/**
 * Create a guest user in a room
 * TODO: move part of this to the user router/service
 */
roomsRouter.post('/create-guest-user', async (req, res) => {
  // make roomId optional
  const { firstName, roomId } = req.body.input

  try {
    const insertUserRes = await orm.request(insertUser, {
      objects: {
        first_name: firstName,
      },
    })
    const newUser = insertUserRes.data.insert_users.returning[0]
    if (insertUserRes.errors) {
      throw new Error(insertUserRes.errors[0].message)
    }

    // success
    return res.json({
      userId: newUser.id,
      token: await createToken(newUser, process.env.SECRET),
    })
  } catch (error) {
    console.log('🚀 ~ roomsRouter.post ~ error', error)
    return res.status(400).json({
      message: 'couldnt create user',
    })
  }
})

/**
 * Change room mode
 */
roomsRouter.post('/change-room-mode', async (req, res) => {
  try {
    // get request input
    const { roomId, modeName, totalRounds = null, roundLength = null } = req.body.input.input
    const { session_variables } = req.body
    const sessionUserId = session_variables['x-hasura-user-id']
    console.log('🚀 ~ roomsRouter.post ~ req.body.input', req.body.input)

    // TODO: check params, should we add defaults for totalRounds & roundLength

    // insert a new row into the room_mode table
    const roomModeRes = await orm.request(insertRoomMode, {
      objects: {
        round_number: 0,
        round_length: roundLength,
        total_rounds: totalRounds,
        mode_name: modeName,
        owner_id: sessionUserId,
      },
    })

    console.log('🚀 ~ roomsRouter.post ~ roomModeRes', roomModeRes)

    if (roomModeRes.errors) {
      throw new Error(roomModeRes.errors[0].message)
    }

    // grab the id from the row we just inserted
    const roomModesId = roomModeRes.data.insert_room_modes.returning[0].id

    // make sure to use that id to update the room_modes_id on the room table
    const updateRoomRes = await orm.request(updateRoom, {
      roomId,
      roomModesId,
    })

    if (updateRoomRes.errors) {
      throw new Error(updateRoomRes.errors[0].message)
    }

    // only run this logic if we're starting speed chats
    // there may be other cases where we want to change the room mode that isn't related to speed-chats
    if (modeName === 'speed-chats') {
      // Start the break
      const updatedRoomModeRes = await orm.request(updateRoomMode, {
        roomModeId: roomModesId,
        pause: true,
        roundNumber: 0,
      })
      if (updatedRoomModeRes.errors) {
        throw new Error(updatedRoomModeRes.errors[0].message)
      }

      console.log('(updatedRoomModeRes) We started the countdown:', updatedRoomModeRes)

      const countdown = moment().add(countdownSeconds, 'seconds')

      jobs.countdown[roomId] = new CronJob(countdown, async () => {
        console.log('(updatedRoomModeRes->cronJob) We started the countdown:', roomId)

        await initSpeedRounds({
          roomId,
          roomModeId: roomModesId,
          roundNumber: 1,
          roundLength,
          totalRounds,
        })

        jobs.countdown[roomId]?.stop()
      })

      jobs.countdown[roomId]?.start()
      // success
    }

    return res.json({
      roomId,
      roomModeId: roomModesId,
    })
  } catch (error) {
    console.log(error)
    return res.status(400).json({
      message: error.toString(),
    })
  }
})

roomsRouter.post('/reset-speed-chat', async (req, res) => {
  // get request input
  const { roomModeId } = req.body.input
  const { session_variables } = req.body
  const sessionUserId = session_variables['x-hasura-user-id']
  try {
    // cancel out the active room mode
    const updateRoomModeRes = await orm.request(updateRoomMode, {
      roomModeId,
      pause: false,
      roundNumber: null,
    })
    console.log('🚀 ~ roomsRouter.post ~ updateRoomModeRes', updateRoomModeRes)

    await orm.request(deleteRoomModeCron, {
      roomModeId,
    })

    const roomId = updateRoomModeRes.data.update_room_modes.returning[0].rooms[0].id

    const insertRoomModeReq = await orm.request(insertRoomMode, {
      objects: {
        round_number: null,
        round_length: null,
        total_rounds: null,
        owner_id: sessionUserId,
      },
    })
    const roomModesResponse = insertRoomModeReq.data.insert_room_modes.returning[0]

    const roomModesId = roomModesResponse.id
    await orm.request(updateRoom, {
      roomId,
      roomModesId,
    })
    if (jobs.nextRound[roomId]) {
      jobs.nextRound[roomId]?.stop()
      jobs.nextRound[roomId] = null
      console.log('CLEARING NEXT ROUND JOB')
    }

    if (jobs.betweenRounds[roomId]) {
      jobs.betweenRounds[roomId]?.stop()
      jobs.betweenRounds[roomId] = null
      console.log('CLEARING BETWEEN ROUND JOB')
    }

    if (jobs.countdown[roomId]) {
      jobs.countdown[roomId]?.stop()
      jobs.countdown[roomId] = null
      console.log('CLEARING COUNTDOWN JOB')
    }
    // TODO update roomModesId to roomModeId to be consistent

    console.log('jobs = ', jobs)
    return res.json({
      roomModeId: roomModesId,
    })
  } catch (error) {
    console.log(error)
    return res.status(400).json({
      message: error.toString(),
    })
  }
})

roomsRouter.post('/join-room', async (req, res) => {
  const { roomId, ownerId } = req.body.input

  const userId = req.body.session_variables['x-hasura-user-id']
  if (!userId) {
    return res.status(400).json({
      message: "session doesn't match",
    })
  }
  let existingRoom
  try {
    const beforeRoomCall = Date.now()

    const roomList = await client.video.rooms.list({ status: 'in-progress' })
    const afterRoomCall = Date.now()
    console.log('🚀 ~ roomsRouter.post ~ afterRoomCall', afterRoomCall)

    console.log('call to twilio took ==== ', afterRoomCall - beforeRoomCall)
    roomList.forEach((room: any) => {
      if (Number(room.uniqueName) === roomId) {
        existingRoom = room
      }
    })
  } catch (error) {
    return res.status(400).json({
      message: 'error joining room',
    })
  }

  // there's no active twilio room, create the twilio room, create a campfire, then update the room with the new roomModeId
  if (!existingRoom) {
    console.log('NO EXISTING ROOM ---- CREATE FROM REST API')
    const statusCallback =
      process.env.NODE_ENV === 'production'
        ? 'https://api.hirightnow.co/status-callbacks'
        : `${process.env.NGROK_STATUS_CALLBACK_URL}/status-callbacks`

    try {
      const createdRoom = await client.video.rooms.create({
        uniqueName: roomId,
        type: 'group',
        videoCodecs: ['VP8'],
        statusCallback,
        statusCallbackMethod: 'POST',
      })
      console.log('🚀 ~ roomsRouter.post ~ createdRoom', createdRoom)
      // insert room_mode ... use the Twilio Room's SID and attach it to the room mode
      // this will allow us to retrieve recordings later on
      const insertRoomModeReq = await orm.request(insertRoomMode, {
        objects: {
          round_number: null,
          round_length: null,
          total_rounds: null,
          twilio_room_sid: createdRoom.sid,
          owner_id: ownerId,
        },
      })

      const roomModesResponse = insertRoomModeReq.data.insert_room_modes.returning[0]

      if (insertRoomModeReq.errors) {
        throw new Error(insertRoomModeReq.errors[0].message)
      }

      const insertRoomUserRes = await orm.request(insertRoomUser, {
        objects: {
          room_id: roomId,
          user_id: userId,
          on_stage: true,
        },
      })

      if (insertRoomUserRes.errors) {
        throw new Error(insertRoomUserRes.errors[0].message)
      }

      // update the room_modes_id on the room table
      orm.request(updateRoom, {
        roomId,
        roomModesId: roomModesResponse.id,
      })

      // we could catch errors here... but then that means we have to wait for the mutation promise to complete
      // we can speed up the process by just retuning
      // if theres an error its probably not a big deal?
      // if (updateRoomRes.errors) {
      //   throw new Error(updateRoomRes.errors[0].message)
      // }
    } catch (error) {
      return res.status(400).json({
        message: 'error joining room',
      })
    }
  }
  return res.json({
    roomId,
  })
})

roomsRouter.post('/lock-room', async (req, res) => {
  const { roomId, password } = req.body.input

  try {
    // hash the password
    const hashedPassword = await hashPassword(password)
    await orm.request(updateRoomPassword, {
      roomId,
      password: hashedPassword,
    })
  } catch (error) {
    Sentry.captureException(error)
    return res.status(400).json({
      message: 'error on setting up room password',
    })
  }
  return res.json({
    roomId,
    locked: true,
  })
})

roomsRouter.post('/login-room', async (req, res) => {
  const { roomId, password } = req.body.input

  try {
    // check if user with email exists
    const getRoomLoginResponse = await orm.request(getRoomLogin, { roomId })
    console.log(
      '🚀 ~ file: rooms.router.ts ~ line 360 ~ roomsRouter.post ~ getRoomLoginResponse',
      getRoomLoginResponse
    )

    if (!getRoomLoginResponse?.data?.rooms_by_pk) {
      return res.status(400).json({ message: "Password Doesn't exist" })
    }

    // compare passwords with hashing
    const passwordCheck = await comparePasswords(
      password,
      getRoomLoginResponse?.data?.rooms_by_pk.password
    )

    if (!passwordCheck) {
      return res.status(400).json({
        message: 'Incorrect user_name or password',
      })
    }
  } catch (error) {
    console.log('Error logging in', error)
    Sentry.captureException(error)
    return res.status(500).json({
      message: 'There was an error logging in',
    })
  }

  return res.json({
    roomId,
    unlocked: true,
  })
})

roomsRouter.post('/toggle-recording', async (req, res) => {
  const { recordTracks, roomId } = req.body.input
  console.log('🚀 ~ roomsRouter.post ~ roomId', roomId)
  console.log('🚀 ~ roomsRouter.post ~ recordTracks', recordTracks)

  if (recordTracks) {
    const recordingRules = await client.video
      .rooms(roomId)
      .recordingRules.update({ rules: [{ type: 'include', all: true }] })
    console.log('🚀 ~ roomsRouter.post ~ recordingRules', recordingRules)
  } else {
    const recordingRules = await client.video
      .rooms(roomId)
      .recordingRules.update({ rules: [{ type: 'exclude', all: true }] })
    console.log('🚀 ~ roomsRouter.post ~ recordingRules', recordingRules)
  }

  return res.json({
    roomId,
  })
})

roomsRouter.post('/get-user-recordings', async (req, res) => {
  const { userId } = req.body.input
  console.log('🚀 ~ roomsRouter.post ~ userId', userId)

  try {
    const getRoomModesRes = await orm.request(getRoomModesByUserId, {
      userId,
    })
    const allRoomSids = getRoomModesRes.data.room_modes.map(
      (roomMode: any) => roomMode.twilio_room_sid
    )

    // client.video
    //   .rooms(allRoomSids[1])
    //   .recordings.list()
    //   .then((recordings: any) =>
    //     recordings.forEach((recording: any) => console.log('recording - ', recording))
    //   )

    const statusCallback =
      process.env.NODE_ENV === 'production'
        ? 'https://api.hirightnow.co/status-callbacks'
        : `${process.env.NGROK_STATUS_CALLBACK_URL}/status-callbacks`

    console.log('🚀 ~ roomsRouter.post ~ statusCallback', statusCallback)
    // client.video.compositions
    //   .create({
    //     roomSid: allRoomSids[1],
    //     audioSources: '*',
    //     videoLayout: {
    //       grid: {
    //         video_sources: ['*'],
    //       },
    //     },
    //     statusCallback: statusCallback,
    //     format: 'mp4',
    //   })
    //   .then((composition) => {
    //     console.log('🚀 ~ .then ~ composition', composition)
    //     console.log('Created Composition with SID=' + composition.sid)
    //   })
    client.video.compositions
      .list({
        roomSid: allRoomSids[1],
      })
      .then((compositions) => {
        console.log(`Found ${compositions.length} compositions.`)
        compositions.forEach((composition, index) => {
          console.log('🚀 ~ index', index)
          if (index === 7) {
            console.log(`Read compositionSid=${composition.sid}`)

            const compositionSid = composition.sid
            const uri = `https://video.twilio.com/v1/Compositions/${compositionSid}/Media?Ttl=3600`
            console.log('🚀 ~ uri', uri)

            client
              .request({
                method: 'GET',
                uri: uri,
              })
              .then((response) => {
                console.log('🚀 ~ .then ~ response.body.redirect_to', response.body.redirect_to)
                return res.json({
                  recordings: [response.body.redirect_to],
                })
              })
              .catch((error) => {
                console.log(`Error fetching /Media resource ${error}`)
              })
          }
        })
      })

    console.log('🚀 ~ roomsRouter.post ~ allRoomSids', allRoomSids)
  } catch (error) {
    console.log('error - ', error)
  }
})

export default roomsRouter
