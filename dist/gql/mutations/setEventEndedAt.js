"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const graphql_tag_1 = __importDefault(require("graphql-tag"));
const setEventEndedAt = graphql_tag_1.default `
  mutation setEventEndedAt($id: Int!, $ended_at: timestamptz) {
    update_events(where: { id: { _eq: $id } }, _set: { ended_at: $ended_at }) {
      returning {
        description
        event_name
        host_id
        id
        start_at
        ended_at
      }
    }
  }
`;
exports.default = setEventEndedAt;
//# sourceMappingURL=setEventEndedAt.js.map