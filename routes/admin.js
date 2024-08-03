const express = require("express");
const group = require("express-group-routes");

// Router
var router = express.Router();

// Helpers
const { response } = require("../config/response");

// JWT Middleware - Auth
const { authentication, roleAuthorization } = require('../config/auth');

// Controllers 
const { register } = require('../controllers/admin/auth/registerController');
const { login, logout } = require('../controllers/admin/auth/loginController');

// Routes
router.get('/', (req, res) => {
    try {
        return response(res, req.body, 'Welcome API', 200);
    } catch (error) {
        return response(res, req.body, error.message, 500);
    }
});

router.group('/auth', (router) => {
    router.post("/register", register);
    router.post("/login", login);
    router.delete('/logout', [authentication], logout); 
});

module.exports = router;