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
  user: 'user',
  host: 'host',
  host_starter: 'host_starter',
  host_premium: 'host_premium',
  celeb: 'celeb',
  fan: 'fan',
}

export const createToken = async (user, secret, expiresIn) => {
  const tokenContents = {
    sub: `${user.id}`,
    name: user.email || user.phoneNumber,
    iat: Date.now() / 1000,
  }

  tokenContents[constants.claims] = {}
  tokenContents[constants.claims][constants.allowedRoles] = [
    roles.anonymous,
    roles.user,
    roles.host,
    roles.host_starter,
    roles.host_premium,
    roles.celeb,
    roles.fan,
  ]
  tokenContents[constants.claims][constants.userId] = `${user.id}`
  tokenContents[constants.claims][constants.defaultRole] = user.role

  return await jwt.sign(tokenContents, secret)
}
