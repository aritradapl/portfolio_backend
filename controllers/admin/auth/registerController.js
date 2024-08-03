// Validator
const { Validator } = require("node-input-validator");

// Bcrypt
const bcrypt = require("bcrypt");
const salt = bcrypt.genSaltSync(10); // generate a salt

// Helpers
const { response } = require("../../../config/response");

// JWT Middleware - Auth
const { generateAuthToken } = require('../../../config/auth');

// Models
const { User } = require("../../../models/User");

const register = async (req, res) => {
    try {
        // Validate the input
        const validator = new Validator(req.body, {
            name: "required|minLength:3|maxLength:255",
            email: "required|email",
            mobile: "required",
            password: "required|minLength:8",
            cpassword: "required|same:password"
        });
        const matched = await validator.check();
        if (!matched) {
            return response(res, req.body, validator.errors, 422);
        }

        const { 
            name, 
            email, 
            mobile,
            password,
        } = req.body;
        const errors = {};

        // Check if email already exists
        const emailExists = await User.findOne({ email });
        if (emailExists) {
            errors['email'] = {
                'rule' : 'unique',
                'message' : 'Email already exists'
            }
        }

        // Check if mobile already exists
        const mobileExists = await User.findOne({ mobile });
        if (mobileExists) {
            errors['mobile'] = {
                'rule' : 'unique',
                'message' : 'Mobile already exists'
            }
        }
        
        // If there are any errors, return them
        if (Object.keys(errors).length > 0) {
            return response(res, req.body, errors, 422);
        }

        // Hash the password
        const hashedPassword = bcrypt.hashSync(password, salt);

        // Create new user
        const user = new User();
        user.name = name;
        user.email = email;
        user.mobile = mobile;
        user.password = hashedPassword;
        user.authToken = generateAuthToken({ user : user });
        user.userType = 'admin';
        user.save();

        return response(res, user, "User registered successfully", 200);
    } catch (error) {
        return response(res, {}, error.message, 500);
    }
};

module.exports = { 
    register 
};
