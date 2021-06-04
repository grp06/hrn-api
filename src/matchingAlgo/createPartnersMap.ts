import { Partner } from '../gql/queries/getPartnersFromListOfUserIds'

export type CreatePartnersMapParams = {
  allRoundsDataForOnlineUsers: Partner[]
  userIds: number[]
  roomId: number
}

export type CreatePartnersMap = (params: CreatePartnersMapParams) => { [key: number]: number[] }

const createPartnersMap: CreatePartnersMap = ({ allRoundsDataForOnlineUsers, userIds, roomId }) => {
  console.log('allRoundsDataForOnlineUsers', allRoundsDataForOnlineUsers)

  const roundsFromThisRoomMode = allRoundsDataForOnlineUsers.filter(
    (round) => round.room_mode?.rooms?.[0]?.id === roomId
  )

  const getPreviousMatches = (userId: number) => {
    const partnerRows = roundsFromThisRoomMode.filter((row) => row.user_id === userId)

    // This is to get an array of only your partners id for each round as the array element
    const matches: number[] = []

    partnerRows.forEach((partnerObject) => {
      if (partnerObject.user_id === userId) {
        matches.push(partnerObject.partner_id)
      }
    })

    return matches
  }

  // after we generate the users map
  // loop through all rounds for online users and add  blocked users to
  // the maps of the person who did the blocking

  const partnersMapObject = userIds.reduce((all: { [key: number]: number[] }, userId) => {
    all[userId] = getPreviousMatches(userId)
    return all
  }, {})

  const pairingsWhoShouldntMatch: [number, number][] = []

  allRoundsDataForOnlineUsers.forEach((row) => {
    const userIdIsInPartnersMap = partnersMapObject[row.user_id]
    const partnerIsInPartnersMap = partnersMapObject[row.partner_id]
    if (userIdIsInPartnersMap && partnerIsInPartnersMap) {
      pairingsWhoShouldntMatch.push([row.user_id, row.partner_id])
    }
  })

  console.log('partnersMapObject = ', partnersMapObject)
  console.log('createPartnersMap -> pairingsWhoShouldntMatch', pairingsWhoShouldntMatch)

  pairingsWhoShouldntMatch.forEach((pairing) => {
    console.log('createPartnersMap -> pairing', pairing)
    console.log('createPartnersMap -> pairing[0]', pairing[0])
    console.log('createPartnersMap -> pairing[1]', pairing[1])

    partnersMapObject[pairing[0]].push(pairing[1])
    partnersMapObject[pairing[1]].push(pairing[0])
  })

  return partnersMapObject
}

export default createPartnersMap
