import * as Sentry from '@sentry/node'

import { getPredeterminedPartnersFromListOfUserIds } from '../../gql/queries'
import { GraphQlResponse } from '../../types'
import orm from '../orm'

type PredeterminedPartners = {
  partner_1_id: number
  partner_2_id: number
}

type GetPredeterminedPartners = (params: {
  userIds: number[]
  roomId: number
}) => Promise<string | PredeterminedPartners[]> // TODO: string shouldn't be a return type in here

type PartnersListResponse = GraphQlResponse<{
  predetermined_partners: PredeterminedPartners[]
}>

/**
 * Get predetermined partners
 */
const getPredeterminedPartners: GetPredeterminedPartners = async ({ userIds, roomId }) => {
  let partnersListResponse: PartnersListResponse

  try {
    partnersListResponse = await orm.request(getPredeterminedPartnersFromListOfUserIds, {
      userIds,
      roomId,
    })
  } catch (error) {
    console.log('(getPredeterminedPartners) 🙊 There was an error:', error)
    return Sentry.captureException(error) // TODO: find a better approach and update the return type
  }

  // TODO: Figure out how to handle errors here. Should I be returning the sentry error here?
  //  or return at the bottom of the function. How I do this should apply to everywhere in the app.
  return partnersListResponse.data.predetermined_partners
}

export default getPredeterminedPartners
