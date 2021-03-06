"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const graphql_tag_1 = __importDefault(require("graphql-tag"));
exports.default = graphql_tag_1.default `
  extend type Query {
    users: [User!]!
    userByEmail(email: String!): User
    userById(id: Int!): User
    getEventUsers(eventId: Int!): [User]
    getRoundsByEventId(eventId: Int!): [Round]
  }

  extend type Mutation {
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
`;
//# sourceMappingURL=user.js.map