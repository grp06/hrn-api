import * as Sentry from '@sentry/node'
import samyakAlgoPro from './samyakAlgoPro'
import createRoundsMap from './createRoundsMap'
import orm from '../../services/orm'
import { omniFinishRounds, endEvent, resetEvent } from './runEventHelpers'
import updateEventObject from '../../gql/mutations/event/updateEventObject'
import getAvailableLobbyUsers from '../../gql/queries/users/getAvailableLobbyUsers'
import getPartnersFromListOfUserIds from '../../gql/queries/users/getPartnersFromListOfUserIds'
import makePairings from './makePairings'
import transformPairingsToGqlVars from './transformPairingsToGqlVars'
// bulk insert partners
// get partners
const startEvent = async (req, res) => {
  const eventId = parseInt(req.params.eventId, 10)

  // get all online users for this eventId
  let onlineUsers
  try {
    const onlineUsersResponse = await orm.request(getAvailableLobbyUsers, {
      eventId: parseInt(eventId, 10),
    })
    onlineUsers = onlineUsersResponse.data.online_users
  } catch (error) {
    Sentry.captureException(error)
  }

  // get all rows from the partners table from those users
  let partnersRows
  try {
    // get an array of just the userIds from onlineUsers
    const userIds = onlineUsers.map((user) => user.id)
    const partnersList = await orm.request(getPartnersFromListOfUserIds, {
      userIds,
    })

    partnersRows = partnersList.data.partners
    console.log('partnersRows', partnersRows)
  } catch (error) {
    Sentry.captureException(error)
  }

  // make pairings (generate pairings)
  const pairings = makePairings(onlineUsers, partnersRows)
  console.log('pairings', pairings)
  // transform pairings to be ready for insertion to partners table

  const transformedPairings = transformPairingsToGqlVars({ pairings, eventId, round: 1 })
  console.log('startEvent -> transformedPairings', transformedPairings)

  // write to partners table

  // set event status to in-progress

  // create event trigger for 5 mins from now
}

export default startEvent
