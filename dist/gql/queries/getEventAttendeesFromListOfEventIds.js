"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const graphql_tag_1 = __importDefault(require("graphql-tag"));
const getEventAttendeesFromListOfEventIds = graphql_tag_1.default `
  query getEventAttendeesFromListOfEventIds($eventIds: [Int!]) {
    partners(where: { event_id: { _in: $eventIds } }, distinct_on: user_id) {
      user {
        email
      }
    }
  }
`;
exports.default = getEventAttendeesFromListOfEventIds;
//# sourceMappingURL=getEventAttendeesFromListOfEventIds.js.map