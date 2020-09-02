import * as Sentry from '@sentry/node'
import express from 'express'

const webhooks = express.Router()
const jsonBodyParser = express.json()

// /webhooks/next-round

webhooks.post('/next-round', jsonBodyParser, async (req, res, next) => {
  console.log('hit the next round webhook')
  return res.status(200).send({
    message: 'success',
  })
})

export default webhooks
