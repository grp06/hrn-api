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
const stripe_1 = __importDefault(require("stripe"));
const orm_1 = __importDefault(require("../../services/orm"));
const mutations_1 = require("../../gql/mutations");
const jwtHelper_1 = require("../../extensions/jwtHelper");
const email_service_1 = require("../../services/email-service");
const express = require('express');
const stripeRouter = express.Router();
const stripe = new stripe_1.default(process.env.STRIPE_SECRET_KEY);
stripeRouter.post('/create-customer', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, name, userId } = req.body;
    const customer = yield stripe.customers.create({ email, name });
    try {
        yield orm_1.default.request(mutations_1.updateStripeCustomerId, {
            user_id: userId,
            stripe_customer_id: customer.id,
        });
    }
    catch (error) {
        console.log('[stripe /create-customer error] -> ', error);
        Sentry.captureException(error);
        return res.status(500).send({ error });
    }
    return res.send({ customer });
}));
stripeRouter.post('/create-customer-portal', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { customer_id, return_url } = req.body;
    const session = yield stripe.billingPortal.sessions.create({
        customer: customer_id,
        return_url,
    });
    return res.send({ url: session.url });
}));
stripeRouter.post('/create-subscription', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { customerId, paymentMethodId, plan, userId, userEmail } = req.body;
    const planTypeName = plan.split('_')[0].toLowerCase();
    // set the default payment method on the customer
    try {
        yield stripe.paymentMethods.attach(paymentMethodId, { customer: customerId });
    }
    catch (error) {
        console.log('[stripe /create-subscription error] ->', error);
        Sentry.captureException(error);
        return res.status(402).send({ error: { message: error.message } });
    }
    // this needs to be a part of this even though we dont use the result for anything
    // in the code. The default payment needs to be configured on the stripe API
    // for payments to process.
    let updateCustomerDefaultPaymentMethod = yield stripe.customers.update(customerId, {
        invoice_settings: {
            default_payment_method: paymentMethodId,
        },
    });
    // Create the subscription
    let subscription;
    try {
        subscription = yield stripe.subscriptions.create({
            customer: customerId,
            items: [{ price: process.env[plan] }],
            expand: ['latest_invoice.payment_intent'],
        });
    }
    catch (error) {
        console.log('[stripe.subscriptions.create error] ->', error);
        Sentry.captureException(error);
        return res.status(402).send({ error: { message: error.message } });
    }
    const subPeriodEnd = new Date(subscription.current_period_end * 1000).toISOString();
    const priceOfPlan = subscription.items.data[0].price.unit_amount / 100;
    console.log(subPeriodEnd);
    email_service_1.stripeSubscriptionConfirmation({ plan, priceOfPlan, subPeriodEnd, userEmail });
    // Update the user role and sub_period_end in our DB
    try {
        yield orm_1.default.request(mutations_1.updateUserRole, {
            user_id: userId,
            role: `host_${planTypeName}`,
            became_host_at: new Date().toISOString(),
        });
        yield orm_1.default.request(mutations_1.updateUserSubPeriod, {
            stripe_customer_id: customerId,
            sub_period_end: subPeriodEnd,
        });
    }
    catch (error) {
        console.log('[stripe /create-subscription updateUserRole/updateUserSub  error] -> ', error);
        Sentry.captureException(error);
        return res.status(500).send({ error });
        // return res.status(500).send(error)
    }
    // create a new token and send both token and sub obj back
    const userObject = { email: userEmail, id: userId, role: `host_${planTypeName}` };
    try {
        const token = yield jwtHelper_1.createToken(userObject, process.env.SECRET);
        console.log(token);
        return res.status(201).send({ subscriptionObject: subscription, token });
    }
    catch (error) {
        console.log('[stripe /create-subscription createToken error] -> ', error);
        Sentry.captureException(error);
        return res.status(500).send({ error });
        // return res.status(500).send(error)
    }
}));
stripeRouter.post('/retry-invoice', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { customerId, paymentMethodId, invoiceId, plan, userId, userEmail } = req.body;
    const planTypeName = plan.split('_')[0].toLowerCase();
    // reconfigure the default payment method on the user since the
    // last one presumably failed if we're retrying
    try {
        yield stripe.paymentMethods.attach(paymentMethodId, {
            customer: customerId,
        });
        yield stripe.customers.update(customerId, {
            invoice_settings: {
                default_payment_method: paymentMethodId,
            },
        });
    }
    catch (error) {
        console.log('[stripe /retry-invoice error] ->', error);
        Sentry.captureException(error);
        return res.status(402).send({ result: { error: { message: error.message } } });
    }
    const invoice = yield stripe.invoices.retrieve(invoiceId, {
        expand: ['payment_intent'],
    });
    const subPeriodEnd = new Date(invoice.period_end * 1000).toISOString();
    console.log(subPeriodEnd);
    // Update the user role in our DB
    try {
        yield orm_1.default.request(mutations_1.updateUserRole, {
            user_id: userId,
            role: `host_${planTypeName}`,
            became_host_at: new Date().toISOString(),
        });
        yield orm_1.default.request(mutations_1.updateUserSubPeriod, {
            stripe_customer_id: customerId,
            sub_period_end: subPeriodEnd,
        });
    }
    catch (error) {
        console.log('[stripe /retry-invoice updateUserRole/updateUserSub error] -> ', error);
        Sentry.captureException(error);
        return res.status(500).send({ error });
    }
    // create a new token and send both token and invoice obj back
    const userObject = { email: userEmail, id: userId, role: `host_${planTypeName}` };
    try {
        const token = yield jwtHelper_1.createToken(userObject, process.env.SECRET);
        console.log(token);
        return res.status(201).send({ invoice, token });
    }
    catch (error) {
        console.log('[stripe /retry-invoice createToken  error] -> ', error);
        Sentry.captureException(error);
        return res.status(500).send({ error });
        // return res.status(500).send(error)
    }
}));
module.exports = stripeRouter;
//# sourceMappingURL=stripe-router.js.map