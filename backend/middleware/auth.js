// middleware/auth.js
const jwt = require('jsonwebtoken');
const app = require('express')();

const authenticateToken = (req, res, next) => {
  // console.log('authenticateToken');
  // console.log(req.cookies);
  const token = req.cookies.token; // or token in headers
  if (!token) return res.status(403).send('Access denied.');
  // console.log('Token : ', token);

  jwt.verify(token, process.env.SECRET_KEY, (err, user) => {
    if (err) return res.status(405).send('Invalid token.');
    req.user = user;
    next();
  });
  // next();
};

module.exports = { authenticateToken };
