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
const runEventHelpers_1 = require("./runEventHelpers");
const orm_1 = __importDefault(require("../../services/orm"));
const set_rooms_completed_1 = __importDefault(require("./set-rooms-completed"));
const mutations_1 = require("../../gql/mutations");
const initNextRound_1 = __importDefault(require("./initNextRound"));
const omniCreatePairings_1 = __importDefault(require("../../matchingAlgo/omniCreatePairings"));
const scanLobbyForPairings_1 = __importDefault(require("./scanLobbyForPairings"));
const nextRound = ({ req, res, params }) => __awaiter(void 0, void 0, void 0, function* () {
    const oneMinuteInMs = 60000;
    let eventId;
    let numRounds;
    let round_length;
    let currentRound;
    let createPairingsRes;
    let useSamyakAlgo;
    try {
        if (req) {
            // we just called start event. First round
            eventId = parseInt(req.params.eventId, 10);
            numRounds = req.body.num_rounds || 10; // default ten rounds
            round_length = req.body.round_length * oneMinuteInMs || 300000;
            if (req.body.reset) {
                return runEventHelpers_1.resetEvent(eventId);
            }
            const completedRoomsPromises = yield set_rooms_completed_1.default(eventId);
            console.log('nextRound -> completedRoomsPromises', completedRoomsPromises);
            yield Promise.all(completedRoomsPromises);
            currentRound = 1;
        }
        else {
            // at least round 2
            eventId = params.eventId;
            numRounds = params.numRounds;
            round_length = params.round_length;
            currentRound = params.currentRound;
            useSamyakAlgo = params.useSamyakAlgo;
            console.log('nextRound params -> useSamyakAlgo', useSamyakAlgo);
        }
        // createPairingsRes can either be undefined, true, or ended event early'
        createPairingsRes = yield omniCreatePairings_1.default({ eventId, currentRound, useSamyakAlgo });
        console.log('nextRound -> createPairingsRes', createPairingsRes);
        if (createPairingsRes === 'ended event early') {
            console.log('no more pairings, end the event');
            runEventHelpers_1.endEvent(eventId);
            return null;
        }
        // set event status to in-progress
        const updateEventObjectRes = yield orm_1.default.request(mutations_1.updateEventObject, {
            id: eventId,
            newCurrentRound: currentRound,
            newStatus: 'room-in-progress',
        });
        if (updateEventObjectRes.errors) {
            Sentry.captureException(updateEventObjectRes.errors[0].message);
            throw new Error(updateEventObjectRes.errors[0].message);
        }
    }
    catch (error) {
        console.log('nextRound -> error', error);
        if (res) {
            Sentry.captureException(error);
            return res.status(500).json({ error });
        }
        return Sentry.captureException(error);
    }
    initNextRound_1.default({
        numRounds,
        eventId,
        roundLength: round_length,
        currentRound,
        useSamyakAlgo: createPairingsRes,
    });
    scanLobbyForPairings_1.default(eventId);
    if (res) {
        return res
            .status(200)
            .json({ message: 'Success starting the event and queueing up next round' });
    }
});
exports.default = nextRound;
//# sourceMappingURL=nextRound.js.map