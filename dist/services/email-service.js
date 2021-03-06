"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.stripeSubscriptionConfirmation = exports.signUpConfirmation = exports.sendEmail = void 0;
const email_1 = require("../modules/email");
const sgMail = require('@sendgrid/mail');
const sendEmail = (fields) => __awaiter(void 0, void 0, void 0, function* () {
    let message;
    try {
        message = yield email_1.postEventTemplate(fields);
    }
    catch (error) {
        __Sentry.captureException(error);
        console.log('error making email template', error);
    }
    try {
        sgMail.setApiKey(process.env.SENDGRID_API_KEY);
        yield sgMail.send(message);
    }
    catch (error) {
        __Sentry.captureException(error);
        console.log('Something went wrong sending email', error);
    }
});
exports.sendEmail = sendEmail;
const signUpConfirmation = (user) => __awaiter(void 0, void 0, void 0, function* () {
    let message;
    try {
        message = yield email_1.signUpConfirmationTemplate(user);
    }
    catch (error) {
        console.log('error making signup email template', error);
        __Sentry.captureException(error);
    }
    try {
        sgMail.setApiKey(process.env.SENDGRID_API_KEY);
        yield sgMail.send(message);
    }
    catch (error) {
        console.log('Something went wrong sending the signup template email', error);
        __Sentry.captureException(error);
    }
});
exports.signUpConfirmation = signUpConfirmation;
const stripeSubscriptionConfirmation = (stripeEmailFieldsObject) => __awaiter(void 0, void 0, void 0, function* () {
    let message;
    try {
        message = yield email_1.stripeSubscriptionConfirmationTemplate(stripeEmailFieldsObject);
    }
    catch (error) {
        console.log('error making signup email template', error);
        __Sentry.captureException(error);
    }
    try {
        sgMail.setApiKey(process.env.SENDGRID_API_KEY);
        yield sgMail.send(message);
    }
    catch (error) {
        console.log('Something went wrong sending the signup template email', error);
        __Sentry.captureException(error);
    }
});
exports.stripeSubscriptionConfirmation = stripeSubscriptionConfirmation;
//# sourceMappingURL=email-service.js.map