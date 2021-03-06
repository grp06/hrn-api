"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const graphql_tag_1 = __importDefault(require("graphql-tag"));
const findUserByStripeCustomerId = graphql_tag_1.default `
  query findUserByStripeCustomerId($stripe_customer_id: String!) {
    users(where: { stripe_customer_id: { _eq: $stripe_customer_id } }) {
      id
      email
      name
      role
      stripe_customer_id
      sub_period_end
    }
  }
`;
exports.default = findUserByStripeCustomerId;
//# sourceMappingURL=findUserByStripeCustomerId.js.map