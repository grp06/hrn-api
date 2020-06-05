import orm from '../../services/orm'
import findUserByEmail from '../../gql/queries/users/findUserByEmail'
import signUp from '../../gql/mutations/users/signUp'
import { hashPassword } from '../../services/auth-service'
import { createToken } from '../../extensions/jwtHelper'

const express = require('express')

const usersRouter = express.Router()
const jsonBodyParser = express.json()

usersRouter.post('/', jsonBodyParser, async (req, res) => {
  const { name, email, password, role } = req.body

  for (const field of ['name', 'email', 'password', 'role'])
    if (!req.body[field]) {
      return res.status(400).json({
        error: `Missing '${field}' in request body`,
      })
    }

  // password and email validation

  // check if user with email exists
  let existingUser
  try {
    const checkEmailRequest = await orm.request(findUserByEmail, { email: email })
    existingUser = checkEmailRequest.data.users[0]

    if (existingUser) {
      return res.status(400).json({ error: 'Email already in use.' })
    }
  } catch (e) {
    return res.status(500).json({
      error: 'error creating user',
    })
  }

  let hashedPassword
  try {
    hashedPassword = await hashPassword(password)
  } catch (e) {
    return res.status(500).json({
      error: 'error hashing password',
    })
  }

  const userObject = { name, email, password: hashedPassword, role }

  const variables = { objects: [userObject] }
  let newUser

  try {
    const insertUserResult = await orm.request(signUp, variables)
    newUser = insertUserResult.data.insert_users.returning[0]
  } catch (e) {
    return res.status(500).json({
      error: 'error inserting user',
    })
  }

  return res.status(201).send({
    token: await createToken(newUser, process.env.SECRET),
    role: newUser.role,
    id: newUser.id,
  })
})

usersRouter.post('/reset-password', async (req, res) => {
  const { email } = req.body

  if (!email) {
    return res.status(400).json({
      error: `Missing 'email' in request body`,
    })
  }

  let existingUser
  try {
    const checkEmailRequest = await orm.request(findUserByEmail, { email: email })
    existingUser = checkEmailRequest.data.users[0]

    if (!existingUser) {
      return res.status(400).json({ error: 'Could not find user with that email' })
    }
  } catch (e) {
    return res.status(500).json({
      error: 'error creating user',
    })
  }
})

module.exports = usersRouter
