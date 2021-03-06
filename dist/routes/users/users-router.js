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
const queries_1 = require("../../gql/queries");
const mutations_1 = require("../../gql/mutations");
const auth_service_1 = require("../../services/auth-service");
const jwtHelper_1 = require("../../extensions/jwtHelper");
const users_service_1 = __importDefault(require("./users-service"));
const email_service_1 = require("../../services/email-service");
const new_host_1 = require("../../discord-bots/new-host");
const express = require('express');
const usersRouter = express.Router();
const jsonBodyParser = express.json();
const { NODE_ENV } = require('../../config');
usersRouter.post('/', jsonBodyParser, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, email, password, role } = req.body;
    console.log('req.body at root /signup', req.body);
    for (const field of ['name', 'email', 'password', 'role'])
        if (!req.body[field]) {
            return res.status(400).json({
                error: `Missing '${field}' in request body`,
            });
        }
    // name, email, password validation
    // add logging for these errors?
    const nameError = users_service_1.default.validateName(name);
    if (nameError)
        return res.status(400).json({ error: nameError });
    const emailError = users_service_1.default.validateEmail(email);
    if (emailError)
        return res.status(400).json({ error: emailError });
    const passwordError = users_service_1.default.validatePassword(password);
    if (passwordError)
        return res.status(400).json({ error: passwordError });
    // check if user with email exists
    let existingUser;
    try {
        const checkEmailRequest = yield orm_1.default.request(queries_1.findUserByEmail, { email: email });
        existingUser = checkEmailRequest.data.users[0];
        console.log('checkEmailRequest', checkEmailRequest);
        if (existingUser) {
            const message = 'Email already in use';
            Sentry.captureMessage(message);
            return res.status(400).json({ error: message });
        }
    }
    catch (error) {
        Sentry.captureException(error);
        console.log('error: ', error);
        return res.status(500).json({
            error,
        });
    }
    // hash the password
    let hashedPassword;
    try {
        hashedPassword = yield auth_service_1.hashPassword(password);
    }
    catch (error) {
        Sentry.captureException(error);
        return res.status(500).json({
            error,
        });
    }
    const userObject = { name, email, password: hashedPassword, role };
    const variables = { objects: [userObject] };
    let newUser;
    // insert user into db
    try {
        const insertUserResult = yield orm_1.default.request(mutations_1.signUp, variables);
        newUser = insertUserResult.data.insert_users.returning[0];
        console.log('newUser', newUser);
        email_service_1.signUpConfirmation(newUser);
    }
    catch (error) {
        Sentry.captureException(error);
        return res.status(500).json({
            error,
        });
    }
    // send token and user details
    __logger.info(`User with email ${email} created`);
    try {
        return res.status(201).json(Object.assign({ token: yield jwtHelper_1.createToken(newUser, process.env.SECRET) }, users_service_1.default.serializeUser(newUser)));
    }
    catch (error) {
        Sentry.captureException(error);
        return res.status(500).json({
            error,
        });
    }
}));
usersRouter.post('/reset-password', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email } = req.body;
    if (!email) {
        return res.status(400).json({
            error: `Missing 'email' in request body`,
        });
    }
    let existingUser;
    try {
        const checkEmailRequest = yield orm_1.default.request(queries_1.findUserByEmail, { email: email });
        existingUser = checkEmailRequest.data.users[0];
        if (!existingUser) {
            return res.status(400).json({ error: 'Could not find user with that email' });
        }
    }
    catch (error) {
        return res.status(500).json({
            error,
        });
    }
}));
usersRouter.get('/get-anonymous-token', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        return res.status(201).json({
            token: yield jwtHelper_1.createToken({ id: null, email: null, role: 'anonymous' }, process.env.SECRET),
        });
    }
    catch (error) {
        Sentry.captureException(error);
        return res.status(500).json({
            error,
        });
    }
}));
usersRouter.post('/upgrade-to-host', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.body;
    try {
        const userRoleResponse = yield orm_1.default.request(mutations_1.updateUserRole, {
            user_id: userId,
            role: 'host',
            became_host_at: new Date().toISOString(),
        });
        const userObject = userRoleResponse.data.update_users.returning[0];
        const { name, email, city, linkedIn_url } = userObject;
        if (NODE_ENV === 'production') {
            new_host_1.channel.send('🦦🦦🦦');
            new_host_1.channel.send('**New Host Signup!**');
            new_host_1.channel.send(`
\`\`\`
${name} from ${city}
${email} ... ${linkedIn_url || ''}
\`\`\``);
            new_host_1.channel.send('🦦🦦🦦');
        }
        return res.status(201).json({
            token: yield jwtHelper_1.createToken(userObject, process.env.SECRET),
        });
    }
    catch (error) {
        Sentry.captureException(error);
        return res.status(500).json({
            error,
        });
    }
}));
module.exports = usersRouter;
//# sourceMappingURL=users-router.js.map