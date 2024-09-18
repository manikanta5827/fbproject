import React, { useEffect, useState } from 'react';
import axios from './axiosConfig.js';
import useSWR from 'swr';
import SearchBar from './SearchBar';
import AvatarCircle from './AvatarCircle'; // Import the new AvatarCircle component

const fetcher = (url) => axios.get(url).then((response) => response.data);

function MyFriends() {
  const [friends, setFriends] = useState([]);
  const [userId, setUserId] = useState(() => localStorage.getItem('user'));
  const [searchTerm, setSearchTerm] = useState('');

  const { data, error } = useSWR(`getMyFriends?name=${userId}`, fetcher);

  useEffect(() => {
    if (data) {
      setFriends(data.friends);
    } else {
      setFriends([]);
    }
  }, [data]);

  const handleRemove = async (friend) => {
    try {
      await axios.post('removeFriend', { userId, name: friend });
      setFriends(friends.filter((item) => item !== friend));
    } catch (error) {
      console.error('Error removing friend:', error);
    }
  };

  if (error) {
    console.log(error);
    return <div>Error fetching friend</div>;
  }
  if (!friends) return <div>Loading...</div>;

  const filteredFriends = friends.filter((friend) =>
    friend.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container">
      <h2>My Current Friends</h2>
      {friends.length > 0 && (
        <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
      )}

      {filteredFriends.length > 0 ? (
        filteredFriends.map((friend, index) => (
          <div
            className="row"
            key={index}
            style={{ display: 'flex', alignItems: 'center' }}
          >
            <AvatarCircle name={friend} />
            <p>{friend}</p>
            <button className="decline" onClick={() => handleRemove(friend)}>
              Remove Friend
            </button>
          </div>
        ))
      ) : (
        <h3>No friends...</h3>
      )}
    </div>
  );
}

export default MyFriends;
