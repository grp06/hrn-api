"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const graphql_tag_1 = __importDefault(require("graphql-tag"));
const updateStripeCustomerId = graphql_tag_1.default `
  mutation updateStripeCustomerId($user_id: Int!, $stripe_customer_id: String!) {
    update_users(
      where: { id: { _eq: $user_id } }
      _set: { stripe_customer_id: $stripe_customer_id }
    ) {
      returning {
        name
        email
        stripe_customer_id
        id
      }
    }
  }
`;
exports.default = updateStripeCustomerId;
//# sourceMappingURL=updateStripeCustomerId.js.map