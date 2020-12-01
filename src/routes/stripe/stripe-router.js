import * as Sentry from '@sentry/node'
import Stripe from 'stripe'
import orm from '../../services/orm'
import { updateStripeCustomerId, updateUserRole, updateUserSubPeriod } from '../../gql/mutations'
import { createToken } from '../../extensions/jwtHelper'

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
    return res.status(500).send({ error })
    // return res.status(500).send(error)
  }
  // TODO: save the customer id as stripeCustomerId in our db
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
  const planTypeName = plan.split('_')[0].toLowerCase()

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

  const subPeriodEnd = new Date(subscription.current_period_end * 1000).toISOString()
  console.log(subPeriodEnd)

  // Update the user role and sub_period_end in our DB
  try {
    await orm.request(updateUserRole, {
      user_id: userId,
      role: `host_${planTypeName}`,
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
  const userObject = { email: userEmail, id: userId, role: `host_${planTypeName}` }
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
  const { customerId, paymentMethodId, invoiceId, plan, userId, userEmail } = req.body
  const planTypeName = plan.split('_')[0].toLowerCase()
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
      role: `host_${planTypeName}`,
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
  const userObject = { email: userEmail, id: userId, role: `host_${planTypeName}` }
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

module.exports = stripeRouter
