const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcryptjs");

let userModel = require("./models/user.model");
let user;

function findUser(username, callback) {
  userModel.findOne({ username: username }, (err, doc) => {
    if (err) return callback(err);
    if (doc !== null) {
      return callback(null, doc.username);
    }
    return callback(null);
  });
}

function initialize(passport) {
  const authenticateUser = (username, password, done) => {
    userModel.findOne({ username: username }, (err, res) => {
      if (err) return done(err);
      if (res === null)
        return done(null, false, { message: "No user with that email" });
      if (bcrypt.compareSync(password, res.password)) {
        user = res;
        return done(null, user);
      } else {
        return done(null, false, { message: "Password incorrect" });
      }
    });
  };

  passport.use(new LocalStrategy(authenticateUser));

  passport.serializeUser((user, done) => {
    done(null, user.username);
  });

  passport.deserializeUser((username, done) => {
    return findUser(username, done);
  });
}

module.exports = initialize;
