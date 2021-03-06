"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const graphql_tag_1 = __importDefault(require("graphql-tag"));
const updateUserSubPeriod = graphql_tag_1.default `
  mutation updateUserSubPeriod($stripe_customer_id: String!, $sub_period_end: timestamptz!) {
    update_users(
      where: { stripe_customer_id: { _eq: $stripe_customer_id } }
      _set: { sub_period_end: $sub_period_end }
    ) {
      returning {
        name
        id
        role
        sub_period_end
      }
    }
  }
`;
exports.default = updateUserSubPeriod;
//# sourceMappingURL=updateUserSubPeriod.js.map