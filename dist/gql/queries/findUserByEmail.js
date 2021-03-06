"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const graphql_tag_1 = __importDefault(require("graphql-tag"));
const findUserByEmail = graphql_tag_1.default `
  query findUserByEmail($email: String!) {
    users(where: { email: { _eq: $email } }) {
      id
      email
      role
      password
      name
      last_seen
      created_at
    }
  }
`;
exports.default = findUserByEmail;
//# sourceMappingURL=findUserByEmail.js.map