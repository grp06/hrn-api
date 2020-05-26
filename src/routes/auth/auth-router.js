const express = require('express')
const AuthService = require('../../services/auth-service')
import orm from '../../services/orm'
import findUserByEmail from '../../gql/queries/users/findUserByEmail'
import { createToken } from '../../extensions/jwtHelper'

const authRouter = express.Router()
const jsonBodyParser = express.json()

authRouter.post('/login', jsonBodyParser, async (req, res, next) => {
  const { email, password } = req.body
  const loginUser = { email, password }

  //make sure all keys are in request body
  for (const [key, value] of Object.entries(loginUser))
    if (value == null)
      return res.status(400).json({
        error: `Missing '${key}' in request body`,
      })

  let dbUser

  try {
    //check if user with email exists
    const checkEmailRequest = await orm.request(findUserByEmail, { email: email })

    dbUser = checkEmailRequest.data.users[0]

    if (!dbUser) {
      return res.status(400).json({ error: 'Incorrect email or password' })
    }

    //compare passwords
    if (loginUser.password !== dbUser.password) {
      return res.status(400).json({ error: 'bad password' })
    }

    //compare passwords with hashing
    // const passwordCheck = await AuthService.comparePasswords(loginUser.password, dbUser.password)

    // if (!passwordCheck) {
    //   return res.status(400).json({
    //     error: 'Incorrect user_name or password',
    //   })
    // }
  } catch {
    console.log('Error logging in')
  }

  return res.send({
    token: await createToken(dbUser, process.env.SECRET),
    role: dbUser.role,
    id: dbUser.id,
  })
})

module.exports = authRouter
