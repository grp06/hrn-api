import gql from 'graphql-tag'

export default gql`
  extend type Query {
    users: [User!]!
    userByEmail(email: String!): User
    userById(id: Int!): User
    getEventUsers(eventId: Int!): [User]
    getRoundsByEventId(eventId: Int!): [Round]
  }

  extend type Mutation {
    bulkInsertRounds(input: [rounds_insert_input]!): Int!
    insertUser(name: String!, email: String!, password: String!, role: String!): Token!
    updatePasswordByUserId(id: Int!, newPassword: String!): Token!
  }

  type User {
    id: ID!
    name: String!
    email: String!
    password: String!
    role: String
    last_seen: String
  }

  input rounds_insert_input {
    id: Int!
    round_number: Int!
    partnerX_id: Int!
    partnerY_id: Int!
  }

  type Round {
    id: Int!
    round_number: Int!
    partnerX_id: Int!
    partnerY_id: Int!
  }

  type Token {
    token: String!
    id: String!
    role: String!
  }
`
