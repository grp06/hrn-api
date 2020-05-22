import gql from 'graphql-tag'

export default gql`

  extend type Query {
      users: [User!]!
  }
  extend type Mutation {
    insertUser(name: String!, email: String!, password: String!, role: String!): User!
  }

  type User {
    id: ID!
    name: String!
    email: String!
    password: String!
    role: String
    last_seen: String
  }
`
