const express = require('express')
import * as emailController from './email.controller'

const emailRouter = express.Router()
emailRouter.route('/send-calendar-invite').post(emailController.sendCalendarInvite)

emailRouter.route('/user/:email').post(emailController.sendPasswordResetEmail)



emailRouter.route('/receive_new_password/:userId/:token').post(emailController.receiveNewPassword)

module.exports = emailRouter