"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const graphql_tag_1 = __importDefault(require("graphql-tag"));
const getAvailableLobbyUsers = graphql_tag_1.default `
  query getAvailableLobbyUsers($eventId: Int!) {
    online_event_users(where: { event_id: { _eq: $eventId } }) {
      event_id
      last_seen
      user_id
      tags_users {
        tag {
          name
        }
      }
    }
  }
`;
// const getAvailableLobbyUsers = gql`
//   query getAvailableLobbyUsers($eventId: Int!) {
//     online_users(where: { event_users: { event_id: { _eq: $eventId } } }) {
//       id
//       last_seen
//       tags_users {
//         tag {
//           name
//         }
//       }
//     }
//   }
// `
exports.default = getAvailableLobbyUsers;
//# sourceMappingURL=getAvailableLobbyUsers.js.map