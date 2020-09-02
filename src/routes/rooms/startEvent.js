import * as Sentry from '@sentry/node'
import orm from '../../services/orm'
import getAvailableLobbyUsers from '../../gql/queries/users/getAvailableLobbyUsers'
import getPartnersFromListOfUserIds from '../../gql/queries/users/getPartnersFromListOfUserIds'
import makePairings from './makePairings'
import transformPairingsToGqlVars from './transformPairingsToGqlVars'
import bulkInsertPartners from '../../gql/mutations/users/bulkInsertPartners'
import updateEventObject from '../../gql/mutations/event/updateEventObject'

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
  } catch (error) {
    Sentry.captureException(error)
  }

  // make pairings
  const pairings = makePairings(onlineUsers, partnersRows)

  // transform pairings to be ready for insertion to partners table
  const variablesArray = transformPairingsToGqlVars({ pairings, eventId, round: 1 })

  // write to partners table
  try {
    await orm.request(bulkInsertPartners, {
      objects: variablesArray,
    })
  } catch (error) {
    Sentry.captureException(error)
  }

  // set event status to in-progress
  try {
    await orm.request(updateEventObject, {
      id: eventId,
      newCurrentRound: 1,
      newStatus: 'room-in-progress',
    })
    await orm.request(updateEventObject, {
      id: eventId,
      newCurrentRound: 1,
      newStatus: 'room-in-progress',
    })
  } catch (error) {
    Sentry.captureException(error)
  }

  // create event trigger for 5 mins from now
  const now = Date.now()
  // fetch(`http://localhost:8080/v1/query`, {
  //   method: 'POST',
  //   headers: {
  //     'Content-Type': 'application/json',
  //     'Access-Control-Allow-Origin': '*',
  //     'Access-Control-Allow-Credentials': true,
  //   },
  //   body: JSON.stringify({
  //     type: 'create_scheduled_event',
  //     args: {
  //       webhook: 'http://host.docker.internal:8000/webhooks/next-round',
  //       // now + 5 mins
  //       // new Date().toISOString()
  //       schedule_at: '2020-08-18T21:08:29.767Z',
  //       payload: {
  //         email: 'bob@ross.com',
  //       },
  //       headers: [
  //         {
  //           name: 'key',
  //           value: 'value',
  //         },
  //       ],
  //       retry_conf: {
  //         num_retries: 3,
  //         timeout_seconds: 120,
  //         tolerance_seconds: 21675,
  //         retry_interval_seconds: 12,
  //       },
  //       comment: 'sample scheduled event comment',
  //     },
  //   }),
  // })
}

export default startEvent
