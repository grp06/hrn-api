module.exports = {
  PORT: process.env.PORT || 8000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  HASURA_ENDPOINT:
    process.env.NODE_ENV === 'production'
      ? process.env.HASURA_ENDPOINT
      : 'http://localhost:8080/v1/graphql',
}
