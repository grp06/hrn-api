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

        it(`responds 400 'Password be longer than 8 characters' when short password`, () => {
          const userShortPassword = {
            name: 'test user_name',
            password: '1234567',
            role: 'user',
            email: 'test@test.com',
          }
          return supertest(app)
            .post('/api/signup')
            .send(userShortPassword)
            .expect(400, { error: `Password be longer than 8 characters` })
        })

        it(`responds 400 'Password be less than 72 characters' when long password`, () => {
          const userLongPassword = {
            password: '*'.repeat(73),
            name: 'test user_name',
            role: 'user',
            email: 'test@test.com',
          }
          return supertest(app)
            .post('/api/signup')
            .send(userLongPassword)
            .expect(400, { error: `Password be less than 72 characters` })
        })

        it(`responds 400 error when password starts with spaces`, () => {
          const userPasswordStartsSpaces = {
            name: 'test user_name',
            password: ' 1Aa!2Bb@',
            role: 'user',
            email: 'test@test.com',
          }
          return supertest(app).post('/api/signup').send(userPasswordStartsSpaces).expect(400, {
            error: `Password must not start or end with empty spaces`,
          })
        })

        it(`responds 400 error when password ends with spaces`, () => {
          const userPasswordEndsSpaces = {
            name: 'test user_name',
            password: '1Aa!2Bb@ ',
            role: 'user',
            email: 'test@test.com',
          }
          return supertest(app).post('/api/signup').send(userPasswordEndsSpaces).expect(400, {
            error: `Password must not start or end with empty spaces`,
          })
        })

        it(`responds 400 error when password isn't complex enough`, () => {
          const userPasswordNotComplex = {
            name: "test user_name",
            password: "11AAaabb",
            role: 'user',
            email: 'test@test.com'
          };
          return supertest(app)
            .post("/api/signup")
            .send(userPasswordNotComplex)
            .expect(400, {
              error: `Password must contain 1 upper case, lower case, and special character`
            });
        });

        it(`responds 400 'Email already in use' when email is not unique`, () => {
          const duplicateEmail = {
            name: 'sadsadsadsad',
            email: 'kevinrobinsondeveloper@gmail.com',
            password: '11AAaa!!',
            role: 'user',
          }

          return supertest(app)
            .post('/api/signup')
            .send(duplicateEmail)
            .expect(400, { message: 'Email already in use' })
        })
      })
    })

    context(`Happy path`, () => {
      it.skip(`responds 201, returning a jwt, storing bcrypted password`, () => {
        const newUser = {
          name: 'sadsadsadsad',
          email: 'tasdsdaestasdasdsadasdsad@test.com',
          password: '11AAaa!!',
          role: 'user',
        }

        return supertest(app)
          .post('/api/signup')
          .send(newUser)
          .expect(201)
          .expect((res) => {
            expect(res.body).to.have.property('id')
            expect(res.body).to.have.property('role')
            expect(res.body).to.have.property('token')
            expect(res.body).to.have.property('name')
            expect(res.body).to.have.property('created_at')
            expect(res.body).to.not.have.property('password')
          })

        // check if in db
      })
    })
  })
})
