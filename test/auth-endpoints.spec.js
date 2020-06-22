const jwt = require('jsonwebtoken')
const app = require('../src/app')
const helpers = require('./test-helpers')

describe.only('Auth Endpoints', () => {
  describe(`POST /api/auth/login`, () => {
    const requiredFields = ['user_name', 'password']

    requiredFields.forEach((field) => {
      const loginAttemptBody = {
        user_name: testUser.user_name,
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
