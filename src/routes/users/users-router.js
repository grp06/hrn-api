const express = require('express')
import orm from '../../services/orm'
import findUserByEmail from '../../gql/queries/users/findUserByEmail'
import signUp from '../../gql/mutations/users/signUp'
import { hashPassword } from '../../services/auth-service'

const usersRouter = express.Router()
const jsonBodyParser = express.json()

usersRouter.post('/', jsonBodyParser, async (req, res) => {
  const { name, email, password, role } = req.body

  for (const field of ['name', 'email', 'password', 'role'])
    if (!req.body[field])
      return res.status(400).json({
        error: `Missing '${field}' in request body`,
      })



  //password and email validation



  //check if user with email exists
  let existingUser
  try {
    const checkEmailRequest = await orm.request(findUserByEmail, { email: email })
    existingUser = checkEmailRequest.data.users[0]

    if (existingUser) {
      return res.status(400).json({ error: 'Email already in use.' })
    }
  } catch {
    console.log('Error creating user')
  }

  //hash the password
  let hashedPassword
  try {
    hashedPassword = await hashPassword(password)
  } catch {
    console.log('error hashing password')
  }

  let userObject = { name, email, password: hashedPassword, role }

  const variables = { objects: [userObject] }
  let newUser

  try {
    const insertUserResult = await orm.request(signUp, variables)
    newUser = insertUserResult.data.insert_users.returning[0]
  } catch {
    res.status(500).send('womp')
  }

  return res.status(201).json(newUser)
})

module.exports = usersRouter
