import * as Sentry from '@sentry/node'

import orm from '../services/orm'
import { getPredeterminedPartnersFromListOfUserIds } from '../gql/queries'

const getPredeterminedPartners = async ({ userIds }) => {
  let partnersListResponse
  try {
    partnersListResponse = await orm.request(getPredeterminedPartnersFromListOfUserIds, {
      userIds,
    })
  } catch (error) {
    console.log('error = ', error)
    return Sentry.captureException(error)
  }

  // figure out how to handle errors here
  // should I be returning the sentry error here? or return at the bototm of the function
  // how I do this should apply to everywhere in the app
  return partnersListResponse.data.predetermined_partners
}

export default getPredeterminedPartners
