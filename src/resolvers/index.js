import { GraphQLDateTime } from 'graphql-iso-date'

const customScalarResolver = {
  Date: GraphQLDateTime,
}

const resolvers = {
  Date: GraphQLDateTime,
  Query: {
    numberSix: () => {
      return 6
    }
  }
  
}


export default resolvers
