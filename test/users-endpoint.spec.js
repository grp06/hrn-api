import app from '../src/app'
import supertest from 'supertest'
import { expect } from 'chai'

// use knex format to insert mock data in PG db directly... then GQL queries are through the docker Hasura?

describe('Users Endpoints', function () {
  describe(`POST /api/signup`, () => {
    context(`User Validation`, () => {
      const requiredFields = ['name', 'email', 'password', 'role']

      requiredFields.forEach((field) => {
        const registerAttemptBody = {
          name: 'test thing',
          email: 'testemail@test.com',
          password: 'test password',
          role: 'user',
        }

        it(`responds with 400 required error when '${field}' is missing`, () => {
          delete registerAttemptBody[field]

          return supertest(app)
            .post('/api/signup')
            .send(registerAttemptBody)
            .expect(400, {
              error: `Missing '${field}' in request body`,
            })
        })

        it(`responds 400 'Email already in use' when email is not unique`, () => {
            const duplicateEmail = {
                name: 'sadsadsadsad',
                email: "kevinrobinsondeveloper@gmail.com",
                password: "11AAaa!!",
                role: "user",

              };

              return supertest(app)
                .post('/api/signup')
                .send(duplicateEmail)
                .expect(400, {message: 'Email already in use'})
        })
      })
    })

    context(`Happy path`, () => {
        it(`responds 201, returning a jwt, storing bcrypted password`, () => {
            const newUser = {
                name: 'sadsadsadsad',
                email: "tasdsdaestasdsad@test.com",
                password: "11AAaa!!",
                role: "user",
              };

              return supertest(app)
              .post('/api/signup')
              .send(newUser)
              .expect(201)
              .expect(res => {
                  expect(res.body).to.have.property("id")
                  expect(res.body).to.have.property("role")
                  expect(res.body).to.have.property("token")
                  expect(res.body).to.not.have.property("password")
              })

              // check if in db
        })
    })
  })
})
