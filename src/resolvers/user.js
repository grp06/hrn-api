import jwt from 'jsonwebtoken'
import orm from '../services/orm'
import signUp from '../gql/mutations/users/signUp'
import getUsers from '../gql/queries/users/getUsers'

let users = [
  {
    id: 'user-0',
    name: 'www.howtographql.com',
    email: 'great email.com',
  },
]

let idCount = users.length

export default {
  Query: {
    users: async () => {
      try {
        let users
        const request = await orm.request(getUsers)
        users = request.data.users
        return users
      } catch {
        console.log('user query error')
      }
    },
  },

  Mutation: {
    insertUser: async (parent, { name, email, password, role }) => {
      console.log('in insertUser')

      let userObject = { name, email, password, role }
      const variables = { objects: [userObject] }

      let newUser
      const signUpResult = await orm.request(signUp, variables)

      newUser = signUpResult.data.insert_users.returning[0]

      //after checking if user exists in db
      //   newUser = userObject
      //   users.push(newUser)

      //   console.log(users)

      return {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      }
      // return {
      //   token: await createToken(newUser, secret),
      //     role: newUser.role,
      //     id: newUser.id,
      // }
    },
  },
}
