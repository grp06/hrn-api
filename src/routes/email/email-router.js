import * as emailController from './email.controller'

const express = require('express')

const emailRouter = express.Router()

emailRouter.route('/send-calendar-invite').post(emailController.sendCalendarInvite)

emailRouter.route('/reset_password/user/:email').post(emailController.sendPasswordResetEmail)

emailRouter.route('/receive_new_password/:userId/:token').post(emailController.receiveNewPassword)

module.exports = emailRouter
