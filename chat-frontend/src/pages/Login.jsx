import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../services/api';

function Login() {

  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: '',
    password: ''
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleLogin = async () => {

    try {
      const res = await API.post('/auth/login', form);

      localStorage.setItem('token', res.data.token);

      navigate('/dashboard');

    } catch (err) {
      alert('Login Failed');
    }
  };

  const containerStyle = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
    padding: 'var(--space-md)'
  };

  const cardStyle = {
    background: 'var(--color-surface)',
    borderRadius: 'var(--radius-lg)',
    padding: 'var(--space-xl)',
    boxShadow: 'var(--shadow-xl)',
    width: '100%',
    maxWidth: '420px'
  };

  const headerStyle = {
    marginBottom: 'var(--space-lg)',
    textAlign: 'center'
  };

  const h2Style = {
    fontSize: '1.875rem',
    fontWeight: '700',
    color: 'var(--color-text-primary)',
    marginBottom: 'var(--space-sm)'
  };

  const subtextStyle = {
    color: 'var(--color-text-secondary)',
    fontSize: '0.875rem'
  };

  const formGroupStyle = {
    marginBottom: 'var(--space-md)'
  };

  const inputStyle = {
    width: '100%',
    padding: 'var(--space-md)',
    fontSize: '1rem',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-md)',
    backgroundColor: '#f8fafc',
    transition: 'var(--transition)',
    color: 'var(--color-text-primary)'
  };

  const buttonStyle = {
    width: '100%',
    padding: 'var(--space-md)',
    background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
    color: 'white',
    border: 'none',
    borderRadius: 'var(--radius-md)',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'var(--transition)',
    boxShadow: 'var(--shadow-md)'
  };

  const linkStyle = {
    marginTop: 'var(--space-lg)',
    textAlign: 'center',
    fontSize: '0.875rem'
  };

  const linkAnchorStyle = {
    color: 'var(--color-primary)',
    fontWeight: '600',
    textDecoration: 'none',
    transition: 'var(--transition)'
  };

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <div style={headerStyle}>
          <h2 style={h2Style}>Welcome Back</h2>
          <p style={subtextStyle}>Sign in to your account to continue</p>
        </div>

        <div style={formGroupStyle}>
          <input
            type="email"
            name="email"
            placeholder="Email address"
            onChange={handleChange}
            style={inputStyle}
          />
        </div>

        <div style={formGroupStyle}>
          <input
            type="password"
            name="password"
            placeholder="Password"
            onChange={handleChange}
            style={inputStyle}
          />
        </div>

        <button
          onClick={handleLogin}
          style={buttonStyle}
          onMouseEnter={(e) => {
            e.target.style.transform = 'translateY(-2px)';
            e.target.style.boxShadow = 'var(--shadow-lg)';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = 'var(--shadow-md)';
          }}
        >
          Sign In
        </button>

        <p style={linkStyle}>
          Don't have account?{' '}
          <Link to="/register" style={linkAnchorStyle}>
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Login;