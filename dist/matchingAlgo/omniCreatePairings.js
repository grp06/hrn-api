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
const makePairingsFromSamyakAlgo_1 = __importDefault(require("./makePairingsFromSamyakAlgo"));
const makePairings_1 = __importDefault(require("./makePairings"));
const orm_1 = __importDefault(require("../services/orm"));
const transformPairingsToGqlVars_1 = __importDefault(require("../routes/rooms/transformPairingsToGqlVars"));
const mutations_1 = require("../gql/mutations");
const getOnlineUsers_1 = __importDefault(require("./getOnlineUsers"));
const getAllRoundsDataForOnlineUsers_1 = __importDefault(require("./getAllRoundsDataForOnlineUsers"));
const getPredeterminedPartners_1 = __importDefault(require("./getPredeterminedPartners"));
const omniCreatePairings = ({ eventId, currentRound, fromLobbyScan, useSamyakAlgo }) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // get all online users for this eventId
        const [userIds, onlineUsers] = yield getOnlineUsers_1.default(eventId);
        if (userIds.length < 2 && fromLobbyScan) {
            console.log('not enough to pair from lobby scan');
            return null;
        }
        const allRoundsDataForOnlineUsers = yield getAllRoundsDataForOnlineUsers_1.default(userIds);
        const predeterminedPartnersQueryResponse = yield getPredeterminedPartners_1.default({
            userIds,
            eventId,
        });
        let pairings;
        let isSamyakAlgo;
        // revert 1 to 15
        if (onlineUsers.length < 15 || useSamyakAlgo) {
            console.log('making assignments with samyak algo');
            pairings = makePairingsFromSamyakAlgo_1.default({
                allRoundsDataForOnlineUsers,
                userIds,
                eventId,
            });
            isSamyakAlgo = true;
        }
        else {
            console.log('making assignment with the new algo');
            pairings = makePairings_1.default({
                onlineUsers,
                allRoundsDataForOnlineUsers,
                currentRound,
                eventId,
                fromLobbyScan,
                userIds,
                predeterminedPartnersQueryResponse,
            });
        }
        const numNullPairings = pairings.reduce((all, item) => {
            if (item[1] === null) {
                all += 1;
            }
            return all;
        }, 0);
        // don't end it if we're just dealing with 3 people, we're most likely testing
        const tooManyBadPairings = numNullPairings >= onlineUsers.length / 2 || pairings.length === 0;
        if (tooManyBadPairings && !fromLobbyScan) {
            console.log('ended event early');
            return 'ended event early';
        }
        // transform pairings to be ready for insertion to partners table
        const variablesArray = transformPairingsToGqlVars_1.default({ pairings, eventId, round: currentRound });
        // write to partners table
        const bulkInsertPartnersRes = yield orm_1.default.request(mutations_1.bulkInsertPartners, {
            objects: variablesArray,
        });
        if (bulkInsertPartnersRes.errors) {
            throw new Error(bulkInsertPartnersRes.errors[0].message);
        }
        return isSamyakAlgo;
    }
    catch (error) {
        console.log('omniCreatePairings -> error', error);
        Sentry.captureException(error);
    }
});
exports.default = omniCreatePairings;
//# sourceMappingURL=omniCreatePairings.js.map