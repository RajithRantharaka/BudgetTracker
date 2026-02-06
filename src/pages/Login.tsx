import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Wallet } from 'lucide-react';
import { supabase } from '../lib/supabase';

export const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <Wallet size={48} className="auth-logo" />
          <h2>Welcome Back</h2>
          <p>Sign in to your expense tracker</p>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleLogin} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
          </div>

          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="auth-footer">
          <p>Don't have an account? <Link to="/register">Sign Up</Link></p>
        </div>
      </div>

      <style>{`
        .auth-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: hsl(var(--background));
          padding: 1rem;
        }

        .auth-card {
          background: hsl(var(--surface));
          padding: 2.5rem;
          border-radius: var(--radius);
          box-shadow: var(--shadow-lg);
          width: 100%;
          max-width: 400px;
          border: 1px solid var(--border);
        }

        .auth-header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .auth-logo {
          color: hsl(var(--primary));
          margin-bottom: 1rem;
        }

        .auth-header h2 {
          font-size: 1.5rem;
          margin-bottom: 0.5rem;
        }

        .auth-header p {
          color: hsl(var(--text-muted));
        }

        .error-message {
          background-color: hsl(var(--danger-light));
          color: hsl(var(--danger));
          padding: 0.75rem;
          border-radius: var(--radius);
          margin-bottom: 1.5rem;
          font-size: 0.9rem;
          text-align: center;
        }

        .auth-form {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .form-group label {
          font-size: 0.9rem;
          font-weight: 500;
        }

        .form-group input {
          padding: 0.75rem;
          border-radius: var(--radius);
          border: 1px solid var(--border);
          transition: border-color 0.2s;
        }

        .form-group input:focus {
          outline: none;
          border-color: hsl(var(--primary));
        }

        .auth-button {
          background-color: hsl(var(--primary));
          color: white;
          padding: 0.75rem;
          border-radius: var(--radius);
          font-weight: 600;
          margin-top: 0.5rem;
          transition: background-color 0.2s;
        }

        .auth-button:hover {
          background-color: hsl(var(--primary-dark));
        }

        .auth-button:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .auth-footer {
          margin-top: 1.5rem;
          text-align: center;
          font-size: 0.9rem;
          color: hsl(var(--text-muted));
        }

        .auth-footer a {
          color: hsl(var(--primary));
          text-decoration: none;
          font-weight: 500;
        }

        .auth-footer a:hover {
          text-decoration: underline;
        }
      `}</style>
    </div>
  );
};
