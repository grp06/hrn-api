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
const jobs_1 = __importDefault(require("../../services/jobs"));
const orm_1 = __importDefault(require("../../services/orm"));
const queries_1 = require("../../gql/queries");
const omniCreatePairings_1 = __importDefault(require("../../matchingAlgo/omniCreatePairings"));
const scanLobbyForPairings = (eventId) => {
    console.log('scanLobbyForPairings -> eventId', eventId);
    jobs_1.default.lobbyAssignments[eventId] = new cron_1.CronJob('*/20 * * * * *', function () {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('scanning lobby for assignments');
            // get query for eventObj by eventId
            let eventInfo;
            try {
                eventInfo = yield orm_1.default.request(queries_1.getEventInfoByEventId, {
                    eventId,
                });
            }
            catch (error) {
                console.log('scanLobbyForPairings -> error', error);
                Sentry.captureException(error);
            }
            const eventObj = eventInfo.data.events[0];
            const { status, updated_at, round_length, current_round } = eventObj;
            console.log('scanLobbyForPairings -> status', status);
            const roundLengthInMs = round_length * 60000;
            const twoMinsInMs = 120000;
            const roundEndsAt = new Date(updated_at).getTime() + roundLengthInMs;
            const moreThanTwoMinsLeft = roundEndsAt - Date.now() > twoMinsInMs;
            if (status === 'room-in-progress' && moreThanTwoMinsLeft) {
                console.log('TRY TO MAKE NEW MATCHES');
                omniCreatePairings_1.default({ eventId, currentRound: current_round, fromLobbyScan: true });
            }
            else {
                console.log('LESS THAN 2 MINS');
            }
            // if we're not in between rounds
            // and there's > 2 mins left in the round
            // make pairings with eventId and currentRound
        });
    });
    setTimeout(() => {
        jobs_1.default.lobbyAssignments[eventId].start();
    }, 20000);
};
exports.default = scanLobbyForPairings;
//# sourceMappingURL=scanLobbyForPairings.js.map