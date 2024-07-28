// Passport
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;

// JWT
const jwt = require("jsonwebtoken");
const accessTokenSecret = "jwtsecret";

// Bcrypt for hash password
const bcrypt = require("bcrypt");
const salt = bcrypt.genSaltSync(10); // generate a salt

// Common Response
const { response } = require("./response");

const strategy = (local, getUserByUsername) => {
  passport.use(
    local,
    new LocalStrategy(
      {
        usernameField: "username",
        passwordField: "password",
      },
      (username, password, done) => {
        getUserByUsername(username).then((user) => {
          if (!user) {
            return done(null, false, { message: "The user doesn't exists." });
          }

          bcrypt.compare(password, user.password).then((result) => {
            if (!result) {
              return done(null, false, {
                message: "The password doesn't matched.",
              });
            } else {
              return done(null, user);
            }
          });
        });
      }
    )
  );
};

const session = (getUserById) => {
  passport.serializeUser((user, done) => done(null, user?.id));
  passport.deserializeUser((id, done) => {
    getUserById(id).then((user) => {
      return done(null, user);
    });
  });
};

const guest = (req, res, next) => {
  if (req.isAuthenticated()) {
      return res.redirect('/admin/dashboard');
  }

  next();
}


const auth = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }

  res.redirect("/admin/login");
};


const noCache = (req, res, next) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  next();
};


const role = (roleString) => (req, res, next) => {
  const { roles } = req.user;

  if (!roles?.length || !roles.includes(roleString)) {
    // return res.redirect("/admin/dashboard");
    return next();
  }
};

const restaurantAccess = (req, res, next) => {
  const {
    roles 
  } = req.user;

  const restaurantId = req.params.restaurantId || req.params.id;

  if (roles.some(role => role.name === 'admin')) {
    return next();
  }
  if (roles.some(role => role.name === 'restaurant') || roles.some(role => role.name === 'cashier')) {
    if (req.user.id !== parseInt(restaurantId)) {
      res.status(404).render("404", {
        layout: false,
        title: "Page Not Found",
      });
    }
  }
  next();
};

// For API
const generateAuthToken = ({ id, roles, name, lastName, email, mobile }) => {
  return jwt.sign(
    { id, roles, name, lastName, email, mobile },
    accessTokenSecret
  );
};

const authentication = (req, res, next) => {
  const header = req?.headers?.authorization;
  if (!header) {
    return response(res, req.body, "Missing authorization token.", 401);
  }
  const token = header.includes(" ") ? header.split(" ")[1] : header;
  // Check if the token is blacklisted
  if (blacklistedTokens.has(token)) {
    return response(res, req.body, "Expired authorization token.", 401);
  }

  jwt.verify(token, accessTokenSecret, (error, user) => {
    try {
      if (error) {
        if (error.name === "TokenExpiredError") {
          return response(res, req.body, "Expired authorization token.", 401);
        } else if (error.name === "JsonWebTokenError") {
          return response(res, req.body, "Invalid authorization token.", 403);
        } else {
          return response(res, req.body, "Unauthorized.", 403);
        }
      }

      req.user = user;
      next();
    } catch (error) {
      return response(res, req.body, error.message, 500);
    }
  });
};

const roleAuthorization = (roleString) => (req, res, next) => {
  const { roles } = req.user;

  if (!roles?.length || !roles.includes(roleString)) {
    return response(res, req.body, "Access forbidden.", 403);
  }

  next();
};

module.exports = {
  strategy,
  session,
  guest,
  auth,
  role,
  noCache,
  generateAuthToken,
  authentication,
  roleAuthorization,
  restaurantAccess
};
