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
exports.createToken = exports.constants = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
exports.constants = {
    claims: 'https://hasura.io/jwt/claims',
    adminSecret: 'X-Hasura-Admin-Secret',
    allowedRoles: 'X-Hasura-Allowed-Roles',
    defaultRole: 'X-Hasura-Default-Role',
    userId: 'X-Hasura-User-Id',
};
const roles = {
    anonymous: 'anonymous',
    user: 'user',
    host: 'host',
    host_starter: 'host_starter',
    host_premium: 'host_premium',
};
const createToken = (user, secret, expiresIn) => __awaiter(void 0, void 0, void 0, function* () {
    const tokenContents = {
        sub: `${user.id}`,
        name: user.email,
        iat: Date.now() / 1000,
    };
    tokenContents[exports.constants.claims] = {};
    tokenContents[exports.constants.claims][exports.constants.allowedRoles] = [
        roles.anonymous,
        roles.user,
        roles.host,
        roles.host_starter,
        roles.host_premium,
    ];
    tokenContents[exports.constants.claims][exports.constants.userId] = `${user.id}`;
    tokenContents[exports.constants.claims][exports.constants.defaultRole] = user.role;
    return yield jsonwebtoken_1.default.sign(tokenContents, secret);
});
exports.createToken = createToken;
//# sourceMappingURL=jwtHelper.js.map