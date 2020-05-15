import { GraphQLDateTime } from 'graphql-iso-date'

const customScalarResolver = {
  Date: GraphQLDateTime,
}

const resolvers = [customScalarResolver]

export default resolvers
