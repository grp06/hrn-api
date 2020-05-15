const formatError = (error) => {
  // remove the internal sequelize error message
  // leave only the important validation error
  const message = error.message
    .replace('SequelizeValidationError: ', '')
    .replace('Validation error: ', '')
  return {
    ...error,
    message,
  }
}

export default formatError
