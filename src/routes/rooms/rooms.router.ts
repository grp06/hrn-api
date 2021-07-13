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
  insertComposition,
  deleteCompositionById,
  updateComposition,
  updateBookmarksWithCompositionSid,
} from '../../gql/mutations'
import {
  getCompositionsByOwnerId,
  getBookmarksFromTimeframe,
  getCompletedCompositions,
} from '../../gql/queries'
import getRoomLogin from '../../gql/queries/getRoomLogin'
import { hashPassword, comparePasswords } from '../../services/auth-service'
import jobs from '../../services/jobs'
import orm from '../../services/orm'
import { initSpeedRounds } from '../../services/room-modes/speed-rounds'

const roomsRouter = express.Router()
const countdownSeconds = 20

roomsRouter.post('/create-room', async (req, res) => {
  const { firstName, roomName, userId } = req.body.input
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

    // attach the Twilio Room SID to room_mode
    // this helps us to retrieve recordings later on
    const insertRoomModeReq = await orm.request(insertRoomMode, {
      objects: {
        round_number: null,
        round_length: null,
        total_rounds: null,
        owner_id: ownerId,
      },
    })
    if (insertRoomModeReq.errors) {
      throw new Error(insertRoomModeReq.errors[0].message)
    }

    const roomModesResponse = insertRoomModeReq.data.insert_room_modes.returning[0]
    const { id: roomModeId } = roomModesResponse

    const insertRoomReq = await orm.request(insertRoom, {
      objects: {
        name: roomName,
        slug: roomSlug,
        room_modes_id: roomModeId,
        owner_id: ownerId,
      },
    })

    if (insertRoomReq.errors) {
      if (insertRoomReq.errors[0].message.indexOf('rooms_name_key') > -1) {
        return res.status(400).json({ message: 'room name unavailable' })
      }
    }

    const roomId = insertRoomReq.data.insert_rooms.returning[0].id

    // NOTE: I took the await off of the following API calls
    //  --- client.video.rooms
    //  --- updateRoomModeRoomSid
    //  --- insertRoomUser
    // and it shaved off 1100 - 1500ms ... making the room creation process faster
    // downside is that the errors arent handled now... but error handling was already bad...

    // create a twilio room where the room name is the `roomId`
    client.video.rooms
      .create({
        uniqueName: roomId,
        type: 'group',
        videoCodecs: ['VP8'],
        statusCallback,
        statusCallbackMethod: 'POST',
      })
      .then((createdRoom: any) => {
        console.log('createdRoom', createdRoom)
        orm.request(updateRoomModeRoomSid, {
          roomModeId,
          twilioRoomSid: createdRoom.sid,
        })
      })

    orm.request(insertRoomUser, {
      objects: {
        room_id: roomId,
        user_id: ownerId,
        on_stage: true,
      },
    })

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
  const { firstName } = req.body.input

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

    return res.json({
      userId: newUser.id,
      token: await createToken(newUser, process.env.SECRET),
    })
  } catch (error) {
    console.log('error', error)
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
    console.log('req.body.input', req.body.input)

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

    console.log('roomModeRes', roomModeRes)

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
    console.log('updateRoomModeRes', updateRoomModeRes)

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
      message: 'session doesnt match',
    })
  }
  let existingRoom
  try {
    const beforeList = Date.now()
    const roomList = await client.video.rooms.list({ status: 'in-progress' })
    const afterList = Date.now()
    console.log('call to list rooms took = ', afterList - beforeList)

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
      console.log('createdRoom', createdRoom)
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

      orm.request(insertRoomUser, {
        objects: {
          room_id: roomId,
          user_id: userId,
          on_stage: true,
        },
      })

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
  const { recordTracks, roomId, ownerId, roomSid } = req.body.input

  try {
    // user turned ON recording
    if (recordTracks) {
      // start the recording
      client.video.rooms(roomId).recordingRules.update({ rules: [{ type: 'include', all: true }] })

      // insert a "composition" row into the DB. We'll need the "startTime" later
      const insertCompositionRes = await orm.request(insertComposition, {
        ownerId,
        startTime: new Date().toISOString(),
      })
      if (insertCompositionRes.errors) {
        throw new Error(insertCompositionRes.errors[0].message)
      }

      // else... user turned OFF recording
    } else {
      // first get all IDs of recordings from this room that are "processing"
      const processingRecordings = await client.video
        .rooms(roomSid)
        .recordings.list({ status: 'processing' })

      const videoRecordings = processingRecordings
        .filter((rec: any) => rec.type === 'video')
        .map((item: any) => item.sid)

      const audioRecordings = processingRecordings
        .filter((rec: any) => rec.type === 'audio')
        .map((item: any) => item.sid)

      // stop the recording
      client.video.rooms(roomId).recordingRules.update({ rules: [{ type: 'exclude', all: true }] })

      // query Hasura for the latest composition
      const compositionsRes = await orm.request(getCompositionsByOwnerId, {
        ownerId,
      })

      if (compositionsRes.errors) {
        throw new Error(compositionsRes.errors[0].message)
      }

      const compositionsList = compositionsRes.data.compositions
      const latestCompositionId = compositionsList[0]?.id
      const startTime = compositionsList[0]?.recording_started_at

      // get all bookmarks dropped while the recording was in progress
      const bookmarksFromTimeframe = await orm.request(getBookmarksFromTimeframe, {
        startTime,
        endTime: new Date().toISOString(),
        roomId,
      })

      if (bookmarksFromTimeframe.errors) {
        throw new Error(bookmarksFromTimeframe.errors[0].message)
      }

      // if there are no bookmarks, delete the composition's row from the DB
      if (!bookmarksFromTimeframe.data.bookmarks.length) {
        console.log('no bookmarks, delete the current composition from hasura')
        const deleteCompositionByIdRes = await orm.request(deleteCompositionById, {
          id: latestCompositionId,
        })

        if (deleteCompositionByIdRes.errors) {
          throw new Error(deleteCompositionByIdRes.errors[0].message)
        }
      } else {
        // otherwise --- there ARE bookmarks
        const compositionStatusCallback =
          process.env.NODE_ENV === 'production'
            ? 'https://api.hirightnow.co/composition-status-callbacks'
            : `${process.env.NGROK_STATUS_CALLBACK_URL}/composition-status-callbacks`
        // create a composition
        const composition = await client.video.compositions.create({
          roomSid,
          // array of audio recording SIDs that are "processing" (active when the owner pressed 'stop')
          audioSources: audioRecordings,
          videoLayout: {
            grid: {
              // array of video recording SIDs that are "processing" (active when the owner pressed 'stop')
              video_sources: videoRecordings,
            },
          },
          statusCallback: compositionStatusCallback,
          statusCallbackMethod: 'POST',
          format: 'mp4',
          resolution: '1280x720',
        })

        const recordingEndedAt = new Date().toISOString()
        // update the composition's row in Hasura with the time it ended and set the status to enqueued
        const updateCompositionRes = await orm.request(updateComposition, {
          latestCompositionId,
          compositionSid: composition.sid,
          recordingEndedAt,
          status: 'enqueued',
        })

        if (updateCompositionRes.errors) {
          throw new Error(updateCompositionRes.errors[0].message)
        }

        // update the bookmarks that we dropped during the recording with the compositions SID
        const updateBookmarksRes = await orm.request(updateBookmarksWithCompositionSid, {
          startTime,
          endTime: recordingEndedAt,
          roomId,
          compositionSid: composition.sid,
        })

        if (updateBookmarksRes.errors) {
          throw new Error(updateBookmarksRes.errors[0].message)
        }

        // NOTE: the next thing that happens after all of this is that that the "composition-available" webhook gets hit
        // this can take 30 seconds or 30 minutes... depends on Twilio's queue
      }
    }
  } catch (error) {
    console.log('error = ', error)
  }

  return res.json({
    roomId,
  })
})

