// @ts-nocheck
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';

const RegisterPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      const res = await api.post('/auth/register', { email, password, name });
      const { token, user } = res.data;

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      navigate('/boards');
    } catch (err: any) {
      console.error('Register error ===>', err);
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        'Account creation failed';
      setError(msg);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1 className="app-title">Noxello</h1>
        <p className="app-subtitle">
          Create an account to start organizing your projects.
        </p>

        <form className="form" onSubmit={handleSubmit}>
          <input
            className="input"
            type="text"
            placeholder="Name (optional)"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
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
            Create account
          </button>
        </form>

        <p style={{ marginTop: 12 }} className="text-muted">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
