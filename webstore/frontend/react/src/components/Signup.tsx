import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/Signup.css';  

const Signup: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [isSignUp, setIsSignUp] = useState<boolean>(true); 
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false); 


  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsLoggedIn(true); 
    } else {
      setIsLoggedIn(false);
    }
  }, []);

 
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      setError('Please fill in both fields');
      return;
    }

    try {
      let response;

      if (isSignUp) {
     
        response = await axios.post('https://bookish-eureka-r4gjvvr5jqq93x9wp-3000.app.github.dev/signup', { email, password });
        setMessage('Sign up successful!');
      } else {
     
        response = await axios.post('https://bookish-eureka-r4gjvvr5jqq93x9wp-3000.app.github.dev/login', { email, password });
        localStorage.setItem('token', response.data.token);
        setMessage('Login successful!');
        setIsLoggedIn(true); 
      }

    
      setEmail('');
      setPassword('');
      setError('');
    } catch (err) {
      setError(isSignUp ? 'Sign up failed' : 'Invalid credentials');
    }
  };


  const toggleForm = () => {
    setIsSignUp(!isSignUp); 
    setError('');
    setMessage('');
  };


  const handleLogout = () => {
    localStorage.removeItem('token'); 
    setIsLoggedIn(false); 
  };


  const handleDeleteAccount = async () => {
    if (window.confirm('Are you sure you want to delete your account? This action is permanent.')) {
      try {
        await axios.delete('https://bookish-eureka-r4gjvvr5jqq93x9wp-3000.app.github.dev/delete-account', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });

        alert('Your account has been deleted successfully.');
        handleLogout();
      } catch (error) {
        alert('Error deleting account. Please try again later.');
      }
    }
  };

  return (
    <div className="auth-container">
      {isLoggedIn ? (
        <>
          <h1>You are logged in</h1>
          <button className="logout-button" onClick={handleLogout}>
            Log Out
          </button>
          <button className="delete-account-button" onClick={handleDeleteAccount}>
            Delete Account
          </button>
        </>
      ) : (
        <>
          <h1>{isSignUp ? 'Sign Up' : 'Login'}</h1>
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="email">Email:</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password:</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="submit-button">{isSignUp ? 'Sign Up' : 'Login'}</button>

            {error && <p className="error-message">{error}</p>}
            {message && <p className="success-message">{message}</p>}
          </form>

          <button className="toggle-button" onClick={toggleForm}>
            {isSignUp ? 'Already have an account? Login' : 'Don\'t have an account? Sign Up'}
          </button>
        </>
      )}
    </div>
  );
};

export default Signup;
