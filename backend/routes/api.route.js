const express = require('express');
const router = express.Router();
const { connect } = require('../DB/mongo');
const { authenticateToken } = require('../middleware/auth');
const {
  hashPassword,
  comparePassword,
  sendResponse,
  handleError,
  getFriendsList,
  updateFriendship,
  generateToken,
} = require('../utils');
const {
  User,
  FriendsList,
  RequestsList,
  PendingRequestsList,
} = require('../DB/schema');

connect();

// Health Check
router.get('/', (req, res) => res.send('API is available'));

router.get('/check-auth', authenticateToken, (req, res) => {
  // If token is valid, return the user's information
  res.status(200).json({ message: 'User is authenticated' });
});

// Login Route
router.post('/login', async (req, res) => {
  const { name, password } = req.body;

  try {
    const userName = name.toLowerCase();
    const user = await User.findOne({ name: userName });
    if (!user || !(await comparePassword(password, user.password))) {
      console.log('User not found');
      return res.status(200).send({ error: 'Invalid credentials' });
    }

    // Create JWT token with user ID
    const token = generateToken(user.name);
    console.log(token);

    // Send token and user info in response
    res.status(200).send({
      message: 'Logged in successfully',
      token: token,   // Send token in response body
      name: user.name
    });
  } catch (error) {
    console.log(error);
    handleError(res, error);
  }
});


// Register Route
router.post('/register', async (req, res) => {
  const { name, password } = req.body;
  console.log(req.body);
  try {
    const userName = name.toLowerCase();
    // console.log(userName);
    const result = await User.findOne({ name: userName });
    // console.log(result)
    if (result) {
      return res.status(409).send({ error: 'User already exists' });
    }
    const hashedPassword = await hashPassword(password);
    const user = new User({ name: userName, password: hashedPassword });
    await user.save();

    await FriendsList.create({ name: userName });
    await RequestsList.create({ name: userName });
    await PendingRequestsList.create({ name: userName });

    sendResponse(res, 'User registered successfully');
  } catch (error) {
    handleError(res, error, 501);
  }
});

// Logout Route
router.post('/logout', (req, res) => {
  console.log('logged out');
  try {
    res.clearCookie('token', {
      path: '/',
    });
    sendResponse(res, 'Logged out successfully');
  } catch (error) {
    handleError(res, error);
  }
});

// Get Friends
router.get('/getMyFriends', authenticateToken, async (req, res) => {
  const { name } = req.query;
  console.log(name);
  try {
    const friendsList = await getFriendsList(name);
    if (!friendsList)
      return res.status(404).send({ error: 'Friends list not found' });
    console.log({ friends: friendsList.friends });
    sendResponse(res, 'Friends fetched', { friends: friendsList.friends });
  } catch (error) {
    console.log(error);
    handleError(res, error);
  }
});

