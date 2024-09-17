import React, { useState, useEffect } from 'react';
import axios from 'axios';
import useSWR from 'swr';
import SearchBar from './SearchBar';  // Import the SearchBar component

const fetcher = (url) => axios.get(url, { withCredentials: true }).then((response) => response.data);

function Requests() {
  const userId = localStorage.getItem('user');
  const [requests, setRequests] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");  // Search term state
  const { data, error, mutate } = useSWR(
    `http://localhost:4000/api/getAllRequests?name=${userId}`,
    fetcher
  );

  useEffect(() => {
    if (data) {
      setRequests(data.requests);
    }
  }, [data]);

  const filteredRequests = (requests || []).filter((request) =>
    request.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (error) {
    return <div>Error fetching users</div>;
  }

  if (!data) {
    return <div>Loading...</div>;
  }

  async function handleAccept(data) {
    try {
      await axios.post('http://localhost:4000/api/acceptRequest', { withCredentials: true }, {
        userId,
        name: data,
      });
      updateFrontend(data);
      mutate();
    } catch (error) {
      console.error('Error accepting request:', error);
    }
  }

  async function handleDecline(data) {
    try {
      await axios.post('http://localhost:4000/api/declineRequest', { withCredentials: true }, {
        userId,
        name: data,
      });
      updateFrontend();
      mutate();
    } catch (error) {
      console.error('Error declining request:', error);
    }
  }

  function updateFrontend(data) {
    const updatedRequests = requests.filter((item) => item !== data);
    setRequests(updatedRequests);
  }

  return (
    <div>
      <h2>Requests</h2>
      <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />

      {filteredRequests.map((request, index) => (
        <div key={index}>
          <p>{request}</p>
          <button onClick={() => handleAccept(request)}>Accept</button>
          <button onClick={() => handleDecline(request)}>Decline</button>
        </div>
      ))}
    </div>
  );
}

export default Requests;
