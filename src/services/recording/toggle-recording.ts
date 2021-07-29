import client from '../../extensions/twilioClient'
import {
  insertComposition,
  updateComposition,
  updateBookmarksWithCompositionSid,
} from '../../gql/mutations'
import { getCompositionsByOwnerId, getBookmarksFromTimeframe } from '../../gql/queries'
import orm from '../orm'

type ToggleRecordingParams = {
  recordTracks: boolean
  roomId: string
  ownerId: number
  roomSid: string
  res: any
}

type ToggleRecording = (params: ToggleRecordingParams) => Promise<void>

const toggleRecording: ToggleRecording = async ({
  recordTracks,
  roomId,
  ownerId,
  roomSid,
  res,
}) => {
  console.log('toggle recording called')

  try {
    // user turned ON recording
    if (recordTracks) {
      // start the recording
      console.log('update recording rules ON')

      await client.video
        .rooms(roomId)
        .recordingRules.update({ rules: [{ type: 'include', all: true }] })

      // insert a "composition" row into the DB. We'll need the "startTime" later
      const insertCompositionRes = await orm.request(insertComposition, {
        ownerId,
        startTime: new Date().toISOString(),
      })
      console.log('inserted composition when recording started')
      if (insertCompositionRes.errors) {
        throw new Error(insertCompositionRes.errors[0].message)
      }

      // else... user turned OFF recording
    } else {
      // query Hasura for the latest composition
      const compositionsRes = await orm.request(getCompositionsByOwnerId, {
        ownerId,
      })

      if (compositionsRes.errors) {
        throw new Error(compositionsRes.errors[0].message)
      }

      const latestComposition = compositionsRes.data.compositions[0]
      const { id: latestCompositionId, recording_started_at: startTime } = latestComposition

      // first get all IDs of recordings from this room
      const recordingsDuringThisComposition = await client.video
        .rooms(roomSid)
        .recordings.list({ dateCreatedAfter: startTime })

      const uniqueUsers: Array<string> = []
      recordingsDuringThisComposition.forEach((rec: any) => {
        if (!uniqueUsers.includes(rec.trackName.split('-')[1])) {
          uniqueUsers.push(rec.trackName.split('-')[1])
        }
      })
      console.log('🚀 ~ uniqueUsers during this composition', uniqueUsers)

      const videoRecordings = recordingsDuringThisComposition
        .filter((rec: any) => rec.type === 'video')
        .map((item: any) => item.sid)

      const audioRecordings = recordingsDuringThisComposition
        .filter((rec: any) => rec.type === 'audio')
        .map((item: any) => item.sid)

      // if we want to make the owner the big video and the other PIP, we need these
      // const ownerVideoRecordingTrackId = recordingsDuringThisComposition.find(
      //   (rec: any) => rec.type === 'video' && Number(rec.trackName.split('-')[1]) === ownerId
      // )

      // const partnerVideoRecordingTrackId = recordingsDuringThisComposition.find(
      //   (rec: any) => rec.type === 'video' && Number(rec.trackName.split('-')[1]) !== ownerId
      // )
      // stop the recording
      console.log('update recording rules OFF')
      await client.video
        .rooms(roomId)
        .recordingRules.update({ rules: [{ type: 'exclude', all: true }] })

      // get all bookmarks dropped while the recording was in progress
      const bookmarksFromTimeframe = await orm.request(getBookmarksFromTimeframe, {
        startTime,
        endTime: new Date().toISOString(),
        roomId,
      })
      console.log('bookmarks from this session: ', bookmarksFromTimeframe)

      if (bookmarksFromTimeframe.errors) {
        throw new Error(bookmarksFromTimeframe.errors[0].message)
      }

      // if we had some bookmarks during this recording
      if (bookmarksFromTimeframe.data.bookmarks.length) {
        const compositionStatusCallback =
          process.env.NODE_ENV === 'production'
            ? 'https://api.hirightnow.co/composition-status-callbacks'
            : `${process.env.NGROK_STATUS_CALLBACK_URL}/composition-status-callbacks`

        // create a composition

        const verticalCompositionOptions = {
          roomSid,
          // array of audio recording SIDs
          audioSources: audioRecordings,
          videoLayout: {
            column: {
              y_pos: 0,
              x_pos: 0,
              width: 720,
              height: 1280,
              max_columns: 1,
              max_rows: 2,
              video_sources: videoRecordings,
            },
          },
          statusCallback: compositionStatusCallback,
          statusCallbackMethod: 'POST',
          format: 'mp4',
          resolution: '720x1280',
        }

        const gridCompositionOptions = {
          roomSid,
          audioSources: '*',
          videoLayout: {
            grid: {
              video_sources: ['*'],
            },
          },
          statusCallback: compositionStatusCallback,
          format: 'mp4',
          resolution: '1280x720',
        }

        const compositionSelection = () =>
          uniqueUsers.length > 2 ? gridCompositionOptions : verticalCompositionOptions

        const composition = await client.video.compositions.create(compositionSelection())
        console.log('🚀 ~ roomsRouter.post ~ composition', composition)

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
        console.log('updated bookmarks for composition with compositionSid = ', updateBookmarksRes)

        if (updateBookmarksRes.errors) {
          throw new Error(updateBookmarksRes.errors[0].message)
        }

        // NOTE: the next thing that happens after all of this is that that the "composition-available" webhook gets hit
        // this can take 30 seconds or 30 minutes... depends on Twilio's queue
      }
    }
  } catch (error) {
    console.log('error = ', error)
    return res.status(400).json({ message: 'error creating composition when recording stopped' })
  }

  return res.json({
    roomId,
  })
}

export default toggleRecording
