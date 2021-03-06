"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const graphql_tag_1 = __importDefault(require("graphql-tag"));
const getAllEvents = graphql_tag_1.default `
  query getAllEvents {
    events {
      host_id
    }
  }
`;
exports.default = getAllEvents;
//# sourceMappingURL=getAllEvents.js.map