"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const graphql_tag_1 = __importDefault(require("graphql-tag"));
const resetEventStatus = graphql_tag_1.default `
  mutation resetEventStatus($eventId: Int!) {
    update_events(
      where: { id: { _eq: $eventId } }
      _set: { ended_at: null, current_round: 0, status: "not-started" }
    ) {
      returning {
        description
        event_name
        host_id
        id
        start_at
        ended_at
        current_round
        status
      }
    }
  }
`;
exports.default = resetEventStatus;
//# sourceMappingURL=resetEventStatus.js.map