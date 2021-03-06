"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const createPartnersMap_1 = __importDefault(require("./createPartnersMap"));
const samyakAlgoPro_1 = __importDefault(require("./samyakAlgoPro"));
const makePairingsFromSamyakAlgo = ({ allRoundsDataForOnlineUsers, userIds, eventId }) => {
    const pairingsMap = createPartnersMap_1.default({ allRoundsDataForOnlineUsers, userIds, eventId });
    const { pairingsArray: newPairings } = samyakAlgoPro_1.default(userIds, pairingsMap);
    console.log('makePairingsFromSamyakAlgo -> newPairings', newPairings);
    return newPairings;
};
exports.default = makePairingsFromSamyakAlgo;
//# sourceMappingURL=makePairingsFromSamyakAlgo.js.map