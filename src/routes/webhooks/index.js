import * as Sentry from '@sentry/node'
import express from 'express'

import { updateUserRole, updateUserSubPeriod } from '../../gql/mutations'
import { findUserByStripeCustomerId } from '../../gql/queries'
import orm from '../../services/orm'

const webhooks = express.Router()
const jsonBodyParser = express.json()

const getPlanNameFromId = (id) => {
  if (id === process.env.PREMIUM_MONTHLY || id === process.env.PREMIUM_MONTHLY) return 'premium'
  return 'no_plan'
}

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

// types include:
// customer.subscription.deleted, customer.subscription.updated, invoice.payment_succeeded

webhooks.post('/stripe-customer-portal', jsonBodyParser, async (req, res) => {
  console.log('req.body ->', req.body)
  // for customer subscription we want to check the plan from the sub, get the id or product
  // from the plan object, and compare them to the ids of the product to make sure we are still
  // giving them correct host access
  if (req.body.type === 'customer.subscription.updated') {
    console.log('req.body ->', console.log(req.body))
    const subscription = req.body.data.object
    const { customer, status, current_period_end, plan } = subscription
    const { id: planId } = plan
    const planName = getPlanNameFromId(planId)
    const current_period_end_ISOString = new Date(current_period_end * 1000).toISOString()

    // update the userSubPeriod because the transaction was successful, meaning
    // they have another month or year with this role
    if (status === 'active') {
      try {
        const databaseUserInfo = await orm.request(findUserByStripeCustomerId, {
          stripe_customer_id: customer,
        })

        const databaseUser = databaseUserInfo.data.users[0]
        const { id: user_id, role, sub_period_end, name } = databaseUser

        await orm.request(updateUserSubPeriod, {
          stripe_customer_id: customer,
          sub_period_end: current_period_end_ISOString,
        })

        // if the role isnt the same as the planName then that means they changed their
        // plan, so lets update their role in the db
        if (role !== planName && planName !== 'no_plan') {
          await orm.request(updateUserRole, {
            user_id,
            role: planName,
            became_host_at: new Date().toISOString(),
          })
        }
      } catch (error) {
        console.log(
          '[webhooks /stripe-customer-portal customer.subscription.updated findUserByStripeCustomerId || updateUserRole || UpdateUserSubPeriod error] -> ',
          error
        )
        Sentry.captureException(error)
        return res.status(500).send({ error })
      }
    }
  }
  return res.status(200).send({ message: 'success' })
})

export default webhooks
