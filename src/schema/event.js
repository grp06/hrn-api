import gql from 'graphql-tag'

export default gql`
  extend type Mutation {
    updateEventObject(id: Int!, newCurrentRound: Int!): Event
  }

  type Event {
    id: ID!
    host_id: Int
    start_at: Date
    ended_at: Date
    description: String
    current_round: Int
    event_name: String
  }
`
