"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const graphql_tag_1 = __importDefault(require("graphql-tag"));
const setCronTimestamp = graphql_tag_1.default `
  mutation setCronTimestamp($eventId: Int!, $timestamp: timestamptz) {
    insert_cron_jobs(objects: { event_id: $eventId, next_round_start: $timestamp }) {
      affected_rows
    }
  }
`;
exports.default = setCronTimestamp;
//# sourceMappingURL=setCronTimestamp.js.map