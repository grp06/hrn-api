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

export const createToken = async (user, secret, expiresIn) => {
  const tokenContents = {
    sub: `${user.id}`,
    name: user.email,
    iat: Date.now() / 1000,
  }

  tokenContents[constants.claims] = {}
  tokenContents[constants.claims][constants.allowedRoles] = [
    roles.anonymous,
    roles.free,
    roles.premium,
  ]
  tokenContents[constants.claims][constants.userId] = `${user.id}`
  tokenContents[constants.claims][constants.defaultRole] = user.role

  return jwt.sign(tokenContents, secret)
}
