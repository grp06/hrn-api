import gql from 'graphql-tag'

import { GraphQlResponse } from '../../types'

export type Partner = {
  id: number
  user_id: number
  partner_id: number
  room_modes_id: number
  room_mode: {
    rooms: [
      {
        id: number
      }
    ]
  }
  round: number
}

export type PartnersFromListOfUserIdsResponse = GraphQlResponse<{
  partners: Partner[]
}>

const getPartnersFromListOfUserIds = gql`
  query getPartnersFromListOfUserIds($userIds: [Int!], $roomModeId: Int!) {
    partners(where: { user_id: { _in: $userIds }, room_modes_id: { _eq: $roomModeId } }) {
      id
      user_id
      partner_id
      room_modes_id
      room_mode {
        rooms(limit: 1) {
          id
        }
      }
      round
    }
  }
`

export default getPartnersFromListOfUserIds
