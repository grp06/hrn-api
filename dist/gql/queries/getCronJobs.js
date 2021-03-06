"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const graphql_tag_1 = __importDefault(require("graphql-tag"));
const getCronJobs = graphql_tag_1.default `
  query getCronJobs {
    cron_jobs(where: { next_round_start: { _is_null: false } }) {
      next_round_start
      event {
        num_rounds
        id
        round_length
        current_round
      }
    }
  }
`;
exports.default = getCronJobs;
//# sourceMappingURL=getCronJobs.js.map