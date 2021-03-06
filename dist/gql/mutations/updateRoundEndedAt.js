"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const graphql_tag_1 = __importDefault(require("graphql-tag"));
const updateRoundEndedAt = graphql_tag_1.default `
  mutation updateRoundEndedAt($event_id: Int!, $roundNumber: Int!, $endedAt: timestamptz) {
    update_rounds(
      where: { round_number: { _eq: $roundNumber }, event_id: { _eq: $event_id } }
      _set: { ended_at: $endedAt }
    ) {
      returning {
        ended_at
      }
    }
  }
`;
exports.default = updateRoundEndedAt;
//# sourceMappingURL=updateRoundEndedAt.js.map