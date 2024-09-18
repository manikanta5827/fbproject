import '../App.css';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { useState } from 'react';
import { Navigate, Link } from 'react-router-dom';
import axios from 'axios';

// Yup validation schema
const schema = yup.object().shape({
  name: yup
    .string()
    .max(10, 'Name cannot exceed 10 characters')
    .required('Name is required'),
  password: yup
    .string()
    .min(4, 'Password must be at least 4 characters')
    .max(12, 'Password cannot exceed 12 characters')
    .required('Password is required'),
}).required();

function Login() {
  const [isAuthenticated, setAuthenticated] = useState(() => {
    // Check if the token exists in localStorage to set initial authentication state
    return localStorage.getItem('token') !== null;
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  async function handleLogin(data) {
    try {
      const response = await axios.post('/login', data, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const responseData = response.data;
      console.log(responseData);
      if (responseData.error) {
        alert('Invalid login credentials');
      } else {
        // Store the token and user information in localStorage
        localStorage.setItem('token', responseData.token); // Store token in localStorage
        localStorage.setItem('user', responseData.name);   // Optionally store user info
        setAuthenticated(true);
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('Login failed');
    }
  }

  if (isAuthenticated) {
    return <Navigate to="/main" />;
  }

  return (
    <div className="App">
      <div className="container" style={{ marginTop: '100px' }}>
        <h2>Login Account</h2>
        <form onSubmit={handleSubmit(handleLogin)}>
          <label htmlFor="name">Name</label>
          <input type="text" placeholder="Name" {...register('name')} />
          {errors.name && <p>{errors.name.message}</p>}
          <label htmlFor="password">Password</label>
          <input type="password" placeholder="Password" {...register('password')} />
          {errors.password && <p>{errors.password.message}</p>}
          <input type="submit" value="Submit" />
        </form>
        <h3>
          <Link to="/register">Registration page</Link>
        </h3>
      </div>
    </div>
  );
}

export default Login;
