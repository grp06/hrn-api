const express = require('express')
import * as emailController from './email.controller'

const emailRouter = express.Router()

emailRouter.route('/').get((req, res) => {
  return res.send('woo hoo cool')
})
emailRouter.route('/user/:email').post(emailController.sendPasswordResetEmail)

emailRouter.route('/receive_new_password/:userId/:token').post(emailController.receiveNewPassword)

module.exports = emailRouter