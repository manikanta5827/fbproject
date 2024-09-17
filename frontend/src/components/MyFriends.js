import React, { useEffect } from 'react';
import axios from 'axios';
import useSWR from 'swr';

const fetcher = (url) =>
  axios
    .get(url)
    .then((response) => response.data)
    .then((data) => data.friends);

function MyFriends() {
  const userId = localStorage.getItem('user');
  const { data: friends, error } = useSWR(
    `http://localhost:4000/api/getMyFriends?name=${userId}`,
    fetcher
  );

  if (error) {
    return <div>Error fetching users</div>;
  }

  if (!friends) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h2>My Current friends</h2>

      {friends && friends.length > 0 ? (
        friends.map((friend) => {
          return <p key={friend}>{friend}</p>;
        })
      ) : (
        <p>You don't have any friends</p>
      )}
    </div>
  );
}

export default MyFriends;
