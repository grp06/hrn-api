const jwt = require('jsonwebtoken')
const app = require('../src/app')
const helpers = require('./test-helpers')

describe('Auth Endpoints', () => {
  describe(`POST /api/auth/login`, () => {
    const requiredFields = ['email', 'password']

    const testUser = {
      email: "joe@joe.com",
      password: "joe"
    }
    requiredFields.forEach((field) => {
      const loginAttemptBody = {
        email: testUser.email,
        password: testUser.password,
      }

      it(`responds with 400 required error when '${field}' is missing`, () => {
        delete loginAttemptBody[field]

        return supertest(app)
          .post('/api/auth/login')
          .send(loginAttemptBody)
          .expect(400, {
            error: `Missing '${field}' in request body`,
          })
      })
    })


  })
})
