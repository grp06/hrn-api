import { GraphQLDateTime } from 'graphql-iso-date'
import user from './user'
import orm from '../services/orm'

import gql from 'graphql-tag'
// const createUser = gql`
//   mutation create_user($id: Int!, $name: String!, $email: String!) {
//     insert_users(objects: { id: $id, name: $name, email: $email, role: "user" }) {
//       returning {
//         id
//         name
//         email
//       }
//     }
//   }
// `

const customScalarResolver = {
  Date: GraphQLDateTime,
}

const resolvers = [
  customScalarResolver,
  user
]




// const resolvers = {
//   Mutation: {
//     // 2


//     insertUser: (parent, args) => {
//       console.log('in mutation');
//       const userObject = {
//         id: `user-${idCount++}`,
//         name: args.name,
//         email: args.email
//       }

//       users.push(userObject)

//       return {userObject}
//     }
//   },
// }


export default resolvers
