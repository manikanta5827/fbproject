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

function Register() {
  const [isRegistered, setRegistered] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  // Function to handle registration submission
  async function handleRegister(data) {
    try {
      const response = await fetch('http://localhost:4000/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      const responseData = await response.json();

      if (responseData.error) {
        alert('Registration failed');
      } else {
        alert('Registration successful');
        setRegistered(true); // Set state for redirection after successful registration
      }
    } catch (error) {
      console.error('Registration error:', error);
      alert('Registration failed, please try again.');
    }
  }

  if (isRegistered) {
    return <Navigate to="/login" />;
  }

  return (
    <div className="App">
      <h2>Register new account</h2>
      <div className="subDiv">
        <form onSubmit={handleSubmit(handleRegister)}>
          <label htmlFor="name">Name</label>
          <input type="text" placeholder="Name" {...register('name')} />
          {errors.name && <p>{errors.name.message}</p>}
          <br />

          <label htmlFor="password">Passwor</label>
          <input
            type="password"
            placeholder="Password"
            {...register('password')}
          />
          {errors.password && <p>{errors.password.message}</p>}
          <br />

          <input type="submit" value="submit" />
        </form>
      </div>
      <h3>
        <Link to="/login">Login page</Link>
      </h3>
    </div>
  );
}

export default Register;
