import React, { useState, useEffect } from 'react';
import axios from 'axios';
import useSWR from 'swr';
import '../Mutual.css';

// Fetcher function to handle API requests
const fetcher = (url) => axios.get(url).then((response) => response.data);

function Mutual() {
  const userId = localStorage.getItem('user');

  // useSWR to handle data fetching
  const { data, error, mutate } = useSWR(
    `http://localhost:4000/api/getMutualFriends?name=${userId}`,
    fetcher
  );

  const [friendsState, setFriendsState] = useState({});
  const [usersState, setUsersState] = useState([]);

  // Update state once data is fetched
  useEffect(() => {
    if (data) {
      setFriendsState(data.friends || {});
      setUsersState(data.users || []);
    }
  }, [data]);

  // Function to handle removing an element
  function handleRemove(name, type) {
    if (type === 'friend') {
      const updatedFriends = { ...friendsState };
      delete updatedFriends[name]; // Remove friend from state
      setFriendsState(updatedFriends);
    } else if (type === 'user') {
      const updatedUsers = usersState.filter((user) => user !== name); // Remove user from state
      setUsersState(updatedUsers);
    }
  }

  // Function to handle sending friend request to backend
  const handleRequest = async (name, type) => {
    try {
      // Send backend request to remove friend or user
      await axios.post('http://localhost:4000/api/friendRequest', {
        userId,
        name,
      });

      // Update local state immediately to reflect removal in the frontend
      if (type === 'friend') {
        const updatedFriends = { ...friendsState };
        delete updatedFriends[name]; // Remove friend from state
        setFriendsState(updatedFriends);
      } else if (type === 'user') {
        const updatedUsers = usersState.filter((user) => user !== name); // Remove user from state
        setUsersState(updatedUsers);
      }

      // Optionally refetch data to sync with backend
      mutate();
    } catch (err) {
      console.error('Error removing element:', err);
    }
  };

  if (error) {
    return <div>Error fetching users</div>;
  }

  if (!data) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container">
      <h2>Mutual Friends</h2>
      <div className="mutual-friends-section">
        {Object.entries(friendsState).length === 0 ? (
          <div>No mutual friends found.</div>
        ) : (
          Object.entries(friendsState).map(([name, friendsList], index) => (
            <div key={index} className="friend-row">
              <div className="name">{name}</div>
              <div className="mutual-friends">{friendsList.join(' , ')}</div>
              <div>
                <button onClick={() => handleRequest(name, 'friend')}>
                  SEND
                </button>
                <button onClick={() => handleRemove(name, 'friend')}>
                  Remove
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <h2>Other Users</h2>
      <div className="users-section">
        {usersState.length === 0 ? (
          <div>No other users found.</div>
        ) : (
          usersState.map((user, index) => (
            <div key={index} className="user-row">
              <div className="user-name">{user}</div>
              <div>
                <button onClick={() => handleRequest(user, 'user')}>
                  SEND
                </button>
                <button onClick={() => handleRemove(user, 'user')}>
                  Remove
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Mutual;
