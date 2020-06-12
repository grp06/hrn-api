import { GraphQLDateTime } from 'graphql-iso-date'
import user from './user'
import event from './event'

const customScalarResolver = {
  Date: GraphQLDateTime,
}

const resolvers = [customScalarResolver, user, event]

export default resolvers
