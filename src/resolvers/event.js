import orm from '../services/orm'
import updateCurrentRoundByEventId from '../gql/mutations/event/updateCurrentRoundByEventId'

export default {
  Mutation: {
    updateCurrentRoundByEventId: async (parent, { id, newCurrentRound }) => {
      const eventObject = { id, newCurrentRound }
      const variables = { objects: [eventObject] }
      console.log('variables: ', variables)

      let newEventDetails
      try {
        const updateCurrentRoundResult = await orm.request(updateCurrentRoundByEventId, variables)
        newEventDetails = updateCurrentRoundResult.data.update_events.returning[0]

        console.log(newEventDetails)
      } catch (e) {
        console.log(e, 'could not update current round by event id')
      }
      return {
        id: newEventDetails.id,
        round_number: newEventDetails.round_number,
        host_id: newEventDetails.host_id,
        event_name: newEventDetails.event_name,
      }
    },
  },
}
