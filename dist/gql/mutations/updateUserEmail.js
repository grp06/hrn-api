"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const graphql_tag_1 = __importDefault(require("graphql-tag"));
const updateUserEmail = graphql_tag_1.default `
  mutation updateUser($user_id: Int!, $email: String!) {
    update_users(where: { id: { _eq: $user_id } }, _set: { email: $email }) {
      affected_rows
    }
  }
`;
exports.default = updateUserEmail;
//# sourceMappingURL=updateUserEmail.js.map