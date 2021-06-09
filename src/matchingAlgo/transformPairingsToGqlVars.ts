import { Partner } from '../gql/queries/getPartnersFromListOfUserIds'

type TransformPairingsToGqlVarsParams = {
  pairings: [number, number][]
  roomModeId: number
  currentRound: number
}

type PurePartner = Pick<Partner, 'user_id' | 'partner_id' | 'room_modes_id' | 'round'>

type TransformPairingsToGqlVars = (params: TransformPairingsToGqlVarsParams) => PurePartner[]

const transformPairingsToGqlVars: TransformPairingsToGqlVars = ({
  pairings,
  roomModeId,
  currentRound,
}) => {
  const variablesArr: PurePartner[] = []

  pairings.forEach((pairing) => {
    if (pairing[1] !== null) {
      variablesArr.push({
        user_id: pairing[0],
        partner_id: pairing[1],
        room_modes_id: roomModeId,
        round: currentRound,
      })
    }

    if (pairing[1] !== null) {
      variablesArr.push({
        user_id: pairing[1],
        partner_id: pairing[0],
        room_modes_id: roomModeId,
        round: currentRound,
      })
    }
  })

  return variablesArr
}

export default transformPairingsToGqlVars
