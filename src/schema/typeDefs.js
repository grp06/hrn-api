import gql from 'graphql-tag'

const linkSchema = gql`
  scalar Date

  type Query {
    _: Boolean
    numberSix: Int!
    user: User
  }

  type Mutation {
    _: Boolean
  }

  type Subscription {
    _: Boolean
  }

  type User {
    id: ID!
    name: String,
    age: Int
  }


`

export default [linkSchema]
