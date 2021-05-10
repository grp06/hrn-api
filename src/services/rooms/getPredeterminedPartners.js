import * as Sentry from '@sentry/node'

import { getPredeterminedPartnersFromListOfUserIds } from '../../gql/queries'
import orm from '../orm'

const getPredeterminedPartners = async ({ userIds, eventId }) => {
  let partnersListResponse
  try {
    partnersListResponse = await orm.request(getPredeterminedPartnersFromListOfUserIds, {
      userIds,
      eventId,
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
