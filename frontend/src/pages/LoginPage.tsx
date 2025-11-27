// @ts-nocheck
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';

const LoginPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      const res = await api.post('/auth/login', { email, password });
      const { token, user } = res.data;

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      navigate('/boards');
    } catch (err: any) {
      console.error('Login error ===>', err);
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        'Login failed';
      setError(msg);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1 className="app-title">MiniTrello</h1>
        <p className="app-subtitle">
          Sign in to access your boards.
        </p>

        <form className="form" onSubmit={handleSubmit}>
          <input
            className="input"
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            className="input"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {error && <div className="text-error">{error}</div>}

          <button type="submit" className="button button-primary">
            Sign in
          </button>
        </form>

        <p style={{ marginTop: 12 }} className="text-muted">
          Don't have an account?{' '}
          <Link to="/register">Create an account</Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
