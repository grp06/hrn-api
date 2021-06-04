import { Partner } from '../gql/queries/getPartnersFromListOfUserIds'

type TransformPairingsToGqlVarsParams = {
  pairings: [number, number][]
  roomModeId: number
}

type PurePartner = Pick<Partner, 'user_id' | 'partner_id' | 'room_modes_id'>

type TransformPairingsToGqlVars = (params: TransformPairingsToGqlVarsParams) => PurePartner[]

const transformPairingsToGqlVars: TransformPairingsToGqlVars = ({ pairings, roomModeId }) => {
  console.log('transformPairingsToGqlVars -> pairings', pairings)

  const variablesArr: PurePartner[] = []

  pairings.forEach((pairing) => {
    variablesArr.push({
      user_id: pairing[0],
      partner_id: pairing[1],
      room_modes_id: roomModeId,
    })

    if (pairing[1] !== null) {
      variablesArr.push({
        user_id: pairing[1],
        partner_id: pairing[0],
        room_modes_id: roomModeId,
      })
    }
  })

  return variablesArr
}

export default transformPairingsToGqlVars
