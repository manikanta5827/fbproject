// utils.js

const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { FriendsList } = require('./DB/schema');
require('dotenv').config();
// Generate JWT
const generateToken = (userId) =>
  jwt.sign({ userId }, process.env.SECRET_KEY, { expiresIn: '24h' });

// Hash password
const hashPassword = async (password, saltRounds = 10) =>
  bcrypt.hash(password, saltRounds);

// Compare password
const comparePassword = async (password, hashedPassword) =>
  bcrypt.compare(password, hashedPassword);

// Error handler
const handleError = (res, error, statusCode = 502) =>
  res.status(statusCode).send({ error: error.message || 'Server Error' });

// Success response
const sendResponse = (res, message, data = {}) =>
  res.status(200).send({ message, ...data });

// Get friends list by name
const getFriendsList = async (name) =>
  FriendsList.findOne({ name }, { _id: 0, friends: 1 });

// Bulk update friends list
const updateFriendship = async (sender, receiver, operation) => {
  const bulkOps = [
    {
      updateOne: {
        filter: { name: sender },
        update: { [operation]: { friends: receiver } },
      },
    },
    {
      updateOne: {
        filter: { name: receiver },
        update: { [operation]: { friends: sender } },
      },
    },
  ];
  return FriendsList.bulkWrite(bulkOps);
};

module.exports = {
  generateToken,
  hashPassword,
  comparePassword,
  handleError,
  sendResponse,
  getFriendsList,
  updateFriendship,
};
