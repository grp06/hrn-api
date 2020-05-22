import { ApolloServer } from 'apollo-server-express'

import schema from './schema/'
import getCurrentUser from './extensions/currentUser'

export const startServer = async (app, port) => {
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
  startServer,
}
