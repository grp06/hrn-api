import gql from 'graphql-tag'
import user from './user'
import event from './event'

const linkSchema = gql`
  scalar Date

  type Query {
    _: Boolean
    numberSix: Int!
  }

  type Mutation {
    _: Boolean
  }

  type Subscription {
    _: Boolean
  }
`

export default [linkSchema, user, event]
