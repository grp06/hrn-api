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
Object.defineProperty(exports, "__esModule", { value: true });
const apollo_server_express_1 = require("apollo-server-express");
const currentUser = (headers) => __awaiter(void 0, void 0, void 0, function* () {
    const authHeader = headers['Authorization'] || headers['authorization'];
    let token;
    if (authHeader != null && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7, authHeader.length);
    }
    else {
        new apollo_server_express_1.AuthenticationError('Invalid token.');
    }
    if (token) {
        try {
            const decodedJWT = yield jwt.verify(token, process.env.SECRET);
            if (decodedJWT.role === 'anonymous') {
                return null;
            }
            else {
                return decodedJWT;
            }
        }
        catch (e) {
            new apollo_server_express_1.AuthenticationError('Your session expired.  Sign in again.');
        }
    }
});
exports.default = currentUser;
//# sourceMappingURL=currentUser.js.map