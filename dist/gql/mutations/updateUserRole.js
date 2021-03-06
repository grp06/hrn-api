"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const graphql_tag_1 = __importDefault(require("graphql-tag"));
const updateUserRole = graphql_tag_1.default `
  mutation updateUserRole($user_id: Int!, $role: String!, $became_host_at: timestamptz!) {
    update_users(
      where: { id: { _eq: $user_id } }
      _set: { role: $role, became_host_at: $became_host_at }
    ) {
      returning {
        id
        role
        name
        email
        city
        linkedIn_url
        became_host_at
      }
    }
  }
`;
exports.default = updateUserRole;
//# sourceMappingURL=updateUserRole.js.map