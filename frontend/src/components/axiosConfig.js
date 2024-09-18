import axios from 'axios';

// Set base URL
axios.defaults.baseURL = 'http://localhost:4000/api';

// Add token to every request if it exists in localStorage
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('token'); // Get token from localStorage
  console.log(token);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;  // Attach token to headers
  }
  return config;
});

export default axios;
