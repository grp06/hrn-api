"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const graphql_tag_1 = __importDefault(require("graphql-tag"));
const getContactSharesForSendingEmail = graphql_tag_1.default `
  query getContactSharesForSendingEmail($event_id: Int!) {
    partners(where: { partner_shared_details: { _eq: true }, event_id: { _eq: $event_id } }) {
      user {
        email
        name
      }
      partner {
        name
        linkedIn_url
        short_bio
        city
        email
        tags_users {
          tag {
            name
          }
        }
      }
      event {
        event_name
      }
    }
  }
`;
exports.default = getContactSharesForSendingEmail;
//# sourceMappingURL=getContactSharesForSendingEmail.js.map