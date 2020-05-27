import orm from '../services/orm'
import signUp from '../gql/mutations/users/signUp'
import getUsers from '../gql/queries/users/getUsers'
import findUserByEmail from '../gql/queries/users/findUserByEmail'
import findUserById from '../gql/queries/users/findUserById'
import { createToken } from '../extensions/jwtHelper'

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

    userByEmail: async (parent, { email }) => {
      try {
        let user
        const request = await orm.request(findUserByEmail, { email: email })
        user = request.data.users[0]
        return user
      } catch {
        console.log('user email query error')
      }
    },

    userById: async (parent, { id }) => {
      try {
        let user
        const request = await orm.request(findUserById, { id: id })
        user = request.data.users[0]
        return user
      } catch {
        console.log('user id query error')
      }
    },
  },

  Mutation: {
    insertUser: async (parent, { name, email, password, role }, { secret }) => {
      let userObject = { name, email, password, role }
      const variables = { objects: [userObject] }

      let newUser
      const signUpResult = await orm.request(signUp, variables)

      newUser = signUpResult.data.insert_users.returning[0]

      return {
        token: await createToken(newUser, secret),
        role: newUser.role,
        id: newUser.id,
      }
    },
  },
}
