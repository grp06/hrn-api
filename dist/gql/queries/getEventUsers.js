"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const graphql_tag_1 = __importDefault(require("graphql-tag"));
const getEventUsers = graphql_tag_1.default `
  query getEventUsers($event_id: Int!) {
    event_users(where: { event_id: { _eq: $event_id } }) {
      user {
        id
        name
        email
        linkedIn_url
        city
        short_bio
        tags_users {
          tag {
            name
          }
        }
      }
      event {
        event_name
        id
        start_at
        banner_photo_url
      }
    }
  }
`;
exports.default = getEventUsers;
//# sourceMappingURL=getEventUsers.js.map