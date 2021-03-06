"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const graphql_tag_1 = __importDefault(require("graphql-tag"));
const updateEventObject = graphql_tag_1.default `
  mutation updateEventObject(
    $id: Int!
    $newCurrentRound: Int
    $newStatus: String
    $ended_at: timestamptz
  ) {
    update_events(
      where: { id: { _eq: $id } }
      _set: { current_round: $newCurrentRound, status: $newStatus, ended_at: $ended_at }
    ) {
      returning {
        id
        current_round
        host_id
        event_name
      }
    }
  }
`;
exports.default = updateEventObject;
//# sourceMappingURL=updateEventObject.js.map