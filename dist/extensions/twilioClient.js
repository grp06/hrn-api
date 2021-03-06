"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Twilio = require('twilio');
console.log('process.env.TWILIO_AUTHTOKEN', process.env.TWILIO_AUTHTOKEN);
const client = new Twilio('AC712594f590c0d874685c04858f7398f9', '95af76d75ebe6811a23ec3b43d7e6477');
exports.default = client;
//# sourceMappingURL=twilioClient.js.map