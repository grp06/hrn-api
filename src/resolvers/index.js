import { GraphQLDateTime } from 'graphql-iso-date'
import user from './user'

const customScalarResolver = {
  Date: GraphQLDateTime,
}

const resolvers = [customScalarResolver, user]

export default resolvers
