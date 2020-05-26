const express = require('express')
import orm from '../../services/orm'
import findUserByEmail from '../../gql/queries/users/findUserByEmail'
import signUp from '../../gql/mutations/users/signUp'

const usersRouter = express.Router()
const jsonBodyParser = express.json()

usersRouter.post('/', jsonBodyParser, async (req, res) => {
  const { name, email, password, role } = req.body

  for (const field of ['name', 'email', 'password', 'role'])
    if (!req.body[field])
      return res.status(400).json({
        error: `Missing '${field}' in request body`,
      })

  let userObject = { name, email, password, role }

  //password and email validation

  //check if user with email exists
  let user
  const checkEmailRequest = await orm.request(findUserByEmail, { email: email })
  user = checkEmailRequest.data.users[0]

  if (user) {
    return res.status(400).json({ error: 'Email already in use.' })
  }

  //hash the password

  const variables = { objects: [userObject] }
  let newUser

  try {
    const insertUserResult = await orm.request(signUp, variables)
    newUser = insertUserResult.data.insert_users.returning[0]

    console.log(newUser)
  } catch {
    res.status(500).send('womp')
  }

  return res.status(201).json(newUser)
})

module.exports = usersRouter
