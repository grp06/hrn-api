"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const graphql_tag_1 = __importDefault(require("graphql-tag"));
const deleteCronTimestamp = graphql_tag_1.default `
  mutation deleteCronTimestamp($eventId: Int!) {
    delete_cron_jobs(where: { event_id: { _eq: $eventId } }) {
      affected_rows
    }
  }
`;
exports.default = deleteCronTimestamp;
//# sourceMappingURL=deleteCronTimestamp.js.map