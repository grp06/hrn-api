"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const graphql_tag_1 = __importDefault(require("graphql-tag"));
const getOnlineUsersByEventId = graphql_tag_1.default `
  query getOnlineUsersByEventId($later_than: timestamptz, $event_id: Int) {
    event_users(
      where: { user: { updated_at: { _gte: $later_than } }, _and: { event_id: { _eq: $event_id } } }
      order_by: { user: { id: asc } }
    ) {
      user {
        id
        updated_at
        name
      }
    }
  }
`;
exports.default = getOnlineUsersByEventId;
//# sourceMappingURL=getOnlineUsersByEventId.js.map