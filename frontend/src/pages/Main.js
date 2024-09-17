import React, { useState } from 'react';
import { Link, Navigate, Outlet } from 'react-router-dom';

function Main() {
  const [user, setUser] = useState(() => localStorage.getItem('user'));
  
  const logout = () => {
    localStorage.removeItem('user');
    setUser(null);
  };
  
  if (!user) {
    return <Navigate to="/login" />; // This ensures redirect only if user is null
  }

  return (
    <div>
      {user && <h2>Hii..{user}</h2>}
      <button onClick={logout}>Logout</button>
      <h3>Search</h3>
      <Outlet />
      <h3>
        <Link to="/main">Home</Link>...
        <Link to="/main/friends">Friends</Link>...
        <Link to="/main/requests">Requests</Link>...
      </h3>
    </div>
  );
}


export default Main;
