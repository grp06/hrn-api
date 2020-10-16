import createPartnersMap from './createPartnersMap'
import samyakAlgoPro from './samyakAlgoPro'

const makePairingsFromSamyakAlgo = ({ allRoundsDataForOnlineUsers, userIds, eventId }) => {
  const pairingsMap = createPartnersMap({ allRoundsDataForOnlineUsers, userIds, eventId })
  const { pairingsArray: newPairings } = samyakAlgoPro(userIds, pairingsMap)
  console.log('makePairingsFromSamyakAlgo -> newPairings', newPairings)

  return newPairings
}

export default makePairingsFromSamyakAlgo
