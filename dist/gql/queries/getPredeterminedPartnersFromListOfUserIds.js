"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const graphql_tag_1 = __importDefault(require("graphql-tag"));
// make sure to only pull for the current eventId
const getPredeterminedPartnersFromListOfUserIds = graphql_tag_1.default `
  query getPredeterminedPartnersFromListOfUserIds($userIds: [Int!], $eventId: Int!) {
    predetermined_partners(
      where: {
        partner_1_id: { _in: $userIds }
        _and: { partner_2_id: { _in: $userIds }, event_id: { _eq: $eventId } }
        event_id: { _eq: $eventId }
      }
    ) {
      partner_1_id
      partner_2_id
    }
  }
`;
exports.default = getPredeterminedPartnersFromListOfUserIds;
//# sourceMappingURL=getPredeterminedPartnersFromListOfUserIds.js.map