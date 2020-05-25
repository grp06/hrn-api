import { GraphQLDateTime } from 'graphql-iso-date'
import user from './user'
import orm from '../services/orm'

import gql from 'graphql-tag'


const customScalarResolver = {
  Date: GraphQLDateTime,
}

const resolvers = [
  customScalarResolver,
  user
]



export default resolvers
