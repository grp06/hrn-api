import { GraphQLDateTime } from 'graphql-iso-date'

const customScalarResolver = {
  Date: GraphQLDateTime,
}

const resolvers = {
  Date: GraphQLDateTime
}


export default resolvers
