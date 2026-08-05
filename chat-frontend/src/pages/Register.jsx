import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { registerUser } from '../services/authService';

function Register() {

  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    phoneNumber: '',
    role: 'USER'
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleRegister = async () => {
    if (!form.name || !form.phoneNumber) {
      alert('Please fill in all fields');
      return;
    }

    try {
      await registerUser(form);
      alert('Registration Success');
      navigate('/');
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Registration Failed';
      alert(`Registration Failed: ${errorMessage}`);
      console.error('Registration error:', err);
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
    color: 'var(--color-text-primary)',
    boxSizing: 'border-box'
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
          <h2 style={h2Style}>Create Account</h2>
          <p style={subtextStyle}>Join us and start chatting</p>
        </div>

        <div style={formGroupStyle}>
          <input
            type="text"
            name="name"
            placeholder="Full name"
            onChange={handleChange}
            style={inputStyle}
          />
        </div>

        <div style={formGroupStyle}>
          <input
            type="tel"
            name="phoneNumber"
            placeholder="Phone number"
            onChange={handleChange}
            style={inputStyle}
          />
        </div>

        <button
          onClick={handleRegister}
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
          Create Account
        </button>

        <p style={linkStyle}>
          Already have account?{' '}
          <Link to="/" style={linkAnchorStyle}>
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Register;