import * as Sentry from '@sentry/node'
import Stripe from 'stripe'
import orm from '../../services/orm'
import { updateStripeCustomerId } from '../../gql/mutations'

const express = require('express')

const stripeRouter = express.Router()
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

stripeRouter.post('/create-customer', async (req, res) => {
  const { email, name, userId } = req.body
  const customer = await stripe.customers.create({ email, name })
  try {
    await orm.request(updateStripeCustomerId, {
      user_id: userId,
      stripe_customer_id: customer.id,
    })

    // return res.status(200).send({
    //   success: Boolean(updateStripeCustomerId),
    // })
  } catch (error) {
    console.log('[stripe /create-customer error] -> ', error)
    Sentry.captureException(error)
    // return res.status(500).send(error)
  }
  // TODO: save the customer id as stripeCustomerId in our db
  return res.send({ customer })
})

stripeRouter.post('/create-subscription', async (req, res) => {
  const { customerId, paymentMethodId, plan } = req.body
  console.log('req.body ->', req.body)
  console.log('rpocess.env[planName] ->', process.env[plan])
  // set the default payment method on the customer
  try {
    await stripe.paymentMethods.attach(paymentMethodId, { customer: customerId })
  } catch (error) {
    console.log('[stripe /create-subscription error] ->', error)
    Sentry.captureException(error)
    return res.status(402).send({ error: { message: error.message } })
  }

  // this needs to be a part of this even though we dont use the result for anything
  // in the code. The default payment needs to be configured on the stripe API
  // for payments to process.
  let updateCustomerDefaultPaymentMethod = await stripe.customers.update(customerId, {
    invoice_settings: {
      default_payment_method: paymentMethodId,
    },
  })

  // Create the subscription
  const subscription = await stripe.subscriptions.create({
    customer: customerId,
    items: [{ price: process.env[plan] }],
    expand: ['latest_invoice.payment_intent'],
  })

  res.send(subscription)
})

stripeRouter.post('/retry-invoice', async (req, res) => {
  const { customerId, paymentMethodId, invoiceId } = req.body
  // reconfigure the default payment method on the user since the
  // last one presumably failed if we're retrying
  try {
    await stripe.paymentMethods.attach(paymentMethodId, {
      customer: customerId,
    })

    await stripe.customers.update(customerId, {
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
    })
  } catch (error) {
    console.log('[stripe /retry-invoice error] ->', error)
    Sentry.captureException(error)
    return res.status(402).send({ result: { error: { message: error.message } } })
  }

  const invoice = await stripe.invoices.retrieve(invoiceId, {
    expand: ['payment_intent'],
  })

  res.send(invoice)
})

module.exports = stripeRouter
