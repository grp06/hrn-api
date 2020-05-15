import { AuthenticationError } from 'apollo-server-express'

const currentUser = async (headers) => {
  const authHeader = headers['Authorization'] || headers['authorization']
  let token
  if (authHeader != null && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7, authHeader.length)
  } else {
    new AuthenticationError('Invalid token.')
  }

  if (token) {
    try {
      const decodedJWT = await jwt.verify(token, process.env.SECRET)
      if (decodedJWT.role === 'anonymous') {
        return null
      } else {
        return decodedJWT
      }
    } catch (e) {
      new AuthenticationError('Your session expired.  Sign in again.')
    }
  }
}

export default currentUser
