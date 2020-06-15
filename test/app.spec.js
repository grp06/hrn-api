const app = require('../src/app')

describe('App', () => {
  it('GET / responds with 200 containing "Looks like the HiRightNow API is working!"', () => {
    return supertest(app).get('/').expect(200, 'Looks like the HiRightNow API is working!')
  })
})
