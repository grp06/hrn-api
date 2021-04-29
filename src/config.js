module.exports = {
  PORT: process.env.PORT || 8000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  HASURA_ENDPOINT:
    process.env.NODE_ENV === 'production'
      ? process.env.HASURA_ENDPOINT
      : 'http://localhost:5000/v1/graphql',
  emailTemplateID: {
    forgotPasswordEmail: '3',
    rsvpTemplate: '4'
  },
}
