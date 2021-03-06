"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const graphql_tag_1 = __importDefault(require("graphql-tag"));
const getEventsByEndTime = graphql_tag_1.default `
  query getEventsByEndTime($less_than: timestamptz, $greater_than: timestamptz) {
    events(where: { ended_at: { _lte: $less_than, _gt: $greater_than } }) {
      event_name
      ended_at
      description
      current_round
      host_id
      id
      round_length
      start_at
      status
      event_users {
        user {
          email
        }
      }
      host {
        email
      }
    }
  }
`;
exports.default = getEventsByEndTime;
//# sourceMappingURL=getEventsByEndTime.js.map