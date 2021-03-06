"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const graphql_tag_1 = __importDefault(require("graphql-tag"));
const getMutualThumbsByEventId = graphql_tag_1.default `
  query getMutualThumbsByEventId($event_id: Int!) {
    rounds(
      where: {
        _and: [
          { event_id: { _eq: $event_id } }
          { partnerY_thumb: { _eq: true } }
          { partnerX_thumb: { _eq: true } }
        ]
      }
      order_by: { round_number: asc }
    ) {
      partnerY {
        id
        name
        email
        city
        short_bio
        linkedIn_url
        tags_users {
          tag {
            name
            tag_id
            category
          }
        }
      }
      partnerX {
        id
        name
        email
        city
        short_bio
        linkedIn_url
        tags_users {
          tag {
            name
            tag_id
            category
          }
        }
      }
      round_number
    }
  }
`;
exports.default = getMutualThumbsByEventId;
//# sourceMappingURL=getMutualThumbsByEventId.js.map