import React, { useState, useEffect } from 'react';
import axios from 'axios';
import useSWR from 'swr';
const fetcher = (url) => axios.get(url).then((response) => response.data);

function Requests() {
  const userId = localStorage.getItem('user');
  const [requests, setRequests] = useState([]);
  const { data, error, mutate } = useSWR(
    `http://localhost:4000/api/getAllRequests?name=${userId}`,
    fetcher
  );

  useEffect(() => {
    if (data) {
      setRequests(data.requests);
    }
  }, [data]);

  if (error) {
    return <div>Error fetching users</div>;
  }

  if (!data) {
    return <div>Loading...</div>;
  }
  async function handleAccept(data) {
    try {
      await axios.post('http://localhost:4000/api/acceptRequest', {
        userId,
        name: data,
      });
      //remove from frontend
      updateFrontend(data);
      mutate();
    } catch (error) {
      console.error('Error accepting request:', error);
    }
  }
  async function handleDecline(data) {
    try {
      await axios.post('http://localhost:4000/api/declineRequest', {
        userId,
        name: data,
      });
      updateFrontend();
      mutate();
    } catch (error) {
      console.error('Error declining request:', error);
    }
  }
  function updateFrontend(data){
    const updatedRequests = requests.filter((item) => item!== data);
    setRequests(updatedRequests);  // update state in frontend without re-rendering the whole component.
  }

  return (
    <div>
      {requests &&
        requests.map((request, index) => {
          return (
            <div key={index}>
              <p>{request}</p>
              <button onClick={() => handleAccept(request)}>Accept</button>
              <button onClick={() => handleDecline(request)}>Decline</button>
            </div>
          );
        })}
        {/* <pre>{JSON.stringify(requests,null,2)}</pre> */}
    </div>
  );
}

export default Requests;
