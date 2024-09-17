const router = require('express').Router();
const { connect } = require('../DB/mongo');
const { User, FriendsList, RequestsList } = require('../DB/schema');

connect();

// Login route
router.get('/', (req, res) => {
  res.send('API is available');
});
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

    const friendsList = new FriendsList({ name });
    await friendsList.save();

    const requestsList = new RequestsList({ name });
    await requestsList.save();

    return res.send({ message: 'User registered successfully' });
  } catch (error) {
    return res.status(500).send({ error: 'Failed to register user' });
  }
});

router.get('/getMyFriends', async (req, res) => {
  const { name } = req.query;
  const friendsList = await FriendsList.find({ name }, { _id: 0, friends: 1 });
  if (!friendsList.length) {
    return res.status(404).send({ error: 'Friends list not found' });
  }
  // console.log(friendsList[0]);
  return res.send({ friends: friendsList[0].friends });
});

// router.get('/getAllFriends', async (req, res) => {
//   const { name } = req.query;
//   let friendsList = await FriendsList.find({ name }, { _id: 0, friends: 1 });
//   friendsList = friendsList[0].friends;
//   friendsList.push(name);
//   console.log('sd : ',friendsList);
//   let users = await FriendsList.find(
//     { name: { $nin: friendsList } },
//     { _id: 0, friends: 0, __v: 0 }
//   );
//   res.send({ friends: users.map((user) => user.name) });
// });

router.get('/getMutualFriends', async (req, res) => {
  const { name } = req.query;
  //get his freinds friends list
  let friendsList = await FriendsList.find({ name }, { _id: 0, friends: 1 });

  friendsList = friendsList[0].friends;
  friendsList.push(name);

  const getMutualFriends = async (name) => {
    const result = await FriendsList.aggregate([
      // Step 1: Match the user by the passed name (e.g., 'King')
      {
        $match: { name: name },
      },
      // Step 2: Unwind the user's friends array
      {
        $unwind: '$friends',
      },
      // Step 3: Look up each friend's details (to get their friends)
      {
        $lookup: {
          from: 'FriendsList', // Reference the same 'FriendsList' collection
          localField: 'friends', // Direct friend's name
          foreignField: 'name', // Match with the friend's document
          as: 'friendDetails',
        },
      },
      // Step 4: Unwind the friendDetails array to access each friend's document
      {
        $unwind: '$friendDetails',
      },
      // Step 5: Collect all sub-friends and their direct friend
      {
        $project: {
          subFriend: '$friendDetails.friends', // Friends of friends (sub-friends)
          directFriend: '$friends', // Direct friend of the input user
        },
      },
      // Step 6: Unwind sub-friends to get each individual sub-friend
      {
        $unwind: '$subFriend',
      },
      // Step 7: Group by the sub-friends and collect the direct friends they are mutual with
      {
        $group: {
          _id: '$subFriend', // Group by sub-friend
          mutualFriends: { $addToSet: '$directFriend' }, // Collect all direct friends that share this sub-friend
        },
      },
      // Step 8: Filter out the input user and their direct friends from the mutualFriends
      {
        $lookup: {
          from: 'FriendsList',
          pipeline: [
            { $match: { name: name } },
            { $project: { friends: 1, _id: 0 } },
          ],
          as: 'inputUserDetails',
        },
      },
      {
        $unwind: '$inputUserDetails',
      },
      {
        $match: {
          _id: {
            $nin: ['$inputUserDetails.name', '$inputUserDetails.friends'],
          }, // Exclude the input user and direct friends
        },
      },
      // Step 9: Convert the result into a key-value format
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
          mutualFriendsMapping: {
            $push: {
              k: '$friendName', // Sub-friend's name
              v: '$mutualFriends', // List of direct friends they are mutual with
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          result: { $arrayToObject: '$mutualFriendsMapping' },
        },
      },
    ]);

    return result.length ? result[0].result : {};
  };

  const friends = await getMutualFriends(name);
  // console.log(friends);
  let sample = [];
  const filteredObject = Object.keys(friends).reduce((acc, key) => {
    // console.log(key);
    if (!friendsList.includes(key)) {
      sample.push(key); // storing the names of friends not in the friendsList
      acc[key] = friends[key];
    }
    return acc;
  }, {});

  console.log(filteredObject);
  let friend = [...friendsList, ...sample];
  let users = await FriendsList.find(
    { name: { $nin: friend } },
    { _id: 0, friends: 0, __v: 0 }
  );
  users = users.map((user) => user.name);
  console.log(users);
  const pendingUsers=await RequestsList.find({name},{_id:0,requests:1});

  let newArray=pendingUsers[0].requests;

  const filteredObj = Object.keys(filteredObject)
  .filter(key => !newArray.includes(key))  // Exclude keys that are in newArray
  .reduce((acc, key) => {
    acc[key] = filteredObject[key];
    return acc;
  }, {});

  const filteredArray = users.filter(item => {
    return  !newArray.includes(item);
  });

  console.log(filteredArray,filteredObj,newArray)
  res.send({ friends: filteredObj, users:filteredArray });
});

