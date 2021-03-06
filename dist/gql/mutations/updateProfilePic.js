"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const graphql_tag_1 = __importDefault(require("graphql-tag"));
const updateProfilePic = graphql_tag_1.default `
  mutation($id: Int!, $profile_pic_url: String!) {
    update_users(where: { id: { _eq: $id } }, _set: { profile_pic_url: $profile_pic_url }) {
      returning {
        profile_pic_url
      }
    }
  }
`;
exports.default = updateProfilePic;
//# sourceMappingURL=updateProfilePic.js.map