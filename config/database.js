// database.js
const mongoose = require('mongoose');

// Replace with your MongoDB connection string
const dbURI = process.env.DB_CONNECTION_URL || '';

// Function to connect to the database
const connectDB = async () => {
  try {
    await mongoose.connect(dbURI);
    console.log('MongoDB connected...');
  } catch (err) {
    console.error('Failed to connect to MongoDB', err);
    process.exit(1); // Exit process with failure
  }
};

// Export the connectDB function
module.exports = connectDB;
