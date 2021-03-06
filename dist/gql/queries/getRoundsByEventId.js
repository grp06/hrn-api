"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const graphql_tag_1 = __importDefault(require("graphql-tag"));
const getRoundsByEventId = graphql_tag_1.default `
  query getRoundsByEventId($event_id: Int!) {
    rounds(where: { event_id: { _eq: $event_id } }) {
      id
      round_number
      partnerX_id
      partnerY_id
      ended_at
    }
  }
`;
exports.default = getRoundsByEventId;
//# sourceMappingURL=getRoundsByEventId.js.map