// called from /admin/userId
roomsRouter.post('/get-list-of-compositions', async (req, res) => {
  const { ownerId } = req.body.input

  try {
    const compositionsRes = await orm.request(getCompletedCompositions, {
      ownerId,
    })

    const compositionsList = compositionsRes.data.compositions

    const formattedResponse = compositionsList.map((item: any) => {
      const recordingStartedAt = new Date(item.recording_started_at).getTime()

      const lengthInSeconds =
        (new Date(item.recording_ended_at).getTime() -
          new Date(item.recording_started_at).getTime()) /
        1000

      const recordingLength = new Date(lengthInSeconds * 1000)
        .toISOString()
        .substr(11, 8)
        .split(':')
        .map((secondsString, idx) => {
          if (idx === 0) {
            const hourString = secondsString.split('')[1]

            return secondsString === '00' ? '' : `${hourString}h `
          }
          if (idx === 1) {
            return secondsString === '00' ? '' : `${secondsString}m `
          }
          if (idx === 2) {
            return `${secondsString}s `
          }
        })

      return {
        firstName: item.user.first_name,
        url: item.url,
        startedAt: new Date(item.recording_started_at).toLocaleString(),
        length: recordingLength,
        bookmarks: item.bookmarks.map((bookmark: any) => {
          const seconds = (new Date(bookmark.created_at).getTime() - recordingStartedAt) / 1000
          const formattedString = new Date(seconds * 1000)
            .toISOString()
            .substr(11, 8)
            .split(':')
            .map((secondsString, idx) => {
              if (idx === 0) {
                const hourString = secondsString.split('')[1]
                return `${hourString}h `
              }
              if (idx === 1) {
                return `${secondsString}m `
              }
              if (idx === 2) {
                return `${secondsString}s `
              }
            })

          return formattedString
        }),
      }
    })

    // for some reason Hasura actions does not allow us to return a complex object. So I do it as a sting and parse it on the frontend
    return res.json({
      compositions: JSON.stringify(formattedResponse),
    })
  } catch (error) {
    console.log('error - ', error)
  }
})

export default roomsRouter
