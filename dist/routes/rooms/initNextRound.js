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
const cron_1 = require("cron");
const nextRound_1 = __importDefault(require("./nextRound"));
const runEventHelpers_1 = require("./runEventHelpers");
const jobs_1 = __importDefault(require("../../services/jobs"));
const orm_1 = __importDefault(require("../../services/orm"));
const mutations_1 = require("../../gql/mutations");
const initNextRound = ({ numRounds, eventId, roundLength: round_length, currentRound, nextRoundStart, useSamyakAlgo, }) => __awaiter(void 0, void 0, void 0, function* () {
    console.log('numRounds', numRounds);
    console.log('eventId', eventId);
    console.log('roundLength', round_length);
    console.log('currentRound', currentRound);
    console.log('nextRoundStart', nextRoundStart);
    let betweenRoundsDelay = eventId === 656 ? 300 : 20;
    const eventIsOver = currentRound === numRounds;
    const roundLengthForStartupFuel = 900000;
    const length = eventId === 656 ? roundLengthForStartupFuel : round_length;
    const timeToEndRound = new Date(new Date().getTime() + length);
    console.log('🚀 ~ timeToEndRound', timeToEndRound);
    console.log('time now =', new Date(new Date().getTime()));
    // used for testing for super short rounds
    // date.setSeconds(date.getSeconds() + 20)
    let recoveredStartTime;
    if (nextRoundStart) {
        recoveredStartTime = new Date(nextRoundStart);
        console.log('recoverd =', recoveredStartTime);
    }
    // in X minutes, run the following code
    // if next_round_start exists, we're recovering from a server restart
    jobs_1.default.nextRound[eventId] = new cron_1.CronJob(recoveredStartTime || timeToEndRound, function () {
        return __awaiter(this, void 0, void 0, function* () {
            // const d = new Date()
            // when we're inside, its the END of currentRound
            try {
                yield runEventHelpers_1.omniFinishRounds(currentRound, eventId);
            }
            catch (error) {
                Sentry.captureException(error);
            }
            // I know it's not semantic to call variable currentTime, then increment it 20 secs
            // but if I do const twentySecondsFromNow = currentTime.setSeconds(currentTime.getSeconds() + 20)
            // it doesnt work. //Todo ... make this more semantic
            const currentTime = new Date();
            if (eventIsOver) {
                console.log('initNextRound -> eventIsOver', eventIsOver);
                betweenRoundsDelay = 10;
            }
            currentTime.setSeconds(currentTime.getSeconds() + betweenRoundsDelay);
            // in 20 seconds, run this code
            jobs_1.default.betweenRounds[eventId] = new cron_1.CronJob(currentTime, function () {
                return __awaiter(this, void 0, void 0, function* () {
                    if (eventIsOver) {
                        return runEventHelpers_1.endEvent(eventId);
                    }
                    return nextRound_1.default({
                        params: {
                            eventId,
                            currentRound: currentRound + 1,
                            round_length,
                            numRounds,
                            useSamyakAlgo,
                        },
                    });
                });
            });
            return jobs_1.default.betweenRounds[eventId].start();
        });
    });
    if (!nextRoundStart) {
        console.log('time sav =', timeToEndRound);
        const setCronTimestampRes = yield orm_1.default.request(mutations_1.setCronTimestamp, {
            eventId,
            timestamp: timeToEndRound.toISOString(),
        });
        console.log('setCronTimestampRes', setCronTimestampRes);
    }
    // TODO
    // insert job exectuion time in a new table
    // when the server starts, check for in progress events
    // if theres an in progress event, set up new cron
    return jobs_1.default.nextRound[eventId].start();
});
exports.default = initNextRound;
//# sourceMappingURL=initNextRound.js.map