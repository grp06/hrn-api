"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const graphql_tag_1 = __importDefault(require("graphql-tag"));
const query = graphql_tag_1.default `
  mutation updatePasswordByUserId($id: Int!, $newPassword: String!) {
    update_users(where: { id: { _eq: $id } }, _set: { password: $newPassword }) {
      returning {
        id
        email
        role
      }
    }
  }
`;
exports.default = query;
//# sourceMappingURL=updatePasswordByUserId.js.map