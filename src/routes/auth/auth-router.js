import * as Sentry from '@sentry/node'
import jwt from 'jsonwebtoken'

import { createToken } from '../../extensions/jwtHelper'
import { findUserByEmail, findUserById, findUserByIssuer } from '../../gql/queries'
import { insertUser } from '../../gql/mutations'
import { comparePasswords } from '../../services/auth-service'
import { setTokenCookie } from '../../services/cookies'
import { magic } from '../../services/magicAdmin'
import orm from '../../services/orm'

const express = require('express')

const authRouter = express.Router()

authRouter.post('/google-login', async (req, res) => {
  // when this route gets hit, someone is coming in with google info from oAuth
  try {
    const {
      firstName: first_name,
      lastName: last_name,
      profPicUrl: profile_pic_url,
      didToken,
    } = req.body.input
    console.log('🚀 ~ authRouter.post ~ req.body.input', req.body.input)
    // Validate Magic's DID token
    await magic.token.validate(didToken)

    const metadata = await magic.users.getMetadataByToken(didToken)

    const { email, issuer, publicAddress } = metadata

    const userObj = {
      email,
      issuer,
      publicAddress,
    }
    console.log('USER DATA PULLED OFF OAUTH INFO', userObj)

    // given this incoming token from some random google user
    // lets check to see if they're a user in our DB
    const token = await createToken(userObj, process.env.SECRET)

    const findUserRes = await orm.request(
      findUserByIssuer,
      {
        issuer,
      },
      token
    )

    const user = findUserRes.data.users[0]

    // If they're not a user create a new user
    if (!user) {
      const insertUserRes = await orm.request(
        insertUser,
        {
          objects: {
            email,
            first_name,
            last_name,
            profile_pic_url,
            issuer,
            publicAddress,
          },
        },
        token
      )
      console.log('🚀 ~ authRouter.post ~ insertUserRes', insertUserRes)

      const createdUser = insertUserRes.data.insert_users.returning[0]

      const {
        id,
        issuer: newIssuer,
        publicAddress: newPublicAddress,
        email: newEmail,
      } = createdUser

      console.log('🚀 JUST CREATED A USER createdUser', createdUser)

      const newUserObj = {
        issuer: newIssuer,
        publicAddress: newPublicAddress,
        email: newEmail,
        uid: id,
      }

      const newToken = await createToken(newUserObj, process.env.SECRET)

      if (insertUserRes.errors) {
        throw new Error(insertUserRes.errors[0].message)
      }

      setTokenCookie(res, newToken)
      return res.status(200).send({ token: newToken, userId: id, issuer: newIssuer })
    }
    // if we got here, the user clicked the google button but they already have an account
    setTokenCookie(res, token)
    res.status(200).send({ token })
  } catch (error) {
    console.log(error)
    res.status(500).end()
  }
})

authRouter.post('/login', async (req, res) => {
  const { email, password } = req.body.input.input

  const loginUser = { email, password }

  let dbUser

  // is the await functionality correct here?
  try {
    // check if user with email exists
    const checkEmailRequest = await orm.request(findUserByEmail, { email: email })
    dbUser = checkEmailRequest.data.users[0]
    console.log('🚀 ~ authRouter.post ~ dbUser', dbUser)

    if (!dbUser) {
      return res.status(400).json({ message: 'Incorrect email or password' })
    }

    // compare passwords with hashing
    const passwordCheck = await comparePasswords(loginUser.password, dbUser.password)

    if (!passwordCheck) {
      return res.status(400).json({
        message: 'Incorrect user_name or password',
      })
    }
  } catch (error) {
    console.log('Error logging in', error)
    Sentry.captureException(error)
    return res.status(500).json({
      message: 'There was an error logging in',
    })
  }
  delete dbUser.password
  console.log(dbUser)

  return res.json({
    token: await createToken(dbUser, process.env.SECRET),
    userId: dbUser.id,
  })
})

authRouter.post('/get-anonymous-token', async (req, res) => {
  try {
    return res.json({
      token: await createToken({ id: null, role: 'anonymous' }, process.env.SECRET),
    })
  } catch (error) {
    console.log('🚀 ~ authRouter.post ~ error', error)
    Sentry.captureException(error)
    return res.status(400).json({
      message: error,
    })
  }
})

authRouter.post('/fetch-user-by-token', async (req, res) => {
  // const issuer = req.body.session_variables['x-hasura-user-id']
  const { token } = req.cookies
  const tokenUser = jwt.verify(token, process.env.SECRET)

  const issuer = tokenUser['https://hasura.io/jwt/claims']['X-Hasura-User-Id']
  console.log('ISSUER PULLED OFF HASURA CLAIMS === ', issuer)
  try {
    const findUserByIssuerReq = await orm.request(findUserByIssuer, {
      issuer,
    })
    console.log('🚀 ~ authRouter.post ~ findUserByIssuerReq', findUserByIssuerReq)
    const user = findUserByIssuerReq.data.users[0]
    console.log('🚀 ~ authRouter.post ~ user', user)
    if (findUserByIssuerReq.errors) {
      Sentry.captureException(findUserByIssuerReq.errors[0].message)
      // TODO: find another way to throw the error, because we're inside of a try/catch
      throw new Error(findUserByIssuerReq.errors[0].message)
    }
    const token = await createToken(user, process.env.SECRET)
    return res.json({
      token,
      issuer,
      userId: user.id,
    })
  } catch (error) {
    console.log('🚀 ~ authRouter.post ~ error', error)
    return res.status(400).json({
      message: "couldn't find user",
    })
  }
  // res.status(200).json({ token: '' })
})

authRouter.get('/user', async (req, res) => {
  const { token } = req.cookies

  try {
    // because we set a cookie to an encoded empty object, we need to check for this.
    // can probably fix by just not setting that cookie
    if (!token || token === '{}') {
      console.log('no token')
      return res.status(200).json({ token: '' })
    }
    const user = jwt.verify(token, process.env.SECRET)
    console.log('USER PULLED OFF OF JWT.VERIFY', user)
    const { publicAddress, email, uid } = user
    const issuer = user['https://hasura.io/jwt/claims']['X-Hasura-User-Id']
    console.log('ISSUER PULLED OFF HASURA CLAIMS === ', issuer)

    const userObj = {
      email,
      issuer,
      publicAddress,
      uid,
    }
    const newToken = await createToken(userObj, process.env.SECRET)

    user.token = newToken // send JWT in response to the client, necessary for API requests to Hasrua
    setTokenCookie(res, newToken)
    // only returning the token here because I can't seem to grab it from the frontend and do something with it
    return res.status(200).send({ token: newToken, userId: uid, issuer })
  } catch (error) {
    res.status(200).json({ token: '' })
  }
})

export default authRouter
