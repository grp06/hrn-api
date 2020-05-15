import { makeExecutableSchema } from 'graphql-tools'
import gql from 'graphql-tag'
import typeDefs from './typeDefs'
import resolvers from '../resolvers'

const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
})

export default schema
