const mongoose = require('mongoose');

function connect() {
  try {
    mongoose.connect('mongodb://localhost:27017/dell');

    const connection = mongoose.connection;

    connection.on('connected', () => console.log('connection connected'));
  } catch (error) {
    console.log('connection error');
  }
}

exports.connect = connect;
