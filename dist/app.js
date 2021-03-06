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
const server_graphql_1 = require("./server-graphql");
const logger_1 = __importDefault(require("./logger"));
require("./services/cron-service");
const webhooks_1 = __importDefault(require("./webhooks"));
const orm_1 = __importDefault(require("./services/orm"));
// import { bulkInsertPartners } from './gql/mutations'
const unsplash_js_1 = __importStar(require("unsplash-js"));
const initNextRound_1 = __importDefault(require("./routes/rooms/initNextRound"));
const queries_1 = require("./gql/queries");
const new_host_1 = require("./discord-bots/new-host");
require('dotenv').config();
require('es6-promise').polyfill();
require('isomorphic-fetch');
const cors = require('cors');
const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const fs = require('fs');
const fileType = require('file-type');
const multiparty = require('multiparty');
const sharp = require('sharp');
const { NODE_ENV, PORT } = require('./config.js');
const roomsRouter = require('./routes/rooms/rooms-router');
const tokenRouter = require('./routes/twilio-token/twilio-token-router');
const usersRouter = require('./routes/users/users-router');
const authRouter = require('./routes/auth/auth-router');
const uploadRouter = require('./routes/upload/upload-router');
const emailRouter = require('./routes/email/email-router');
const stripeRouter = require('./routes/stripe/stripe-router');
const unsplash = new unsplash_js_1.default({ accessKey: process.env.UNSPLASH_ACCESS_KEY });
const app = express();
new_host_1.newHost();
Sentry.init({ dsn: 'https://c9f54122fb8e4de4b52f55948a091e2b@o408346.ingest.sentry.io/5279031' });
const morganOption = NODE_ENV === 'production' ? 'tiny' : 'common';
global.__logger = logger_1.default;
global.__Sentry = Sentry;
// The request handler must be the first middleware on the app
app.use(Sentry.Handlers.requestHandler());
app.use(bodyParser.urlencoded({
    extended: true,
}));
app.use(bodyParser.json());
app.use(morgan(morganOption));
app.use(cors());
server_graphql_1.startServer(app, PORT);
app.use('/api/rooms', roomsRouter);
app.use('/api/token', tokenRouter);
app.use('/api/signup', usersRouter);
app.use('/api/auth', authRouter);
app.use('/api/upload', uploadRouter);
app.use('/api/email', emailRouter);
app.use('/api/stripe', stripeRouter);
app.use('/api/webhooks', webhooks_1.default);
app.get('/', (req, res) => {
    res.send('Looks like the HiRightNow API is working!');
});
app.get('/event-trigger-test', () => {
    console.log('hiii from event trigger test');
});
app.post('/get-unsplash-image', (req, res) => {
    try {
        unsplash.search
            .photos(req.body.keyword, 1, 10, { orientation: 'landscape' })
            .then(unsplash_js_1.toJson)
            .then((json) => {
            console.log('json', json);
            const randomIndex = Math.floor(Math.random() * 10);
            return res.status(200).send({ image: json.results[randomIndex] });
        });
    }
    catch (error) {
        return res.status(500).send(error);
    }
});
app.get('/debug-sentry', () => {
    throw new Error('My first Sentry error!');
});
// The error handler must be before any other error middleware
app.use(Sentry.Handlers.errorHandler());
app.set('view engine', 'ejs');
app.use(function errorHandler(error, req, res, next) {
    let response;
    if (NODE_ENV === 'production') {
        response = { error: { message: 'server error' } };
    }
    else {
        console.error(error);
        response = { message: error.message, error };
    }
    res.status(500).json(response);
});
const checkForInterruptedEvents = () => __awaiter(void 0, void 0, void 0, function* () {
    console.log('checking for interrupted events');
    const cronJobs = yield orm_1.default.request(queries_1.getCronJobs);
    console.log('cronJobs.data.cron_jobs = ', cronJobs.data.cron_jobs);
    if (cronJobs.data.cron_jobs.length) {
        cronJobs.data.cron_jobs.forEach((event) => {
            const { next_round_start: nextRoundStart } = event;
            const { num_rounds: numRounds, id: eventId, round_length, current_round: currentRound, } = event.event;
            const roundLength = round_length * 60000;
            initNextRound_1.default({ numRounds, eventId, roundLength, currentRound, nextRoundStart });
        });
    }
});
checkForInterruptedEvents();
module.exports = app;
//# sourceMappingURL=app.js.map