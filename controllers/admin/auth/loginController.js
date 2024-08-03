// Validator
const { Validator } = require('node-input-validator');

// Bcrypt for hash password
const bcrypt = require('bcrypt');

// Common Response
const { response } = require('../../../config/response');

// JWT Middleware - Auth
const { generateAuthToken } = require('../../../config/auth');

// Model
const { User } = require('../../../models/User');

const login = async (req, res) => {
    try {
        const validator = new Validator(req.body, {
            email: 'required',
            password: 'required'
        });
        const matched = await validator.check();
        if (!matched) {
            return response(res, validator.errors, 'validation', 422);
        }

        let errors = {};
        const {
            email,
            password
        } = req.body;

        const user = await User.findOne({
            email: email.toLowerCase() 
        });

        console.log('email====================>',email);
        console.log('user====================>',user);
        

        if (!user || !(await bcrypt.compare(password, user.password))) {
            errors['email'] = {
                message: 'Invalid credentials.',
                rule: 'same'
            };
        }

        if (Object.keys(errors).length) {
            return response(res, errors, 'validation', 422);
        }

        user.authToken = generateAuthToken({ user : user }); 
        await user.save();

        return response(res, { user, ...req.user }, 'User login successfull.', 200);
    } catch (error) {
        return response(res, req.body, error.message, 500);
    }
}

const logout = async (req, res) => {
    try {
        const { 
            id 
        } = req.user;
        
        const user = await User.findOne({
            where: {
                id: id 
            }
        });
        if (!user) {
            return response(res, req.body, 'User not found.', 404);
        }

        // Add the token to the blacklist
        blacklistedTokens.add(user.authToken);

        user.authToken = null;
        await user.save();

        return response(res, user, 'User logout successfull.', 200);
    } catch (error) {
        return response(res, req.body, error.message, 500);
    }
}

module.exports = {
    login,
    logout
};