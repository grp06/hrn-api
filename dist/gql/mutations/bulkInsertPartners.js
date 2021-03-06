"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const graphql_tag_1 = __importDefault(require("graphql-tag"));
const bulkInsertPartners = graphql_tag_1.default `
  mutation bulkInsertPartners($objects: [partners_insert_input!]!) {
    insert_partners(objects: $objects) {
      returning {
        id
        event_id
      }
    }
  }
`;
exports.default = bulkInsertPartners;
//# sourceMappingURL=bulkInsertPartners.js.map