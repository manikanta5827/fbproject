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
});

const schema2 = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  friends: {
    type: [String],
    default: [],
  },
});

const schema3=new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  requests: {
    type: [String],
    default: [],
  }
})

// Create the model only if it doesn't already exist
const User = mongoose.model('User', schema, 'User');
const FriendsList = mongoose.model('FriendsList', schema2, 'FriendsList');
const RequestsList = mongoose.model('RequestsList', schema3, 'RequestsList');
module.exports = { User, FriendsList,RequestsList }; // Export the User model
