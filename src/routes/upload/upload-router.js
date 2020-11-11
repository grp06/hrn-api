import * as Sentry from '@sentry/node'

const express = require('express')

const uploadRouter = express.Router()
const AWS = require('aws-sdk')

const envString = process.env.NODE_ENV === 'development' ? 'staging' : 'prod'
console.log('envString', envString)

uploadRouter.get('/profile-pic', async (req, res) => {
console.log("req", req.body)
  console.log('hit the endpoint')
  AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: 'us-east-1', // Must be the same as your bucket
    signatureVersion: 'v4',
  })
  const params = {
    ACL: 'public-read',
    Bucket: 'profile-pics',
    ContentType: 'image/jpeg',
    Fields: {
      key: 'req.body.name',
    },
    Conditions: [],
  }
  const options = {
    signatureVersion: 'v4',
    region: 'us-east-1', // same as your bucket
    endpoint: new AWS.Endpoint(`https://${envString}-${process.env.S3_BUCKET}.s3.amazonaws.com`),
    useAccelerateEndpoint: false,
    s3ForcePathStyle: true,
  }

  const client = new AWS.S3(options)
  const form = await new Promise((resolve, reject) => {
    client.createPresignedPost(params, (err, data) => {
      if (err) {
        console.log('form -> err', err)
        reject(err)
      } else {
        console.log('form -> data', data)
        resolve(data)
      }
    })
  })
  console.log('form = ', form)
  return res.json({
    form: { ...form, url: `https://${envString}-${process.env.S3_BUCKET}.s3.amazonaws.com` },
  })
})

module.exports = uploadRouter
