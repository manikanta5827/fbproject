import React from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/Main.css'
const Logout = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
     
      // Send a request to the backend logout route
      await axios.post('http://localhost:4000/api/logout', {}, { withCredentials: true });

      // Clear the local storage
      localStorage.clear();

      // Redirect the user to the login page (or any other route)
      navigate('/login');
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  return (
    <button onClick={handleLogout} className="logout-button">
      Logout
    </button>
  );
};

export default Logout;
