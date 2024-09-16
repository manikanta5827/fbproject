const mongoose = require('mongoose'); // Use CommonJS require

const schema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  friends:{
    type: [String],
    default: [],
  }
});

// Create the model only if it doesn't already exist
const User = mongoose.model('User', schema, 'User');

module.exports = { User }; // Export the User model
