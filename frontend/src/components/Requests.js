import React, { useState, useEffect } from 'react';
import axios from './axiosConfig.js';
import useSWR from 'swr';
import SearchBar from './SearchBar';
import '../styles/Requests.css';
import AvatarCircle from './AvatarCircle.js';

const fetcher = (url) => axios.get(url).then((response) => response.data);

function Requests() {
  const [userId, setUserId] = useState(() => localStorage.getItem('user'));
  const [requests, setRequests] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const { data, error, mutate } = useSWR(`getAllRequests?name=${userId}`, fetcher);

  useEffect(() => {
    if (data) {
      setRequests(data.requests);
    }
  }, [data]);

  const filteredRequests = (requests || []).filter((request) =>
    request.toLowerCase().includes(searchTerm.toLowerCase())
  );

  async function handleAccept(data) {
    try {
      await axios.post('acceptRequest', { userId, name: data });
      updateFrontend(data);
      mutate();
    } catch (error) {
      console.error('Error accepting request:', error);
    }
  }

  async function handleDecline(data) {
    try {
      await axios.post('declineRequest', { userId, name: data });
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

  if (error) {
    return <div className="error-message">Error fetching users</div>;
  }

  if (!data) {
    return <div className="loading-message">Loading...</div>;
  }

  return (
    <div className="container">
      <h2>Requests</h2>
     {requests.length>0 ? <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />:<h3>No Requests...🤧</h3>}
      {filteredRequests.map((request, index) => (
        <div className="request-item" key={index}>
           <AvatarCircle name={request} />
          <p>{request}</p>
          <button className="accept" onClick={() => handleAccept(request)}>Accept</button>
          <button className="decline" onClick={() => handleDecline(request)}>Decline</button>
        </div>
      ))}
    </div>
  );
}

export default Requests;
