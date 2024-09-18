import '../App.css';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useState } from 'react';
import { Navigate, Link } from 'react-router-dom';
import schema from '../components/validationSchema'; // Import the schema

function Register() {
  const [isRegistered, setRegistered] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

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
        setRegistered(true);
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
      <div className="container" style={{ marginTop: '100px' }}>
        <h2>Register New Account</h2>
        <form onSubmit={handleSubmit(handleRegister)}>
          <label htmlFor="name">Name</label>
          <input type="text" placeholder="Name" {...register('name')} />
          {errors.name && <p>{errors.name.message}</p>}

          <label htmlFor="password">Password</label>
          <input
            type="password"
            placeholder="Password"
            {...register('password')}
          />
          {errors.password && <p>{errors.password.message}</p>}

          <label htmlFor="confirmPassword">Confirm Password</label>
          <input
            type="password"
            placeholder="Confirm Password"
            {...register('confirmPassword')}
          />
          {errors.confirmPassword && <p>{errors.confirmPassword.message}</p>}

          <input type="submit" value="Submit" />
        </form>
        <h3>
          <Link to="/login">Login page</Link>
        </h3>
      </div>
    </div>
  );
}

export default Register;
