import * as Sentry from '@sentry/node'
import express from 'express'
import nextRound from '../routes/rooms/nextRound'
import initNextRound from '../routes/rooms/initNextRound'

const webhooks = express.Router()
const jsonBodyParser = express.json()

// /webhooks/next-round
webhooks.post('/next-round', jsonBodyParser, async (req, res, next) => {
  console.log('hit the next round webhook')
  // const { payload } = res.body
  // console.log('payload', payload)
  console.log(new Date().toISOString())
  console.log('req.body = ', req.body)
  console.log('req.body.payload = ', req.body.payload)

  // call "next round"

  return res.status(200).send({
    message: 'success',
  })
})

export default webhooks
