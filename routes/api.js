const express = require("express");
const group = require("express-group-routes");

// Router
var router = express.Router();

// Helpers
const { response } = require("../config/response");

// Controllers 
const { register } = require('../controllers/api/auth/registerController');

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
});

module.exports = router;