const jwt = require('jsonwebtoken');

// Middleware to authenticate token from Authorization header
const authenticateToken = (req, res, next) => {
  // Get the token from the Authorization header
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];  // 'Bearer <token>'
  
  console.log('IP:', req.ip);
  console.log('Token:', token);

  if (!token) return res.status(403).send('Access denied. No token provided.');

  // Verify the token using the secret key
  jwt.verify(token, process.env.SECRET_KEY, (err, user) => {
    if (err) return res.status(405).send('Invalid token.');

    // Attach the decoded user information to the request object
    req.user = user;
    next();
  });
};

module.exports = { authenticateToken };
