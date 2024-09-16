import React, { useState } from 'react';
import { Link, Navigate, Outlet } from 'react-router-dom';

function Main() {
  const [user, setUser] = useState(() => localStorage.getItem('user'));
  const logout = () => {
    localStorage.removeItem('user');
    setUser(null);
  };
  if (!user) {
    return <Navigate to="/login" />; // Redirect to login page if not authenticated
  }
  return (
    <div>
      {user && <h2>Hii..{user}</h2>}
      <button onClick={logout}>Logout</button>
      <h3>Search</h3>
      <Outlet />
      <h3>Bottom</h3>
    </div>
  );
}

export default Main;
