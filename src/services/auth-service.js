const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const AuthService = {
  getUserWithUserName(db, user_name) {
    return db("users")
      .where({ user_name })
      .first();
  },
  hashPassword(password) {
    return bcrypt.hash(password, 12)
  },
  comparePasswords(password, hash) {
    return bcrypt.compare(password, hash);
  },
  parseBasicToken(token) {
    return Buffer.from(token, "base64")
      .toString()
      .split(":");
  },
  createJwt(subject, payload) {
    return jwt.sign(payload, process.env.SECRET, {

      subject,
      algorithm: "HS256"
    });
  },
  verifyJwt(token) {
    return jwt.verify(token, process.env.SECRET, {
      algorithms: ["HS256"]
    });
  }
};

module.exports = AuthService;
