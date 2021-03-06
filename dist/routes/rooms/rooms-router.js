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
const orm_1 = __importDefault(require("../../services/orm"));
const mutations_1 = require("../../gql/mutations");
const createPreEventRooms_1 = __importDefault(require("./createPreEventRooms"));
const nextRound_1 = __importDefault(require("./nextRound"));
const queries_1 = require("../../gql/queries");
const runEventHelpers_1 = require("./runEventHelpers");
const express = require('express');
const roomsRouter = express.Router();
const jsonBodyParser = express.json();
roomsRouter.post('/end-event/:id', jsonBodyParser, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield runEventHelpers_1.endEvent(req.params.id, true);
    }
    catch (error) {
        console.log('error', error);
        Sentry.captureException(error);
    }
}));
roomsRouter.post('/start-pre-event/:id', jsonBodyParser, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const eventId = req.params.id;
    let onlineUsersResponse;
    try {
        onlineUsersResponse = yield orm_1.default.request(queries_1.getAvailableLobbyUsers, {
            eventId,
        });
        console.log('onlineUsersResponse', onlineUsersResponse);
        const maxNumUsersPerRoom = 40;
        const numOnlineUsers = onlineUsersResponse.data.online_event_users.length;
        console.log('numOnlineUsers', numOnlineUsers);
        const numRooms = Math.ceil(numOnlineUsers / maxNumUsersPerRoom);
        console.log('numRooms', numRooms);
        yield createPreEventRooms_1.default(numRooms, eventId);
        yield orm_1.default.request(mutations_1.updateEventObject, {
            id: eventId,
            newStatus: 'pre-event',
        });
    }
    catch (error) {
        Sentry.captureException(error);
        console.log('error = ', error);
        return res.status(500).json({ message: 'start pre-event failed' });
    }
    return res.status(200).json({ message: 'pre-event started' });
}));
// api/rooms/start-event/:eventId
roomsRouter.post('/start-event/:eventId', jsonBodyParser, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    __logger.info(`Event with id ${req.params.eventId} started.`);
    return nextRound_1.default({ req, res });
}));
module.exports = roomsRouter;
//# sourceMappingURL=rooms-router.js.map