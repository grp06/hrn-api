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
exports.stripeSubscriptionConfirmationTemplate = exports.signUpConfirmationTemplate = exports.postEventTemplate = exports.sendFollowupsToHosts = exports.sendEmailsToNoShows = exports.sendReminders = exports.rsvpTemplate = exports.resetPasswordTemplate = exports.getPasswordResetURL = void 0;
const rsvp_1 = require("./rsvp");
const _ = require('lodash');
const sgMail = require('@sendgrid/mail');
const path = require('path');
const ejs = require('ejs');
const moment = require('moment');
// API endpoint
const getPasswordResetURL = (user, token) => {
    let frontendUrl;
    switch (process.env.DEPLOYED_ENV) {
        case 'local':
            frontendUrl = 'http://localhost:3000';
            break;
        case 'staging':
            frontendUrl = 'https://staging.launch.hirightnow.co';
            break;
        case 'production':
            frontendUrl = 'https://launch.hirightnow.co';
            break;
        default:
            frontendUrl = 'http://localhost:3000';
    }
    return `${frontendUrl}/set-new-password/${user.id}/${token}`;
};
exports.getPasswordResetURL = getPasswordResetURL;
const resetPasswordTemplate = (user, url) => {
    const from = process.env.EMAIL_LOGIN;
    const to = user.email;
    const subject = '🔐 Hi Right Now - Super Secret Password Reset';
    const html = `
  <p>Hey ${user.name || user.email},</p>
  <p>We heard that you lost your HiRightNow password. Sorry about that!</p>
  <p>But don’t worry! You can use the following link to reset your password:</p>
  <a href=${url}>${url}</a>
  <p>If you don’t use this link within 1 hour, it will expire.</p>
  <p>Do something outside today! </p>
  <p>–Your friends at HiRightNow</p>
  `;
    return { from, to, subject, html };
};
exports.resetPasswordTemplate = resetPasswordTemplate;
const rsvpTemplate = (fields) => __awaiter(void 0, void 0, void 0, function* () {
    let htmlTemplate;
    const { name, email, event_name, event_id, description, host_name, event_start_time } = fields;
    const eventLink = `https://launch.hirightnow.co/events/${event_id}`;
    try {
        const ejsResponse = yield ejs.renderFile(path.join(__dirname, '/views/rsvp-email.ejs'), {
            event_link: eventLink,
            event_name: event_name,
        });
        htmlTemplate = ejsResponse;
    }
    catch (error) {
        __Sentry.captureException(error);
        return error;
    }
    let iCalString;
    try {
        iCalString = yield rsvp_1.makeCalendarInvite(event_name, host_name, event_id, event_start_time);
    }
    catch (error) {
        return 'calendar invite error';
    }
    const from = process.env.EMAIL_LOGIN;
    const to = email;
    const subject = `✅ Hi Right Now - ${event_name} confirmation`;
    const content = [
        {
            type: 'text/html',
            value: htmlTemplate,
        },
        {
            type: 'text/calendar',
            value: iCalString,
        },
    ];
    return { from, to, subject, content };
});
exports.rsvpTemplate = rsvpTemplate;
const sendReminders = ({ events, filePath, timeframeString }) => __awaiter(void 0, void 0, void 0, function* () {
    yield Promise.all(events.map((event) => __awaiter(void 0, void 0, void 0, function* () {
        const { event_name, start_at, id: event_id } = event;
        const eventLink = `https://launch.hirightnow.co/events/${event_id}`;
        const eventTime = moment(start_at).format('h:mm');
        return {
            event,
            template: yield ejs.renderFile(path.join(__dirname, filePath), {
                event_link: eventLink,
                event_name: event_name,
                event_start_time: eventTime,
            }),
        };
    }))).then((resArray) => {
        resArray.forEach((item) => {
            const { event, template } = item;
            const eventUserEmails = event.event_users.map((user) => user.user.email);
            const subject = `⏰ Hi Right Now - ${event.event_name} starts in ${timeframeString}!`;
            const message = {
                to: eventUserEmails,
                from: process.env.EMAIL_LOGIN,
                subject,
                html: template,
            };
            sgMail.setApiKey(process.env.SENDGRID_API_KEY);
            sgMail.sendMultiple(message);
        });
    });
});
exports.sendReminders = sendReminders;
const sendEmailsToNoShows = (eventsRecentlyFinished, attendeesOfRecentlyFinishedEvents) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield Promise.all(eventsRecentlyFinished.map((event) => __awaiter(void 0, void 0, void 0, function* () {
            const { event_name } = event;
            return {
                event,
                template: yield ejs.renderFile(path.join(__dirname, '/views/no-show-followup.ejs'), {
                    event_name,
                }),
            };
        }))).then((resArray) => {
            resArray.forEach((item) => {
                const { event, template } = item;
                const eventUserEmails = event.event_users.map((user) => user.user.email);
                const subject = `🚶‍♂️ 🏃‍♀️ Following up from the Hi Right Now event`;
                const noShows = _.difference(eventUserEmails, attendeesOfRecentlyFinishedEvents);
                const message = {
                    to: noShows,
                    from: process.env.GEORGE_EMAIL_LOGIN,
                    subject,
                    html: template,
                };
                sgMail.setApiKey(process.env.SENDGRID_API_KEY);
                sgMail.sendMultiple(message);
            });
        });
    }
    catch (error) {
        console.log('error = ', error);
    }
});
exports.sendEmailsToNoShows = sendEmailsToNoShows;
const sendFollowupsToHosts = (eventsEndedJustUnderOneDayAgo, hostIdsFromAllEvents) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield Promise.all(eventsEndedJustUnderOneDayAgo.map((event) => __awaiter(void 0, void 0, void 0, function* () {
            return {
                event,
                template: yield ejs.renderFile(path.join(__dirname, '/views/first-time-host-followup.ejs')),
            };
        }))).then((resArray) => {
            resArray.forEach((item) => {
                const { event, template } = item;
                if (!hostIdsFromAllEvents.includes(event.host_id)) {
                    const subject = `📝 Following up from your Hi Right Now event`;
                    const hostsToEmail = event.host.email;
                    const message = {
                        to: hostsToEmail,
                        from: process.env.GEORGE_EMAIL_LOGIN,
                        subject,
                        html: template,
                    };
                    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
                    sgMail.sendMultiple(message);
                }
            });
        });
    }
    catch (error) {
        console.log('error = ', error);
    }
});
exports.sendFollowupsToHosts = sendFollowupsToHosts;
const postEventTemplate = (fields) => __awaiter(void 0, void 0, void 0, function* () {
    const { event_name, user, partnerData } = fields;
    const { name, email, profile_pic_url } = user;
    let htmlTemplate;
    try {
        const ejsResponse = yield ejs.renderFile(path.join(__dirname, '/views/post-event-email.ejs'), {
            firstName: name,
            event_name,
            partnerData,
            profile_pic_url,
        });
        htmlTemplate = ejsResponse;
    }
    catch (error) {
        return error;
    }
    const from = process.env.EMAIL_LOGIN;
    const to = email;
    const subject = `👩🏼‍🤝‍👨🏻 Hi Right Now - Your connections from ${event_name} `;
    const content = [
        {
            type: 'text/html',
            value: htmlTemplate,
        },
    ];
    return { from, to, subject, content };
});
exports.postEventTemplate = postEventTemplate;
const signUpConfirmationTemplate = (user) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, email } = user;
    const firstName = name.split(' ')[0];
    let htmlTemplate;
    try {
        const ejsResponse = yield ejs.renderFile(path.join(__dirname, '/views/sign-up-confirmation.ejs'), {
            firstName,
        });
        htmlTemplate = ejsResponse;
    }
    catch (error) {
        console.log('signUpConfirmationTemplate -> error', error);
        __Sentry.captureException(error);
        return error;
    }
    const from = process.env.EMAIL_LOGIN;
    const to = email;
    const subject = `👋 Hi Right Now - Welcome to the family!`;
    const content = [
        {
            type: 'text/html',
            value: htmlTemplate,
        },
    ];
    return { from, to, subject, content };
});
exports.signUpConfirmationTemplate = signUpConfirmationTemplate;
const stripeSubscriptionConfirmationTemplate = (stripeEmailFieldsObject) => __awaiter(void 0, void 0, void 0, function* () {
    const { plan, priceOfPlan, subPeriodEnd, userEmail } = stripeEmailFieldsObject;
    // subPeriodEnd is something like "2013-03-10T02:00:00Z"
    // we want to get the first ten chars and that is our recurring_payment_date
    // plan is like STARTER_MONTHLY,  PREMIUM_YEARLY
    let htmlTemplate;
    const planArray = plan.toLowerCase().split('_');
    const plan_type = `HRN ${planArray[0]} ${planArray[1]}`;
    try {
        const ejsResponse = yield ejs.renderFile(path.join(__dirname, '/views/stripe-subscription-confirmation-email.ejs'), {
            create_event_link: 'https://launch.hirightnow.co/create-event',
            charge_amount: `$${priceOfPlan} USD`,
            plan_type,
            recurring_payment_date: subPeriodEnd.substring(0, 10),
        });
        htmlTemplate = ejsResponse;
    }
    catch (error) {
        console.log('sendStripeSubscriptionConfirmation -> error', error);
        __Sentry.captureException(error);
        return error;
    }
    const from = process.env.EMAIL_LOGIN;
    const to = userEmail;
    const subject = `💰 Hi Right Now - We've confirmed your payment! 🤝`;
    const content = [
        {
            type: 'text/html',
            value: htmlTemplate,
        },
    ];
    return { from, to, subject, content };
});
exports.stripeSubscriptionConfirmationTemplate = stripeSubscriptionConfirmationTemplate;
//# sourceMappingURL=email.js.map