// Get Mutual Friends
router.get('/getMutualFriends', authenticateToken, async (req, res) => {
  const { name } = req.query;

  try {
    // Fetch user's friends list
    const { friends: userFriends = [] } =
      (await FriendsList.findOne({ name }, { _id: 0, friends: 1 })) || {};
    userFriends.push(name); // Include the user themselves for the mutual friends search
    // console.log('Me and Myfriends: ', userFriends);
    // Aggregation to find mutual friends
    const mutualFriends = await FriendsList.aggregate([
      { $match: { name } },
      { $unwind: '$friends' },
      {
        $lookup: {
          from: 'FriendsList',
          localField: 'friends',
          foreignField: 'name',
          as: 'friendDetails',
        },
      },
      { $unwind: '$friendDetails' },
      { $unwind: '$friendDetails.friends' },
      {
        $group: {
          _id: '$friendDetails.friends',
          mutualFriends: { $addToSet: '$friends' },
        },
      },
      { $match: { _id: { $nin: userFriends } } }, // Exclude the user and direct friends
      {
        $project: {
          _id: 0,
          friendName: '$_id',
          mutualFriends: 1,
        },
      },
      {
        $group: {
          _id: null,
          result: { $push: { k: '$friendName', v: '$mutualFriends' } },
        },
      },
      {
        $project: {
          _id: 0,
          result: { $arrayToObject: '$result' },
        },
      },
    ]);

    const friendsMapping = (mutualFriends[0] && mutualFriends[0].result) || {};
    // console.log(mutualFriends, friendsMapping);
    // Fetch all users excluding current friends and mutual friends
    const allFriends = [...userFriends, ...Object.keys(friendsMapping)];
    // console.log('All friends', allFriends);
    const allUsers = await FriendsList.find(
      { name: { $nin: allFriends } },
      { _id: 0, friends: 0, __v: 0 }
    );
    const userNames = allUsers.map((user) => user.name);
    // console.log('Global Friends : ', userNames);
    // Fetch pending requests
    // console.log(name);
    const pendingRequest = await PendingRequestsList.findOne(
      { name },
      { _id: 0, pendingRequests: 1 }
    );
    pendingRequests = pendingRequest.pendingRequests;
    // console.log('pending requests : ', pendingRequests);
    //find pending requests of you
    const requestList = await RequestsList.findOne(
      { name },
      { _id: 0, requests: 1 }
    );
    pendingRequests = [...pendingRequests, ...requestList.requests];
    // Filter out pending requests from mutual friends
    const filteredMutualFriends = Object.keys(friendsMapping)
      .filter((key) => !pendingRequests.includes(key))
      .reduce((acc, key) => {
        acc[key] = friendsMapping[key];
        return acc;
      }, {});

    // Filter out pending requests from user names
    const filteredUserNames = userNames.filter(
      (user) => !pendingRequests.includes(user)
    );
    res.send({
      mutualFriends: filteredMutualFriends,
      globalFriends: filteredUserNames,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
});

// Friend Request
router.post('/friendRequest', authenticateToken, async (req, res) => {
  const { userId: sender, name: receiver } = req.body;

  try {
    console.log(sender, receiver);
    await RequestsList.updateOne(
      { name: receiver },
      { $addToSet: { requests: sender } }
    );

    const response = await PendingRequestsList.updateOne(
      { name: sender },
      { $addToSet: { pendingRequests: receiver } }
    );
    console.log(response);
    sendResponse(res, 'Friend request sent');
  } catch (error) {
    handleError(res, error);
  }
});

router.get('/getAllRequests', authenticateToken, async (req, res) => {
  const { name } = req.query;
  try {
    const requestsList = await RequestsList.find(
      { name },
      { _id: 0, requests: 1 }
    );
    sendResponse(res, 'allRequests', { requests: requestsList[0].requests });
  } catch (error) {
    handleError(res, error);
  }
});

router.get('/pendingRequests', authenticateToken, async (req, res) => {
  const { name } = req.query;
  try {
    const requestsList = await PendingRequestsList.findOne(
      { name },
      { _id: 0, pendingRequests: 1 }
    );
    console.log(requestsList);
    sendResponse(res, 'allRequests', {
      pendingRequests: requestsList.pendingRequests,
    });
  } catch (error) {
    console.log(error);
    handleError(res, error);
  }
});

// Accept Request
router.post('/acceptRequest', authenticateToken, async (req, res) => {
  const { userId: sender, name: receiver } = req.body;

  try {
    await RequestsList.updateOne(
      { name: sender },
      { $pull: { requests: receiver } }
    );
    await PendingRequestsList.updateOne(
      { name: receiver },
      { $pull: { pendingRequests: sender } }
    );
    await updateFriendship(sender, receiver, '$push');

    sendResponse(res, 'Friend request accepted');
  } catch (error) {
    handleError(res, error);
  }
});

// Decline Request
router.post('/declineRequest', authenticateToken, async (req, res) => {
  const { userId: sender, name: receiver } = req.body;

  try {
    await RequestsList.updateOne(
      { name: sender },
      { $pull: { requests: receiver } }
    );
    await PendingRequestsList.updateOne(
      { name: receiver },
      { $pull: { pendingRequests: sender } }
    );
    sendResponse(res, 'Friend request declined');
  } catch (error) {
    handleError(res, error);
  }
});

//cancel request if pending
router.post('/cancelRequest', authenticateToken, async (req, res) => {
  const { userId: sender, name: receiver } = req.body;

  try {
    await PendingRequestsList.updateOne(
      { name: sender },
      { $pull: { pendingRequests: receiver } }
    );
    await RequestsList.updateOne(
      { name: receiver },
      { $pull: { requests: sender } }
    );
    sendResponse(res, 'Request canceled');
  } catch (error) {
    handleError(res, error);
  }
});

// Remove Friend
router.post('/removeFriend', authenticateToken, async (req, res) => {
  const { userId: sender, name: receiver } = req.body;

  try {
    await updateFriendship(sender, receiver, '$pull');
    sendResponse(res, 'Friend removed successfully');
  } catch (error) {
    handleError(res, error);
  }
});

module.exports = router;
