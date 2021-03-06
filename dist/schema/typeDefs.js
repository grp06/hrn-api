"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const graphql_tag_1 = __importDefault(require("graphql-tag"));
const user_1 = __importDefault(require("./user"));
const event_1 = __importDefault(require("./event"));
const linkSchema = graphql_tag_1.default `
  scalar Date

  type Query {
    _: Boolean
    numberSix: Int!
  }

  type Mutation {
    _: Boolean
  }

  type Subscription {
    _: Boolean
  }
`;
exports.default = [linkSchema, user_1.default, event_1.default];
//# sourceMappingURL=typeDefs.js.map