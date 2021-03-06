"use strict";
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
exports.sendCalendarInvite = exports.receiveNewPassword = exports.sendPasswordResetEmail = exports.usePasswordHashToMakeToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const email_1 = require("../../modules/email");
const orm_1 = __importDefault(require("../../services/orm"));
const mutations_1 = require("../../gql/mutations");
const auth_service_1 = require("../../services/auth-service");
const jwtHelper_1 = require("../../extensions/jwtHelper");
const users_service_1 = __importDefault(require("../users/users-service"));
const queries_1 = require("../../gql/queries");
const sgMail = require('@sendgrid/mail');
// `secret` is passwordHash concatenated with user's createdAt,
// so if someones gets a user token they still need a timestamp to intercept.
const usePasswordHashToMakeToken = ({ password: passwordHash, id: userId, created_at }) => {
    const secret = `${passwordHash}-${created_at}`;
    const token = jsonwebtoken_1.default.sign({ userId }, secret, {
        expiresIn: 3600, // 1 hour
    });
    return token;
};
exports.usePasswordHashToMakeToken = usePasswordHashToMakeToken;
const sendPasswordResetEmail = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email } = req.params;
    let user;
    // find user
    try {
        const checkEmailRequest = yield orm_1.default.request(queries_1.findUserByEmail, { email: email });
        user = checkEmailRequest.data.users[0];
        if (!user) {
            return res.status(400).json({ error: 'No user with that email' });
        }
    }
    catch (err) {
        return res.status(404).json('Error finding user');
    }
    // make the relevant items to send in an email
    const token = exports.usePasswordHashToMakeToken(user);
    const url = email_1.getPasswordResetURL(user, token);
    const emailTemplate = email_1.resetPasswordTemplate(user, url);
    // send email
    try {
        sgMail.setApiKey(process.env.SENDGRID_API_KEY);
        const sendRes = yield sgMail.send(emailTemplate);
    }
    catch (error) {
        return res.status(400).json({ error: error.response.body.errors[0].message });
    }
    return res.send('template sent');
});
exports.sendPasswordResetEmail = sendPasswordResetEmail;
const receiveNewPassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log('receiveNewPassword -> receiveNewPassword', exports.receiveNewPassword);
    const { userId, token } = req.params;
    const { password } = req.body;
    const passwordError = users_service_1.default.validatePassword(password);
    if (passwordError)
        return res.status(400).json({ error: passwordError });
    // find user by ID
    let user;
    try {
        const checkIdRequest = yield orm_1.default.request(queries_1.findUserById, { id: userId });
        user = checkIdRequest.data.users[0];
        if (!user) {
            return res.status(400).json({ error: 'No user with that email' });
        }
    }
    catch (err) {
        return res.status(404).json({ error: 'Error finding user' });
    }
    let payload;
    try {
        const secret = `${user.password}-${user.created_at}`;
        payload = jsonwebtoken_1.default.verify(token, secret);
    }
    catch (error) {
        return res.status(401).json({ error: 'Unauthorized request' });
    }
    if (payload.userId === user.id) {
        let hashedPassword;
        let updatedUser;
        try {
            hashedPassword = yield auth_service_1.hashPassword(password);
        }
        catch (error) {
            return res.send('error hashing password');
        }
        // find user and update
        try {
            const userObject = { id: userId, newPassword: hashedPassword };
            const updatePasswordResult = yield orm_1.default.request(mutations_1.updatePasswordByUserId, userObject);
            updatedUser = updatePasswordResult.data.update_users.returning[0];
        }
        catch (error) {
            return res.send('error inserting new password');
        }
        return res.status(200).send({
            token: yield jwtHelper_1.createToken(updatedUser, process.env.SECRET),
            role: updatedUser.role,
            id: updatedUser.id,
        });
    }
    return res.status(404).json({ error: 'Something went wrong with the link you used.' });
});
exports.receiveNewPassword = receiveNewPassword;
const sendCalendarInvite = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let message;
    try {
        message = yield email_1.rsvpTemplate(req.body);
    }
    catch (error) {
        console.log('error making rsvp template', error);
    }
    try {
        sgMail.setApiKey(process.env.SENDGRID_API_KEY);
        yield sgMail.send(message);
        return res.send('rsvp message sent');
    }
    catch (error) {
        console.log('Something went wrong sending the iCal email', error);
    }
});
exports.sendCalendarInvite = sendCalendarInvite;
//# sourceMappingURL=email.controller.js.map