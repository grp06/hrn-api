const xss = require('xss')
const Filter = require('bad-words')
import validator from 'validator'

const profanityFilter = new Filter()

const REGEX_UPPER_LOWER_SPECIAL = /(?=.*[a-z])(?=.*[A-Z])(?=.*[\+\=\/!@#\$%\^&*\?_-])[\S]+/

const UsersService = {
  validateEmail(email) {
    if (!validator.isEmail(email)) {
      return 'Email not valid'
    }
    return null
  },
  validatePassword(password) {
    if (password.length < 8) {
      return 'Password be longer than 8 characters'
    }
    if (password.length > 72) {
      return 'Password be less than 72 characters'
    }
    if (password.startsWith(' ') || password.endsWith(' ')) {
      return 'Password must not start or end with empty spaces'
    }
    if (!REGEX_UPPER_LOWER_SPECIAL.test(password)) {
      return 'Password must contain 1 upper case, lower case, and special character'
    }
    return null
  },

  validateName(name) {
    const filtered = profanityFilter.clean(name)

    if (name !== filtered) {
        return 'Please use a different name'
    }
    return null

  },

  serializeUser(user) {
    return {
      id: user.id,
      name: xss(user.name),
      email: xss(user.email),
      created_at: new Date(user.created_at),
      role: xss(user.role),
    }
  },
}

export default UsersService
