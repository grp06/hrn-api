"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const graphql_tag_1 = __importDefault(require("graphql-tag"));
const getEventInfoByEventId = graphql_tag_1.default `
  query getEventInfoByEventId($eventId: Int!) {
    events(where: { id: { _eq: $eventId } }) {
      id
      status
      current_round
      updated_at
      round_length
      host_id
      group_video_chat
    }
  }
`;
exports.default = getEventInfoByEventId;
//# sourceMappingURL=getEventInfoByEventId.js.map