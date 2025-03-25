import React, { useState } from 'react';
import axios from 'axios';
import '../styles/Signup.css';  // Make sure to style this accordingly

const AuthForm: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [isSignUp, setIsSignUp] = useState<boolean>(true); // Track whether it's sign up or login

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      setError('Please fill in both fields');
      return;
    }

    try {
      let response;

      if (isSignUp) {
        // Sign up logic
        response = await axios.post('https://bookish-eureka-r4gjvvr5jqq93x9wp-3000.app.github.dev/signup', { email, password });
        setMessage('Sign up successful!');
      } else {
        // Login logic
        response = await axios.post('https://bookish-eureka-r4gjvvr5jqq93x9wp-3000.app.github.dev/login', { email, password });
        localStorage.setItem('token', response.data.token); // Store JWT token
        setMessage('Login successful!');
      }

      // Clear fields and reset error/message
      setEmail('');
      setPassword('');
      setError('');
    } catch (err) {
      setError(isSignUp ? 'Sign up failed' : 'Invalid credentials');
    }
  };

  const toggleForm = () => {
    setIsSignUp(!isSignUp); // Toggle between Sign Up and Login
    setError('');
    setMessage('');
  };

  return (
    <div className="auth-container">
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
    </div>
  );
};

export default AuthForm;
