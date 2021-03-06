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
exports.resetEvent = exports.endEvent = exports.omniFinishRounds = void 0;
const Sentry = __importStar(require("@sentry/node"));
const set_rooms_completed_1 = __importDefault(require("./set-rooms-completed"));
const orm_1 = __importDefault(require("../../services/orm"));
const mutations_1 = require("../../gql/mutations");
const queries_1 = require("../../gql/queries");
const createGroupRoom_1 = __importDefault(require("./createGroupRoom"));
const jobs_1 = __importDefault(require("../../services/jobs"));
const killAllJobsByEventId = (eventId) => {
    // console.log('jobs = ', jobs)
    if (jobs_1.default.lobbyAssignments[eventId]) {
        jobs_1.default.lobbyAssignments[eventId].stop();
        jobs_1.default.lobbyAssignments[eventId] = null;
        console.log('clearing lobby assignments job');
    }
    if (jobs_1.default.nextRound[eventId]) {
        jobs_1.default.nextRound[eventId].stop();
        jobs_1.default.nextRound[eventId] = null;
        console.log('clearing next round job');
    }
    if (jobs_1.default.betweenRounds[eventId]) {
        jobs_1.default.betweenRounds[eventId].stop();
        jobs_1.default.betweenRounds[eventId] = null;
        console.log('clearing between rounds');
    }
};
// ensures that rooms are closed before next round
const omniFinishRounds = (currentRound, eventId) => __awaiter(void 0, void 0, void 0, function* () {
    console.log('🚀 ~ omniFinishRounds ~ currentRound', currentRound);
    if (jobs_1.default.lobbyAssignments[eventId]) {
        jobs_1.default.lobbyAssignments[eventId].stop();
        jobs_1.default.lobbyAssignments[eventId] = null;
    }
    if (jobs_1.default.nextRound[eventId]) {
        jobs_1.default.nextRound[eventId].stop();
        jobs_1.default.nextRound[eventId] = null;
        console.log('clearing next round job');
    }
    try {
        // on round 1 dont set to in between rounds
        const updateEventObjectRes = yield orm_1.default.request(mutations_1.updateEventObject, {
            id: eventId,
            newStatus: 'in-between-rounds',
            newCurrentRound: currentRound,
        });
        if (updateEventObjectRes.errors) {
            throw new Error(updateEventObjectRes.errors[0].message);
        }
        const deleteCronTimestampRes = yield orm_1.default.request(mutations_1.deleteCronTimestamp, {
            eventId,
        });
        console.log('omniFinishRounds -> deleteCronTimestampRes', deleteCronTimestampRes);
        if (deleteCronTimestampRes.errors) {
            Sentry.captureException(deleteCronTimestampRes.errors[0].message);
            throw new Error(deleteCronTimestampRes.errors[0].message);
        }
        console.log('set room to in-between-rounds for eventId ', eventId);
    }
    catch (error) {
        console.log('omniFinishRounds -> error', error);
        Sentry.captureException(error);
    }
    // set ended_at in db for the round we just completed
});
exports.omniFinishRounds = omniFinishRounds;
const endEvent = (eventId, isCompletingEvent) => __awaiter(void 0, void 0, void 0, function* () {
    killAllJobsByEventId(eventId);
    // console.log('jobs = ', jobs)
    try {
        const completedRoomsPromises = yield set_rooms_completed_1.default(eventId);
        yield Promise.all(completedRoomsPromises);
        const eventInfoRes = yield orm_1.default.request(queries_1.getEventInfoByEventId, { eventId });
        console.log('🚀 ~ endEvent ~ eventInfoRes', eventInfoRes);
        const { host_id, group_video_chat } = eventInfoRes.data.events[0];
        console.log('endEvent -> host_id', host_id);
        const onlineUsersResponse = yield orm_1.default.request(queries_1.getAvailableLobbyUsers, {
            eventId,
        });
        if (onlineUsersResponse.errors) {
            Sentry.captureException(onlineUsersResponse.errors[0].message);
            throw new Error(onlineUsersResponse.errors[0].message);
        }
        const onlineUsers = onlineUsersResponse.data.online_event_users;
        const userIds = onlineUsers.map((user) => user.user_id);
        const hostIsOnline = userIds.includes(host_id);
        console.log('endEvent -> hostIsOnline', hostIsOnline);
        let updateEventObjectRes;
        if (hostIsOnline && group_video_chat && !isCompletingEvent) {
            const createGroupRoomRes = yield createGroupRoom_1.default(eventId);
            if (createGroupRoomRes.errors) {
                throw new Error(createGroupRoomRes.errors[0].message);
            }
            updateEventObjectRes = yield orm_1.default.request(mutations_1.updateEventObject, {
                id: eventId,
                newStatus: 'group-video-chat',
            });
            console.log('set status to group video chat');
        }
        else {
            updateEventObjectRes = yield orm_1.default.request(mutations_1.updateEventObject, {
                id: eventId,
                newStatus: 'complete',
                ended_at: new Date().toISOString(),
            });
            console.log('set status to event complete');
        }
        if (updateEventObjectRes.errors) {
            throw new Error(updateEventObjectRes.errors[0].message);
        }
        const deleteCronTimestampRes = yield orm_1.default.request(mutations_1.deleteCronTimestamp, {
            eventId,
        });
        if (deleteCronTimestampRes.errors) {
            Sentry.captureException(deleteCronTimestampRes.errors[0].message);
            throw new Error(deleteCronTimestampRes.errors[0].message);
        }
    }
    catch (error) {
        console.log('endEvent -> error', error);
        Sentry.captureException(error);
    }
});
exports.endEvent = endEvent;
const resetEvent = (eventId) => __awaiter(void 0, void 0, void 0, function* () {
    killAllJobsByEventId(eventId);
    try {
        const completedRoomsPromises = yield set_rooms_completed_1.default(eventId);
        yield Promise.all(completedRoomsPromises);
        const resetEventRes = yield orm_1.default.request(mutations_1.resetEventStatus, {
            eventId,
        });
        if (resetEventRes.errors) {
            Sentry.captureException(resetEventRes.errors[0].message);
            throw new Error(resetEventRes.errors[0].message);
        }
        const deletePartnersRes = yield orm_1.default.request(mutations_1.deletePartnersByEventId, {
            eventId,
        });
        if (deletePartnersRes.errors) {
            Sentry.captureException(deletePartnersRes.errors[0].message);
            throw new Error(deletePartnersRes.errors[0].message);
        }
        const deleteCronTimestampRes = yield orm_1.default.request(mutations_1.deleteCronTimestamp, {
            eventId,
        });
        console.log('endEvent -> deleteCronTimestampRes', deleteCronTimestampRes);
        if (deleteCronTimestampRes.errors) {
            Sentry.captureException(deleteCronTimestampRes.errors[0].message);
            throw new Error(deleteCronTimestampRes.errors[0].message);
        }
    }
    catch (error) {
        Sentry.captureException(error);
    }
});
exports.resetEvent = resetEvent;
//# sourceMappingURL=runEventHelpers.js.map