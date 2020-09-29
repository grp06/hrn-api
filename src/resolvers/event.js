// import orm from '../services/orm'
// import updateEventObject from '../gql/mutations/event/updateEventObject'

// export default {
//   Mutation: {
//     updateEventObject: async (parent, { id, newCurrentRound }) => {
//       const eventObject = { id, newCurrentRound }
//       const variables = { objects: [eventObject] }

//       let newEventDetails
//       try {
//         const updateCurrentRoundResult = await orm.request(updateEventObject, variables)
//         newEventDetails = updateCurrentRoundResult.data.update_events.returning[0]
//       } catch (e) {
//         console.log(e, 'could not update current round by event id')
//       }
//       return {
//         id: newEventDetails.id,
//         round_number: newEventDetails.round_number,
//         host_id: newEventDetails.host_id,
//         event_name: newEventDetails.event_name,
//       }
//     },
//   },
// }
