import '../App.css';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { useState } from 'react';
import { Navigate, Link } from 'react-router-dom';

// Yup validation schema
const schema = yup
  .object()
  .shape({
    name: yup
      .string()
      .max(10, 'Name cannot exceed 10 characters')
      .required('Name is required'),
    password: yup
      .string()
      .min(4, 'Password must be at least 4 characters')
      .max(12, 'Password cannot exceed 12 characters')
      .required('Password is required'),
  })
  .required();
  function Login() {
    const [isAuthenticated, setAuthenticated] = useState(() => {
      return localStorage.getItem('user') !== null; // Avoid unnecessary re-renders
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
        const response = await fetch('http://localhost:4000/api/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        });
        const responseData = await response.json();
  
        if (responseData.error) {
          alert('Invalid login credentials');
        } else {
          localStorage.setItem('user', responseData.name); // Store name
          setAuthenticated(true); // Trigger authentication status change
        }
      } catch (error) {
        console.error('Login error:', error);
        alert('Login failed, please try again.');
      }
    }
  
    if (isAuthenticated) {
      return <Navigate to="/main" />; // Ensure this is only triggered when authenticated
    }
  
    return (
      <div className="App">
        <h2>Login Account</h2>
        <div className="subDiv">
          <form onSubmit={handleSubmit(handleLogin)}>
            <label htmlFor="name">Name</label>
            <input type="text" placeholder="Name" {...register('name')} />
            {errors.name && <p>{errors.name.message}</p>}
            <br />
  
            <label htmlFor="password">Password</label>
            <input type="password" placeholder="Password" {...register('password')} />
            {errors.password && <p>{errors.password.message}</p>}
            <br />
  
            <input type="submit" value="Submit" />
          </form>
        </div>
        <h2>
          <Link to="/register">Registration page</Link>
        </h2>
      </div>
    );
  }

  export default Login;