router.post('/friendRequest', async (req, res) => {
  // console.log('hii')
  try {
    const { userId: sender, name: receiver } = req.body;
    console.log(sender, receiver);
  
    const response = await RequestsList.updateOne(
      { name: sender },            // Find the user by name (sender)
      { $push: { requests: receiver } } // Push the receiver into the 'requests' array
    );
  
    console.log(response);
    res.send({ success: 'success' });
  } catch (error) {
    console.error(error);
    res.sendStatus(404);
  }
  
  // try {
  //   const senderList = await FriendsList.findOneAndUpdate(
  //     { name: sender },
  //     { $push: { friends: receiver } },
  //     { new: true }
  //   );
  //   const receiverList = await FriendsList.findOneAndUpdate(
  //     { name: receiver },
  //     { $push: { friends: sender } },
  //     { new: true }
  //   );
  //   return res.send({ message: 'Friend request sent successfully' });
  // } catch (error) {
  //   return res.status(500).send({ error: 'Failed to send friend request' });
  // }
});

router.get('/getAllRequests',async(req,res)=>{
  const {name} = req.query;
  // console.log(name)
  const requestsList = await RequestsList.find({name},{_id:0,requests:1});
  // console.log(requestsList[0].requests);
  res.send({requests:requestsList[0].requests});
})

router.post('/acceptRequest',async(req,res)=>{
  const {userId: sender, name: receiver } = req.body;
  console.log(sender, receiver);
  try {
    const response = await RequestsList.updateOne(
      { name: sender },            // Find the user by name (sender)
      { $pull: { requests: receiver } }, // Remove the receiver from the 'requests' array
    );
  
    console.log(response);

    const bulkOps = [
      {
        updateOne: {
          filter: { name: sender },
          update: { $push: { friends: receiver } },
          returnDocument: 'after'  // To get the updated document
        }
      },
      {
        updateOne: {
          filter: { name: receiver },
          update: { $push: { friends: sender } },
          returnDocument: 'after'  // To get the updated document
        }
      }
    ];
    
    const result = await FriendsList.bulkWrite(bulkOps);
    console.log(result);    
  
    return res.send({ message: 'Friend request accepted successfully' });
  } catch (error) {
    console.error(error);
    res.sendStatus(404);
}})

router.post('/declineRequest',async(req,res)=>{
  const {userId: sender, name: receiver } = req.body;
  console.log(sender, receiver);
  try {
    const response = await RequestsList.updateOne(
      { name: sender },            // Find the user by name (sender)
      { $pull: { requests: receiver } }, // Remove the receiver from the 'requests' array
    );
  
    console.log(response);
  
    return res.send({ message: 'Friend request rejected successfully' });
  } catch (error) {
    console.error(error);
    res.sendStatus(404);
  }
})

router.post('/removeFriend',async(req,res)=>{
  const { userId: sender, name: receiver } = req.body;
  console.log(sender, receiver);
  try {
    const bulkOps = [
      {
        updateOne: {
          filter: { name: sender },
          update: { $pull: { friends: receiver } },
          returnDocument: 'after'  // To get the updated document
        }
      },
      {
        updateOne: {
          filter: { name: receiver },
          update: { $pull: { friends: sender } },
          returnDocument: 'after'  // To get the updated document
        }
      }
    ];
    
    const result = await FriendsList.bulkWrite(bulkOps);
    console.log(result);    
  
    return res.send({ message: 'Friend removed successfully' });
  } catch (error) {
    console.error(error);
    res.sendStatus(404);
  }
})

module.exports = router;
