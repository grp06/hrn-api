import * as Sentry from '@sentry/node'
import Stripe from 'stripe'

import { createToken } from '../../extensions/jwtHelper'
import { updateStripeCustomerId, updateUserRole, updateUserSubPeriod } from '../../gql/mutations'
import { stripeSubscriptionConfirmation } from '../../services/email-service'
import orm from '../../services/orm'

const express = require('express')

const stripeRouter = express.Router()
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

stripeRouter.post('/create-customer', async (req, res) => {
  const { email, first_name, last_name, userId } = req.body
  const customer = await stripe.customers.create({ email, name: `${first_name} ${last_name}` })
  try {
    await orm.request(updateStripeCustomerId, {
      user_id: userId,
      stripe_customer_id: customer.id,
    })
  } catch (error) {
    console.log('[stripe /create-customer error] -> ', error)
    Sentry.captureException(error)
    return res.status(500).send({ error })
  }
  return res.send({ customer })
})

stripeRouter.post('/create-customer-portal', async (req, res) => {
  const { customer_id, return_url } = req.body
  const session = await stripe.billingPortal.sessions.create({
    customer: customer_id,
    return_url,
  })

  return res.send({ url: session.url })
})

stripeRouter.post('/create-subscription', async (req, res) => {
  const { customerId, paymentMethodId, plan, userId, userEmail } = req.body

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
  const updateCustomerDefaultPaymentMethod = await stripe.customers.update(customerId, {
    invoice_settings: {
      default_payment_method: paymentMethodId,
    },
  })

  // Create the subscription
  let subscription
  try {
    subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: process.env[plan] }],
      expand: ['latest_invoice.payment_intent'],
    })
  } catch (error) {
    console.log('[stripe.subscriptions.create error] ->', error)
    Sentry.captureException(error)
    return res.status(402).send({ error: { message: error.message } })
  }

  const subPeriodEnd = new Date(subscription.current_period_end * 1000).toISOString()
  const priceOfPlan = subscription.items.data[0].price.unit_amount / 100
  console.log(subPeriodEnd)

  stripeSubscriptionConfirmation({ plan, priceOfPlan, subPeriodEnd, userEmail })

  // Update the user role and sub_period_end in our DB
  try {
    await orm.request(updateUserRole, {
      user_id: userId,
      role: 'premium',
      became_host_at: new Date().toISOString(),
    })

    await orm.request(updateUserSubPeriod, {
      stripe_customer_id: customerId,
      sub_period_end: subPeriodEnd,
    })
  } catch (error) {
    console.log('[stripe /create-subscription updateUserRole/updateUserSub  error] -> ', error)
    Sentry.captureException(error)
    return res.status(500).send({ error })
    // return res.status(500).send(error)
  }

  // create a new token and send both token and sub obj back
  const userObject = { email: userEmail, id: userId, role: 'premium' }
  try {
    const token = await createToken(userObject, process.env.SECRET)
    console.log(token)
    return res.status(201).send({ subscriptionObject: subscription, token })
  } catch (error) {
    console.log('[stripe /create-subscription createToken error] -> ', error)
    Sentry.captureException(error)
    return res.status(500).send({ error })
    // return res.status(500).send(error)
  }
})

stripeRouter.post('/retry-invoice', async (req, res) => {
  const { customerId, paymentMethodId, invoiceId, userId, userEmail } = req.body
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

  const subPeriodEnd = new Date(invoice.period_end * 1000).toISOString()
  console.log(subPeriodEnd)

  // Update the user role in our DB
  try {
    await orm.request(updateUserRole, {
      user_id: userId,
      role: 'premium',
      became_host_at: new Date().toISOString(),
    })

    await orm.request(updateUserSubPeriod, {
      stripe_customer_id: customerId,
      sub_period_end: subPeriodEnd,
    })
  } catch (error) {
    console.log('[stripe /retry-invoice updateUserRole/updateUserSub error] -> ', error)
    Sentry.captureException(error)
    return res.status(500).send({ error })
  }

  // create a new token and send both token and invoice obj back
  const userObject = { email: userEmail, id: userId, role: 'premium' }
  try {
    const token = await createToken(userObject, process.env.SECRET)
    console.log(token)
    return res.status(201).send({ invoice, token })
  } catch (error) {
    console.log('[stripe /retry-invoice createToken  error] -> ', error)
    Sentry.captureException(error)
    return res.status(500).send({ error })
    // return res.status(500).send(error)
  }
})

export default stripeRouter
