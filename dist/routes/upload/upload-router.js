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
const mutations_1 = require("../../gql/mutations");
const fs = require('fs');
const multiparty = require('multiparty');
const sharp = require('sharp');
const fileType = require('file-type');
const express = require('express');
const uploadRouter = express.Router();
const AWS = require('aws-sdk');
const envString = process.env.DEPLOYED_ENV === 'production' ? 'production' : 'staging';
console.log('envString', envString);
AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: 'us-east-1',
    signatureVersion: 'v4',
});
uploadRouter.post('/get-signed-url', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log('get signed url hit!');
    try {
        const form = new multiparty.Form();
        form.parse(req, (error, fields, files) => __awaiter(void 0, void 0, void 0, function* () {
            if (error) {
                return res.status(500).send(error);
            }
            try {
                const { path } = files.file[0];
                const userId = fields.userId[0];
                const buffer = fs.readFileSync(path);
                // resize the image
                yield sharp(buffer)
                    .resize(250, 250)
                    .toBuffer((err, data) => __awaiter(void 0, void 0, void 0, function* () {
                    const type = yield fileType.fromBuffer(data);
                    const bucketName = `hi-right-now-${envString}-profile-pictures`;
                    const signedUrlExpireSeconds = 60 * 5;
                    const key = `${Date.now()}-${userId}-${files.file[0].originalFilename}`;
                    const s3 = new AWS.S3();
                    const url = yield s3.getSignedUrl('putObject', {
                        ContentType: type.mime,
                        Bucket: bucketName,
                        Key: key,
                        ACL: 'public-read',
                        Expires: signedUrlExpireSeconds,
                    });
                    return res.json({
                        url,
                        data,
                    });
                }));
            }
            catch (err) {
                console.log('err', err);
                return res.status(500).send(err);
            }
        }));
    }
    catch (error) {
        console.log('error = ', error);
        Sentry.captureException(error);
    }
}));
uploadRouter.post('/save-profile-pic-url', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId, url } = req.body;
    try {
        yield orm_1.default.request(mutations_1.updateProfilePic, {
            id: userId,
            profile_pic_url: url,
        });
        return res.status(200).send({
            success: Boolean(mutations_1.updateProfilePic),
        });
    }
    catch (error) {
        console.log('error = ', error);
        Sentry.captureException(error);
        return res.status(500).send(error);
    }
}));
module.exports = uploadRouter;
//# sourceMappingURL=upload-router.js.map