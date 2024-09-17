import React, { useState, useEffect } from 'react';
import axios from 'axios';
import useSWR from 'swr';
import SearchBar from './SearchBar'; // Reusable SearchBar component
import '../Mutual.css';

const fetcher = (url) =>
  axios.get(url, { withCredentials: true }).then((response) => response.data);

function Mutual() {
  const userId = localStorage.getItem('user');

  const { data, error, mutate } = useSWR(
    `http://localhost:4000/api/getMutualFriends?name=${userId}`,
    fetcher
  );

  const [friendsState, setFriendsState] = useState({});
  const [usersState, setUsersState] = useState([]);
  const [searchTerm, setSearchTerm] = useState(''); // Single search term for both sections

  useEffect(() => {
    if (data) {
      setFriendsState(data.friends || {});
      setUsersState(data.users || []);
    }
  }, [data]);

  function handleRemove(name, type) {
    if (type === 'friend') {
      const updatedFriends = { ...friendsState };
      delete updatedFriends[name];
      setFriendsState(updatedFriends);
    } else if (type === 'user') {
      const updatedUsers = usersState.filter((user) => user !== name);
      setUsersState(updatedUsers);
    }
  }

  const handleRequest = async (name, type) => {
    try {
      await axios.post(
        'http://localhost:4000/api/friendRequest',
        { withCredentials: true },
        {
          userId,
          name,
        }
      );

      if (type === 'friend') {
        const updatedFriends = { ...friendsState };
        delete updatedFriends[name];
        setFriendsState(updatedFriends);
      } else if (type === 'user') {
        const updatedUsers = usersState.filter((user) => user !== name);
        setUsersState(updatedUsers);
      }

      mutate();
    } catch (err) {
      console.error('Error removing element:', err);
    }
  };

  // Filter for both mutual friends and other users based on the single search term
  const filteredFriends = Object.entries(friendsState).filter(([name]) =>
    name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredUsers = usersState.filter((user) =>
    user.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (error) {
    return <div>Error fetching users</div>;
  }

  if (!data) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container">
      <h2>Mutual Friends and Other Users</h2>
      <SearchBar
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        placeholder="Search Mutual Friends or Other Users..."
      />

      <div className="mutual-friends-section">
        <h3>Mutual Friends</h3>
        {filteredFriends.length === 0 ? (
          <div>No mutual friends found.</div>
        ) : (
          filteredFriends.map(([name, friendsList], index) => (
            <div key={index} className="friend-row">
              <div className="name">{name}</div>
              <div className="mutual-friends">{friendsList.join(', ')}</div>
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

      <div className="users-section">
        <h3>Other Users</h3>
        {filteredUsers.length === 0 ? (
          <div>No other users found.</div>
        ) : (
          filteredUsers.map((user, index) => (
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
