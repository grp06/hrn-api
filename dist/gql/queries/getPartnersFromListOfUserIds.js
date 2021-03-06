"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const graphql_tag_1 = __importDefault(require("graphql-tag"));
const getPartnersFromListOfUserIds = graphql_tag_1.default `
  query getPartnersFromListOfUserIds($userIds: [Int!]) {
    partners(where: { user_id: { _in: $userIds } }) {
      id
      event_id
      partner_id
      user_id
      left_chat
      rating
    }
  }
`;
exports.default = getPartnersFromListOfUserIds;
//# sourceMappingURL=getPartnersFromListOfUserIds.js.map