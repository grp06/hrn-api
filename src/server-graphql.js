import { ApolloServer } from 'apollo-server-express'

import getCurrentUser from './extensions/currentUser'
import schema from './schema'

/**
 * Start an Apollo Server on top of an Express app
 * @param app
 * @param port
 * @returns {Promise<*>}
 */
export const startApolloServer = async (app, port) => {
  const server = new ApolloServer({
    schema,
    context: async ({ req }) => {
      const currentUser = await getCurrentUser(req.headers)
      return {
        currentUser,
        secret: process.env.SECRET,
        ip: req.connection.remoteAddress,
        req,
      }
    },
  })

  server.applyMiddleware({ app, path: '/graphql' })

  return app.listen({ port }, () => {
    console.log('Apollo server running on /graphql')
  })
}

export default {
  startApolloServer,
}
