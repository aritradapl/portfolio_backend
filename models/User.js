const mongoose = require('mongoose');

// Define the schema with timestamps option
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  mobile: {
    type: String
  },
  password: {
    type: String,
    required: true
  },
  authToken: {
    type: String
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'deleted'],
    default: 'active'
  },
  deletedAt: {
    type: Date
  }
}, {
  timestamps: true, // This will automatically add createdAt and updatedAt fields
  paranoid: true
});

// Create the model
const User = mongoose.model('User', userSchema);

module.exports = User;
