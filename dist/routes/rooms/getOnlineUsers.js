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
const queries_1 = require("../../gql/queries");
const orm_1 = __importDefault(require("../../services/orm"));
const getOnlineUsers = (eventId) => __awaiter(void 0, void 0, void 0, function* () {
    let onlineEventUsers;
    try {
        // make the last seen a bit longer to accomodate buffer/lag between clients/server?
        const now = Date.now(); // Unix timestamp
        const xMsAgo = 30000; // 20 seconds
        const timestampXMsAgo = now - xMsAgo; // Unix timestamp
        const seenAfter = new Date(timestampXMsAgo);
        const eventUsersResponse = yield orm_1.default.request(queries_1.getOnlineUsersByEventId, {
            later_than: seenAfter,
            event_id: eventId,
        });
        onlineEventUsers = eventUsersResponse.data.event_users.map((user) => user.user.id);
    }
    catch (error) {
        console.log('getOnlineUsers -> error', error);
        Sentry.captureException(error);
    }
    return onlineEventUsers;
});
exports.default = getOnlineUsers;
//# sourceMappingURL=getOnlineUsers.js.map