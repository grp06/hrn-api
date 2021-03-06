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
const jwtHelper_1 = require("../../extensions/jwtHelper");
const auth_service_1 = require("../../services/auth-service");
const express = require('express');
const authRouter = express.Router();
const jsonBodyParser = express.json();
authRouter.post('/login', jsonBodyParser, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    const loginUser = { email, password };
    // make sure all keys are in request body
    for (const [key, value] of Object.entries(loginUser))
        if (value == null)
            return res.status(400).json({
                error: `Missing '${key}' in request body`,
            });
    let dbUser;
    // is the await functionality correct here?
    try {
        // check if user with email exists
        const checkEmailRequest = yield orm_1.default.request(queries_1.findUserByEmail, { email: email });
        dbUser = checkEmailRequest.data.users[0];
        if (!dbUser) {
            return res.status(400).json({ error: 'Incorrect email or password' });
        }
        // compare passwords with hashing
        const passwordCheck = yield auth_service_1.comparePasswords(loginUser.password, dbUser.password);
        if (!passwordCheck) {
            return res.status(400).json({
                error: 'Incorrect user_name or password',
            });
        }
    }
    catch (error) {
        console.log('Error logging in', error);
        Sentry.captureException(error);
        return res.status(500).json({
            error: 'There was an error logging in',
        });
    }
    console.log(dbUser);
    return res.send({
        token: yield jwtHelper_1.createToken(dbUser, process.env.SECRET),
        role: dbUser.role,
        id: dbUser.id,
    });
}));
module.exports = authRouter;
//# sourceMappingURL=auth-router.js.map