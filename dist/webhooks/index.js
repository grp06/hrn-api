"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Sentry = __importStar(require("@sentry/node"));
const express_1 = __importDefault(require("express"));
const orm_1 = __importDefault(require("../services/orm"));
const mutations_1 = require("../gql/mutations");
const queries_1 = require("../gql/queries");
const webhooks = express_1.default.Router();
const jsonBodyParser = express_1.default.json();
const getPlanNameFromId = (id) => {
    if (id === process.env.STARTER_MONTHLY || id === process.env.STARTER_YEARLY)
        return 'host_starter';
    if (id === process.env.PREMIUM_MONTHLY || id === process.env.PREMIUM_MONTHLY)
        return 'host_premium';
    return 'no_plan';
};
// /webhooks/next-round
webhooks.post('/next-round', jsonBodyParser, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    console.log('hit the next round webhook');
    // const { payload } = res.body
    // console.log('payload', payload)
    console.log(new Date().toISOString());
    console.log('req.body = ', req.body);
    console.log('req.body.payload = ', req.body.payload);
    // call "next round"
    return res.status(200).send({
        message: 'success',
    });
}));
// types include:
// customer.subscription.deleted, customer.subscription.updated, invoice.payment_succeeded
webhooks.post('/stripe-customer-portal', jsonBodyParser, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log('req.body ->', req.body);
    // for customer subscription we want to check the plan from the sub, get the id or product
    // from the plan object, and compare them to the ids of the product to make sure we are still
    // giving them correct host access
    if (req.body.type === 'customer.subscription.updated') {
        console.log('req.body ->', console.log(req.body));
        const subscription = req.body.data.object;
        const { customer, status, current_period_end, plan } = subscription;
        const { id: planId } = plan;
        const planName = getPlanNameFromId(planId);
        const current_period_end_ISOString = new Date(current_period_end * 1000).toISOString();
        // update the userSubPeriod because the transaction was successful, meaning
        // they have another month or year with this role
        if (status === 'active') {
            try {
                const databaseUserInfo = yield orm_1.default.request(queries_1.findUserByStripeCustomerId, {
                    stripe_customer_id: customer,
                });
                const databaseUser = databaseUserInfo.data.users[0];
                const { id: user_id, role, sub_period_end, name } = databaseUser;
                yield orm_1.default.request(mutations_1.updateUserSubPeriod, {
                    stripe_customer_id: customer,
                    sub_period_end: current_period_end_ISOString,
                });
                // if the role isnt the same as the planName then that means they changed their
                // plan, so lets update their role in the db
                if (role !== planName && planName !== 'no_plan') {
                    yield orm_1.default.request(mutations_1.updateUserRole, {
                        user_id,
                        role: planName,
                        became_host_at: new Date().toISOString(),
                    });
                }
            }
            catch (error) {
                console.log('[webhooks /stripe-customer-portal customer.subscription.updated findUserByStripeCustomerId || updateUserRole || UpdateUserSubPeriod error] -> ', error);
                Sentry.captureException(error);
                return res.status(500).send({ error });
            }
        }
    }
    return res.status(200).send({ message: 'success' });
}));
exports.default = webhooks;
//# sourceMappingURL=index.js.map