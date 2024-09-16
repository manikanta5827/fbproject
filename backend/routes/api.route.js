const router = require('express').Router();
const { connect } = require('../DB/mongo');
const { User } = require('../DB/schema');

connect();

// Login route
router.post('/login', async (req, res) => {
  const { name, password } = req.body;
  try {
    const user = await User.findOne({ name });
    if (!user || user.password !== password) {
      return res.status(401).send({ error: 'Invalid credentials' });
    }
    return res.send({ name: user.name });
  } catch (error) {
    return res.status(500).send({ error: 'Server error' });
  }
});

// Register route
router.post('/register', async (req, res) => {
  const { name, password } = req.body;
  try {
    const user = new User({ name, password });
    await user.save();
    return res.send({ message: 'User registered successfully' });
  } catch (error) {
    return res.status(500).send({ error: 'Failed to register user' });
  }
});

module.exports = router;
