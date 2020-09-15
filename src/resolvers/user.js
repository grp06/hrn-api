import orm from '../services/orm'
import signUp from '../gql/mutations/users/signUp'
import getUsers from '../gql/queries/users/getUsers'
import findUserByEmail from '../gql/queries/users/findUserByEmail'
import getEventUsers from '../gql/queries/users/getEventUsers'
import getRoundsByEventId from '../gql/queries/users/getRoundsByEventId'
import findUserById from '../gql/queries/users/findUserById'
import updatePasswordByUserId from '../gql/mutations/users/updatePasswordByUserId'
import { createToken } from '../extensions/jwtHelper'

export default {
  Query: {
    users: async () => {
      try {
        let users
        const request = await orm.request(getUsers)
        users = request.data.users
        return users
      } catch (error) {
        console.log('error = ', error)
        throw error
      }
    },

    userByEmail: async (parent, { email }) => {
      try {
        let user
        const request = await orm.request(findUserByEmail, { email: email })
        user = request.data.users[0]
        return user
      } catch (error) {
        console.log('error = ', error)
        throw error
      }
    },

    getEventUsers: async (parent, { eventId }) => {
      try {
        let users
        const request = await orm.request(getEventUsers, { event_id: eventId })
        users = request.data.users[0]
        return users
      } catch (error) {
        console.log('error = ', error)
        throw error
      }
    },

    getRoundsByEventId: async (parent, { eventId }) => {
      try {
        let rounds
        const request = await orm.request(getRoundsByEventId, { event_id: eventId })
        rounds = request.data.rounds[0]
        return rounds
      } catch (error) {
        console.log('error = ', error)
        throw error
      }
    },
    userById: async (parent, { id }) => {
      try {
        let user
        const request = await orm.request(findUserById, { id: id })
        user = request.data.users[0]
        return user
      } catch (error) {
        console.log('error = ', error)
        throw error
      }
    },
  },

  Mutation: {
    insertUser: async (parent, { name, email, password, role }, { secret }) => {
      const userObject = { name, email, password, linkedIn_url, role }
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

    // bulkInsertRounds: async (parent, { name, email, password, role }, { secret }) => {
    //   let userObject = { name, email, password, role }
    //   const variables = { objects: [userObject] }

    //   let newUser
    //   const signUpResult = await orm.request(signUp, variables)

    //   newUser = signUpResult.data.insert_users.returning[0]

    //   return {
    //     token: await createToken(newUser, secret),
    //     role: newUser.role,
    //     id: newUser.id,
    //   }
    // },
    updatePasswordByUserId: async (parent, { id, newPassword }, { secret }) => {
      const userObject = { id, newPassword }

      let updatedUser
      const updatePasswordResult = await orm.request(updatePasswordByUserId, userObject)

      updatedUser = updatePasswordResult.data.update_users.returning[0]
      console.log('updatedUser: ', updatedUser)

      return {
        token: await createToken(updatedUser, secret),
        role: updatedUser.role,
        id: updatedUser.id,
      }
    },
  },
}
