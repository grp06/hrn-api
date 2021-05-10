import { Router } from 'express'
import Unsplash, { toJson } from 'unsplash-js'

import webhooks from '../webhooks'
import authRouter from './auth/auth-router'
import emailRouter from './email/email-router'
import roomsRouter from './rooms/rooms-router'
import stripeRouter from './stripe/stripe-router'
import tokenRouter from './twilio-token/twilio-token-router'
import uploadRouter from './upload/upload-router'
import usersRouter from './users/users-router'

const router = Router()

/**
 * Categorised routes
 */
router.use('/rooms', roomsRouter)
router.use('/token', tokenRouter)
router.use('/signup', usersRouter)
router.use('/auth', authRouter)
router.use('/upload', uploadRouter)
router.use('/email', emailRouter)
router.use('/stripe', stripeRouter)
router.use('/webhooks', webhooks)

/**
 * Misc routes
 */
router.get('/', (req, res) => {
  res.send('Looks like the HiRightNow API is working!')
})

router.post('/get-unsplash-image', async (req, res) => {
  // Unsplash
  let unsplash: Unsplash
  if (process.env.UNSPLASH_ACCESS_KEY) {
    unsplash = new Unsplash({ accessKey: process.env.UNSPLASH_ACCESS_KEY })
  } else {
    throw new Error('The "UNSPLASH_ACCESS_KEY" env must be specified')
  }

  try {
    const json = await unsplash.search
      .photos(req.body.keyword, 1, 10, { orientation: 'landscape' })
      .then(toJson)

    const randomIndex = Math.floor(Math.random() * 10)
    return res.status(200).send({ image: json.results[randomIndex] })
  } catch (error) {
    return res.status(500).send(error)
  }
})

router.get('/debug-sentry', () => {
  throw new Error('My first Sentry error!')
})

export default router
