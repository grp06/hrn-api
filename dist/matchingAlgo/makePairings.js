"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const shuffleArray_1 = __importDefault(require("./shuffleArray"));
const generateFinalMatchesArray_1 = __importDefault(require("./generateFinalMatchesArray"));
const calculatePoints_1 = __importDefault(require("./calculatePoints"));
const moveNullsToTheFront_1 = __importDefault(require("./moveNullsToTheFront"));
const adjustPointsBasedOnPreviousInteratction_1 = __importDefault(require("./adjustPointsBasedOnPreviousInteratction"));
const _ = require('lodash');
const makePairings = ({ onlineUsers, allRoundsDataForOnlineUsers, currentRound, eventId, fromLobbyScan, userIds, predeterminedPartnersQueryResponse, }) => {
    console.log('fromLobbyScan', fromLobbyScan);
    let pairingAttempts = 0;
    let finalMatches;
    let numNullPairings;
    const attemptPairings = () => {
        const calculatedPoints = calculatePoints_1.default({
            onlineUsers,
            currentRound,
            eventId,
        });
        console.log('attemptPairings -> calculatedPoints', JSON.stringify(calculatedPoints, null, 2));
        const adjustedPoints = adjustPointsBasedOnPreviousInteratction_1.default({
            calculatedPoints,
            allRoundsDataForOnlineUsers,
            eventId,
            predeterminedPartnersQueryResponse,
        });
        shuffleArray_1.default(adjustedPoints);
        console.log('attemptPairings -> adjustedPoints', JSON.stringify(adjustedPoints, null, 2));
        let reorderedWithNullsInFront;
        if (pairingAttempts < 1) {
            reorderedWithNullsInFront = moveNullsToTheFront_1.default({
                adjustedPoints,
                allRoundsDataForOnlineUsers,
                eventId,
            });
        }
        finalMatches = generateFinalMatchesArray_1.default(reorderedWithNullsInFront || adjustedPoints);
        if (!fromLobbyScan) {
            // when making assignments, after creating all the pairings, find out who didn't get paired
            const flattenedPairings = _.flatten(finalMatches);
            const difference = _.difference(userIds, flattenedPairings);
            console.log(' difference', difference);
            // push them to the pariings array with a null partner
            difference.forEach((userWithoutPairing) => finalMatches.push([userWithoutPairing, null]));
        }
        numNullPairings = finalMatches.reduce((all, item) => {
            if (item[1] === null) {
                all += 1;
            }
            return all;
        }, 0);
        console.log('makePairings -> numNullPairings', numNullPairings);
        if (numNullPairings > 1 && pairingAttempts < 20) {
            pairingAttempts += 1;
            console.log('makePairings -> pairingAttempts', pairingAttempts);
            finalMatches = null;
            numNullPairings = null;
            return attemptPairings();
        }
    };
    attemptPairings();
    console.log('makePairings -> finalMatches', finalMatches);
    return finalMatches;
};
exports.default = makePairings;
//# sourceMappingURL=makePairings.js.map