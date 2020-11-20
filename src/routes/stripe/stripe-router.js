import Stripe from 'stripe'

const express = require('express')

const stripeRouter = express.Router()

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

stripeRouter.post('/create-customer', async (req, res) => {
  const { email, name } = req.body
  const customer = await stripe.customers.create({ email, name })
  // TODO: save the customer id as stripeCustomerId in our db
  console.log('customer ->', customer)
  res.send({ customer })
})

stripeRouter.post('/create-subscription', async (req, res) => {
  const { customerId, paymentMethodId, planName } = req.body
  // set the default payment method on the customer
  try {
    await stripe.paymentMethods.attach(paymentMethodId, { customer: customerId })
  } catch (error) {
    return res.status(402).send({ error: { message: error.message } })
  }

  // let updateCustomerDefaultPaymentMethod = await stripe.customers.update(customerId, {
  //   invoice_settings: {
  //     default_payment_method: paymentMethodId,
  //   },
  // })

  // Create the subscription
  const subscription = await stripe.subscriptions.create({
    customer: customerId,
    items: [{ price: process.env[planName] }],
    expand: ['latest_invoice.payment_intent'],
  })

  res.send(subscription)
})

stripeRouter.post('/payment-intents', async (req, res) => {
  try {
    const { amount } = req.body
    console.log('amount ->', amount)

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'usd',
    })
    console.log(paymentIntent)
    console.log(paymentIntent.client_secret)
    return res.status(200).json({
      secret: paymentIntent.client_secret,
    })
  } catch (err) {
    res.status(500).json({ statusCode: 500, message: err.message })
  }
})

module.exports = stripeRouter
