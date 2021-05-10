const fs = require('fs')

const Sentry = require('@sentry/node')
const AWS = require('aws-sdk')
const express = require('express')
const fileType = require('file-type')
const multiparty = require('multiparty')
const sharp = require('sharp')

const { updateProfilePic } = require('../../gql/mutations')
const orm = require('../../services/orm')

const uploadRouter = express.Router()

const envString = process.env.DEPLOYED_ENV === 'production' ? 'production' : 'staging'

AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: 'us-east-1',
  signatureVersion: 'v4',
})

uploadRouter.post('/get-signed-url', async (req, res) => {
  console.log('get signed url hit!')
  try {
    const form = new multiparty.Form()

    form.parse(req, async (error, fields, files) => {
      if (error) {
        return res.status(500).send(error)
      }
      try {
        const { path } = files.file[0]
        const userId = fields.userId[0]
        const buffer = fs.readFileSync(path)
        // resize the image
        await sharp(buffer)
          .resize(250, 250)
          .toBuffer(async (err, data) => {
            const type = await fileType.fromBuffer(data)
            const bucketName = `hi-right-now-${envString}-profile-pictures`
            const signedUrlExpireSeconds = 60 * 5
            const key = `${Date.now()}-${userId}-${files.file[0].originalFilename}`
            const s3 = new AWS.S3()

            const url = await s3.getSignedUrl('putObject', {
              ContentType: type.mime,
              Bucket: bucketName,
              Key: key,
              ACL: 'public-read',
              Expires: signedUrlExpireSeconds,
            })

            return res.json({
              url,
              data,
            })
          })
      } catch (err) {
        console.log('err', err)
        return res.status(500).send(err)
      }
    })
  } catch (error) {
    console.log('error = ', error)
    Sentry.captureException(error)
  }
})

uploadRouter.post('/save-profile-pic-url', async (req, res) => {
  const { userId, url } = req.body
  try {
    await orm.request(updateProfilePic, {
      id: userId,
      profile_pic_url: url,
    })

    return res.status(200).send({
      success: Boolean(updateProfilePic),
    })
  } catch (error) {
    console.log('error = ', error)
    Sentry.captureException(error)
    return res.status(500).send(error)
  }
})

module.exports = uploadRouter
