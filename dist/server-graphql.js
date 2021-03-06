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
exports.startServer = void 0;
const apollo_server_express_1 = require("apollo-server-express");
const schema_1 = __importDefault(require("./schema/"));
const currentUser_1 = __importDefault(require("./extensions/currentUser"));
const startServer = (app, port) => __awaiter(void 0, void 0, void 0, function* () {
    const server = new apollo_server_express_1.ApolloServer({
        schema: schema_1.default,
        context: ({ req }) => __awaiter(void 0, void 0, void 0, function* () {
            const currentUser = yield currentUser_1.default(req.headers);
            return {
                currentUser,
                secret: process.env.SECRET,
                ip: req.connection.remoteAddress,
                req,
            };
        }),
    });
    server.applyMiddleware({ app, path: '/graphql' });
    return app.listen({ port }, () => {
        console.log('Apollo server running on /graphql');
    });
});
exports.startServer = startServer;
exports.default = {
    startServer: exports.startServer,
};
//# sourceMappingURL=server-graphql.js.map