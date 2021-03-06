"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const graphql_iso_date_1 = require("graphql-iso-date");
const user_1 = __importDefault(require("./user"));
const event_1 = __importDefault(require("./event"));
const customScalarResolver = {
    Date: graphql_iso_date_1.GraphQLDateTime,
};
const resolvers = [customScalarResolver, user_1.default, event_1.default];
exports.default = resolvers;
//# sourceMappingURL=index.js.map