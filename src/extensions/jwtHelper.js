import jwt from 'jsonwebtoken'

export const constants = {
  claims: 'https://hasura.io/jwt/claims',
  adminSecret: 'X-Hasura-Admin-Secret',
  allowedRoles: 'X-Hasura-Allowed-Roles',
  defaultRole: 'X-Hasura-Default-Role',
  userId: 'X-Hasura-User-Id',
}

const roles = {
  anonymous: 'anonymous',
  free: 'free',
  premium: 'premium',
}

export const createToken = async (user, secret) => {
  const { issuer, publicAddress, email, uid } = user
  console.log('🚀 ~ createToken ~ user', user)

  const tokenContents = {
    publicAddress,
    uid,
    email,
    iat: Date.now() / 1000 - 10,
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * process.env.SESSION_LENGTH_IN_DAYS,
  }

  tokenContents[constants.claims] = {}
  tokenContents[constants.claims][constants.allowedRoles] = [
    roles.anonymous,
    roles.free,
    roles.premium,
  ]
  tokenContents[constants.claims][constants.userId] = `${issuer}`
  tokenContents[constants.claims][constants.defaultRole] = 'free'

  return jwt.sign(tokenContents, secret)
}
