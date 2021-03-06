"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const graphql_tag_1 = __importDefault(require("graphql-tag"));
exports.default = graphql_tag_1.default `
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
`;
//# sourceMappingURL=event.js.map