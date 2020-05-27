import gql from 'graphql-tag'

export default gql`
  extend type Query {
    users: [User!]!

    userByEmail(email: String!): User

    userById(id: Int!): User
  }
  extend type Mutation {
    insertUser(name: String!, email: String!, password: String!, role: String!): Token!
  }

  type User {
    id: ID!
    name: String!
    email: String!
    password: String!
    role: String
    last_seen: String
  }

  type Token {
    token: String!
    id: String!
    role: String!
  }
`
