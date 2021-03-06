"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.channel = exports.newHost = void 0;
const Discord = require('discord.js');
const client = new Discord.Client();
let channel;
exports.channel = channel;
const newHost = () => {
    try {
        client.once('ready', () => {
            exports.channel = channel = client.channels.cache.get('793029475461496842');
        });
        client.login(process.env.DISCORD_TOKEN);
    }
    catch (error) {
        console.log('🚀 ~ newHost ~ error', error);
    }
};
exports.newHost = newHost;
//# sourceMappingURL=new-host.js.map