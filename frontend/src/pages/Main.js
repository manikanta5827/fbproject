import React, { useState } from 'react';
import { Link, Navigate, Outlet } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faUserFriends, faBell } from '@fortawesome/free-solid-svg-icons';
import '../styles/Main.css';
import Logout from '../components/Logout';

function Main() {
  const [user, setUser] = useState(() => localStorage.getItem('user').toUpperCase());
  const [activeTab, setActiveTab] = useState('/main'); // Keep track of active tab

  if (!user) {
    return <Navigate to="/login" />;
  }

  return (
    <div className="container" style={{marginTop:'100px'}}>
      <header>
        <h2>Welcome,<span  className='user-name'> {user}!</span></h2>
        <Logout />
      </header>

      <nav className="navigation">
        <Link 
          to="/main" 
          className={`nav-link ${activeTab === '/main' ? 'active' : ''}`} 
          onClick={() => setActiveTab('/main')}
        >
          <FontAwesomeIcon icon={faHome} className="icon-button" />
        </Link>
        <Link 
          to="/main/friends" 
          className={`nav-link ${activeTab === '/main/friends' ? 'active' : ''}`} 
          onClick={() => setActiveTab('/main/friends')}
        >
          <FontAwesomeIcon icon={faUserFriends} className="icon-button" />
        </Link>
        <Link 
          to="/main/requests" 
          className={`nav-link ${activeTab === '/main/requests' ? 'active' : ''}`} 
          onClick={() => setActiveTab('/main/requests')}
        >
          <FontAwesomeIcon icon={faBell} className="icon-button" />
        </Link>
      </nav>

      <Outlet />
    </div>
  );
}

export default Main;
