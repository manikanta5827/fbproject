import React, { useState, useEffect } from 'react';
import axios from './axiosConfig';
import useSWR from 'swr';
import SearchBar from './SearchBar';
import FriendList from './FriendList';
import UserList from './UserList';
import PendingRequestsList from './PendingRequestsList';

const fetcher = (url) => axios.get(url).then((response) => response.data);

function MutualFriends() {
  const [userId] = useState(() => localStorage.getItem('user'));
  const [searchTerm, setSearchTerm] = useState('');
  
  const { data, error: errorFriends, mutate: mutateFriends } = useSWR(`getMutualFriends?name=${userId}`, fetcher);
  const { data: dataRequests, error: errorRequests, mutate: mutatePendings } = useSWR(`pendingRequests?name=${userId}`, fetcher);
  
  const [friendsState, setFriendsState] = useState({});
  const [usersState, setUsersState] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);

  useEffect(() => {
    if (data) {
      setFriendsState(data.mutualFriends || {});
      setUsersState(data.globalFriends || []);
    }
  }, [data]);

  useEffect(() => {
    if (dataRequests) {
      setPendingRequests(dataRequests.pendingRequests || []);
    }
  }, [dataRequests, errorRequests]);

  useEffect(() => {
    mutatePendings();
  }, [friendsState, usersState]);

  const handleRemove = (name, type) => {
    if (type === 'friend') {
      const updatedFriends = { ...friendsState };
      delete updatedFriends[name];
      setFriendsState(updatedFriends);
    } else if (type === 'user') {
      setUsersState(usersState.filter((user) => user !== name));
    } else if (type === 'pending') {
      setPendingRequests(pendingRequests.filter((request) => request !== name));
    }
  };

  const handleRequest = async (name, type) => {
    try {
      await axios.post('friendRequest', { userId, name });
      handleRemove(name, type);
      mutateFriends();
    } catch (err) {
      console.error('Error sending request:', err);
    }
  };

  const cancelRequest = async (name) => {
    try {
      await axios.post('cancelRequest', { userId, name });
      handleRemove(name, 'pending');
      mutateFriends();
    } catch (err) {
      console.error('Error cancelling request:', err);
    }
  };

  const filteredFriends = Object.entries(friendsState).filter(([name]) =>
    name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const filteredUsers = usersState.filter((user) =>
    user.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const filteredPendingRequests = pendingRequests.filter((request) =>
    request.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (errorFriends) return <div>Error fetching data</div>;
  if (!data) return <div>Loading mutual friends...</div>;

  return (
    <div className="container">
      <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} placeholder="Search Mutual Friends ..." />

      <FriendList friends={filteredFriends} handleRequest={handleRequest} handleRemove={handleRemove} />
      <UserList users={filteredUsers} handleRequest={handleRequest} handleRemove={handleRemove} />
      <PendingRequestsList pendingRequests={filteredPendingRequests} cancelRequest={cancelRequest} />
    </div>
  );
}

export default MutualFriends;
