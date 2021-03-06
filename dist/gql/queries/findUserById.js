"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const graphql_tag_1 = __importDefault(require("graphql-tag"));
const findUserById = graphql_tag_1.default `
  query findUserById($id: Int!) {
    users(where: { id: { _eq: $id } }) {
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
exports.default = findUserById;
//# sourceMappingURL=findUserById.js.map