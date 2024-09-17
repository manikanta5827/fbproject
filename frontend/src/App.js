import './App.css';
import Main from './pages/Main';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './components/Home';
import Friends from './components/Friends';
import Requests from './components/Requests';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import { useState } from 'react';
import Notfound from './pages/Notfound';

function getName() {
  const name = localStorage.getItem('name');
  return name || null;
}

function App() {
  const [Name, setName] = useState(() => localStorage.getItem('user'));

  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Avoid constant redirects by controlling the Navigate calls */}
          <Route
            path="/"
            element={Name ? <Navigate to="/main" /> : <Navigate to="/login" />}
          />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/*" element={<Notfound />} />

          <Route
            path="/main"
            element={Name ? <Main /> : <Navigate to="/login" />}
          >
            <Route index element={<Home />} />
            <Route path="friends" element={<Friends />} />
            <Route path="requests" element={<Requests />} />
          </Route>
        </Routes>
      </div>
    </Router>
  );
}

export default App;
