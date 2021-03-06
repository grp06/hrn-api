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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const orm_1 = __importDefault(require("./orm"));
const email_service_1 = require("./email-service");
const queries_1 = require("../gql/queries");
const email_1 = require("../modules/email");
const moment = require('moment');
const cron = require('node-cron');
const oneDayInMs = 86400000;
const fiveMinsInMs = 300000;
const getEvents55to60MinsFromNow = () => __awaiter(void 0, void 0, void 0, function* () {
    console.log('check for events in next hour');
    let events55to60MinsFromNow;
    try {
        const oneHourFromNow = moment().add(1, 'hour');
        const fiftyFiveMinutesFromNow = moment().add(55, 'minutes');
        const getEventsResponse = yield orm_1.default.request(queries_1.getEventsByStartTime, {
            less_than: oneHourFromNow,
            greater_than: fiftyFiveMinutesFromNow,
        });
        events55to60MinsFromNow = getEventsResponse.data.events;
    }
    catch (error) {
        console.log('error checking for upcoming events', error);
        return __Sentry.captureException(error);
    }
    return events55to60MinsFromNow;
});
const getEventsStartingIn24Hours = () => __awaiter(void 0, void 0, void 0, function* () {
    console.log('check for events in next day');
    let eventsOneDayFromNow;
    try {
        const oneDayFromNow = moment().add(1, 'day');
        const oneDayMinusFiveMinsFromNow = moment().add(1435, 'minutes');
        const getEventsResponse = yield orm_1.default.request(queries_1.getEventsByStartTime, {
            less_than: oneDayFromNow,
            greater_than: oneDayMinusFiveMinsFromNow,
        });
        eventsOneDayFromNow = getEventsResponse.data.events;
    }
    catch (error) {
        console.log('error checking for upcoming events', error);
        return __Sentry.captureException(error);
    }
    return eventsOneDayFromNow;
});
const sendEmailsToUpcomingEventParticipants = () => __awaiter(void 0, void 0, void 0, function* () {
    const events55to60MinsFromNow = yield getEvents55to60MinsFromNow();
    const eventsStartingIn24Hours = yield getEventsStartingIn24Hours();
    if (events55to60MinsFromNow.length) {
        console.log('send out one hour reminder email');
        email_1.sendReminders({
            events: events55to60MinsFromNow,
            filePath: '/views/one-hour-event-reminder.ejs',
            timeframeString: 'one hour',
        });
    }
    if (eventsStartingIn24Hours.length) {
        console.log('send out 24 hour reminder email');
        email_1.sendReminders({
            events: eventsStartingIn24Hours,
            filePath: '/views/24-hour-event-reminder.ejs',
            timeframeString: '24 hours',
        });
    }
});
const sendPostEventConnetionEmails = (eventsRecentlyFinished) => __awaiter(void 0, void 0, void 0, function* () {
    const partnersToEmailPromises = [];
    eventsRecentlyFinished.forEach((event) => __awaiter(void 0, void 0, void 0, function* () {
        // query the event users and send emails from response
        partnersToEmailPromises.push(orm_1.default.request(queries_1.getContactSharesForSendingEmail, {
            event_id: event.id,
        }));
    }));
    const partnersToEmail = yield Promise.all(partnersToEmailPromises);
    const partnersArray = partnersToEmail.reduce((all, item, index) => {
        if (item && item.data && item.data.partners) {
            item.data.partners.forEach((partner) => {
                all.push(partner);
            });
        }
        return all;
    }, []);
    const listOfMatchesByUserEmail = partnersArray.reduce((all, item) => {
        if (!all.length) {
            all.push({
                name: item.user.name,
                email: item.user.email,
                partners: [item.partner],
                event_name: item.event.event_name,
            });
            return all;
        }
        const indexOfUserToOperateOn = all.findIndex((user) => user.email === item.user.email);
        if (indexOfUserToOperateOn === -1) {
            all.push({
                name: item.user.name,
                email: item.user.email,
                partners: [item.partner],
                event_name: item.event.event_name,
            });
            return all;
        }
        all[indexOfUserToOperateOn].partners.push(item.partner);
        return all;
    }, []);
    const sendPostEventMatchesEmailPromises = [];
    listOfMatchesByUserEmail.forEach((userObj) => {
        const { event_name, email, name, partners, profile_pic_url } = userObj;
        const fields = {
            event_name: event_name,
            user: { name: name.split(' ')[0], email, profile_pic_url },
            partnerData: partners,
        };
        sendPostEventMatchesEmailPromises.push(email_service_1.sendEmail(fields));
    });
    yield Promise.all(sendPostEventMatchesEmailPromises);
});
// check for finished events every 5 minutes
cron.schedule('*/5 * * * *', () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield sendEmailsToUpcomingEventParticipants();
        const fiveMinutesAgo = moment().subtract(5, 'minutes');
        const now = moment().subtract(0, 'minutes');
        const eventsEndedWithinLastFiveMins = yield orm_1.default.request(queries_1.getEventsByEndTime, {
            less_than: now,
            greater_than: fiveMinutesAgo,
        });
        const eventsRecentlyFinished = eventsEndedWithinLastFiveMins.data.events;
        yield sendPostEventConnetionEmails(eventsRecentlyFinished);
        if (eventsRecentlyFinished.length) {
            const eventIdsToQuery = eventsRecentlyFinished.map((event) => event.id);
            const attendees = yield orm_1.default.request(queries_1.getEventAttendeesFromListOfEventIds, {
                eventIds: eventIdsToQuery,
            });
            const attendeesOfRecentlyFinishedEvents = attendees.data.partners.map((partner) => partner.user.email);
            yield email_1.sendEmailsToNoShows(eventsRecentlyFinished, attendeesOfRecentlyFinishedEvents);
        }
        const oneDayPlusFiveMinsFromNow = new Date(Date.now() - oneDayInMs + fiveMinsInMs).toISOString();
        const oneDayAgo = new Date(Date.now() - oneDayInMs).toISOString();
        const getEventsResponse = yield orm_1.default.request(queries_1.getEventsByEndTime, {
            less_than: oneDayPlusFiveMinsFromNow,
            greater_than: oneDayAgo,
        });
        const eventsEndedJustUnderOneDayAgo = getEventsResponse.data.events;
        const allEventsResponse = yield orm_1.default.request(queries_1.getAllEvents);
        const hostIdsFromAllEvents = allEventsResponse.data.events;
        yield email_1.sendFollowupsToHosts(eventsEndedJustUnderOneDayAgo, hostIdsFromAllEvents);
    }
    catch (error) {
        console.log('error = ', error);
        return __Sentry.captureException(error);
    }
}));
//# sourceMappingURL=cron-service.js.map