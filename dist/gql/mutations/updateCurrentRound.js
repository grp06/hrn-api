"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const graphql_tag_1 = __importDefault(require("graphql-tag"));
const setEventEndedAt = graphql_tag_1.default `
  mutation updateCurrentRound($id: Int!) {
    update_events(where: { id: { _eq: $id } }, _inc: { current_round: 1 }) {
      returning {
        current_round
      }
    }
  }
`;
exports.default = setEventEndedAt;
//# sourceMappingURL=updateCurrentRound.js.map