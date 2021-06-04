import { Partner } from '../../gql/queries/getPartnersFromListOfUserIds'
import createPartnersMap from '../../matchingAlgo/createPartnersMap'
import samyakAlgoPro from '../../matchingAlgo/samyakAlgoPro'

export type MakePairingsFromSamyakAlgoParams = {
  allRoundsDataForOnlineUsers: Partner[]
  userIds: number[]
  roomId: number
}

export type MakePairingsFromSamyakAlgo = (
  params: MakePairingsFromSamyakAlgoParams
) => [number, number][]

const makePairingsFromSamyakAlgo: MakePairingsFromSamyakAlgo = ({
  allRoundsDataForOnlineUsers,
  userIds,
  roomId,
}) => {
  const pairingsMap = createPartnersMap({ allRoundsDataForOnlineUsers, userIds, roomId })
  const { pairingsArray: newPairings } = samyakAlgoPro(userIds, pairingsMap)

  console.log('makePairingsFromSamyakAlgo -> newPairings', newPairings)

  return newPairings
}

export default makePairingsFromSamyakAlgo
