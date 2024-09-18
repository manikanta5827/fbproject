const mongoose = require('mongoose');

function connect() {
  try {
    mongoose.connect(
      'mongodb+srv://postbox5827:iu8J32jic5MGjTNK@cluster1.mlfyq.mongodb.net/<Friends>?retryWrites=true&w=majority&appName=Cluster1'
    );

    const connection = mongoose.connection;

    connection.on('connected', () => console.log('connection connected'));
  } catch (error) {
    console.log('connection error');
  }
}

exports.connect = connect;
