import gql from 'graphql-tag'

import { GraphQlResponse } from '../../types'

export type RoomModeCronjobs = {
  id: number
  room_id: number
  room_modes_id: number
  round_number: number
  timestamp: string
  room_mode: {
    total_rounds: number
    round_number: number
    round_length: number
  }
}

export type GetRoomModeCronjobs = GraphQlResponse<{
  room_mode_cronjobs: RoomModeCronjobs[]
}>

const getRoomModeCronjobs = gql`
  query getRoomModeCronjobs {
    room_mode_cronjobs {
      id
      room_id
      room_modes_id
      round_number
      timestamp
      room_mode {
        total_rounds
        round_number
        round_length
      }
    }
  }
`

export default getRoomModeCronjobs
