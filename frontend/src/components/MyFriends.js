import React, { useEffect, useState } from 'react';
import axios from 'axios';
import useSWR from 'swr';
import SearchBar from './SearchBar';

const fetcher = (url) =>
  axios
    .get(url)
    .then((response) => response.data)
    .then((data) => data.friends);

function MyFriends() {
  const [friends, setFriends] = useState([]);
  const userId = localStorage.getItem('user');
  const { data, error } = useSWR(
    `http://localhost:4000/api/getMyFriends?name=${userId}`,
    fetcher
  );
  useEffect(() => {
    setFriends(data);
  }, [data]);

  if (error) {
    return <div>Error fetching users</div>;
  }

  if (!friends) {
    return <div>Loading...</div>;
  }
  async function handleRemove(data) {
    try {
      await axios.post('http://localhost:4000/api/removeFriend', {
        userId,
        name: data,
      });
      setFriends(friends.filter((item) => item !== data));
    } catch (error) {
      console.error('Error removing friend:', error);
    }
  }

  return (
    <div>
      <h2>My Current friends</h2>
      <SearchBar />
      {friends && friends.length > 0 ? (
        friends.map((friend) => {
          return (
            <div>
              <p>{friend}</p>
              <button onClick={() => handleRemove(friend)}>
                Remove Friend
              </button>
            </div>
          );
        })
      ) : (
        <p>You don't have any friends</p>
      )}
    </div>
  );
}

export default MyFriends;
