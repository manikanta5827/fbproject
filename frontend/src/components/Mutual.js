import React from 'react';
import axios from 'axios';
import useSWR from 'swr';
import '../Mutual.css';
// Fetcher function to handle API requests
const fetcher = (url) =>
  axios
    .get(url)
    .then((response) => response.data)
    .then((data) => data.friends);

function Mutual() {
  const userId = localStorage.getItem('user');
  
  // useSWR to handle data fetching
  const { data, error } = useSWR(
    `http://localhost:4000/api/getMutualFriends?name=${userId}`,
    fetcher
  );

  if (error) {
    return <div>Error fetching users</div>;
  }

  if (!data) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container">
      <h2>Mutual Friends</h2>
      {Object.entries(data).map(([name, friends], index) => (
        <div key={index} className="friend-row">
          <div className="name">{name}</div>
          <div className="mutual-friends">{friends.join(', ')}</div>
        </div>
      ))}
    </div>
  );
}

export default Mutual;
