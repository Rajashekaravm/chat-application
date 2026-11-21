import { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { sendOtp, verifyOtp } from '../services/authService';

function Login() {

  const navigate = useNavigate();
  const location = useLocation();

  const [otpSent, setOtpSent] = useState(false);
  const [displayOtp, setDisplayOtp] = useState('');
  const [form, setForm] = useState({
    phoneNumber: '',
    otp: ''
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleSendOtp = async () => {
    if (!form.phoneNumber) {
      alert('Please enter your phone number');
      return;
    }
    try {
      const res = await sendOtp({ phoneNumber: form.phoneNumber });
      const otpCode = res.data.otp;
      setDisplayOtp(otpCode);
      setOtpSent(true);
      // Display OTP from response for demo/testing
      alert(`OTP sent successfully!\n\n📱 Your OTP: ${otpCode}\n\n(For development/testing only)`);
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Unable to send OTP';
      alert(`Unable to send OTP: ${errorMessage}`);
      console.error('OTP send error:', err);
    }
  };

  const handleVerifyOtp = async () => {
    if (!form.otp) {
      alert('Please enter the OTP');
      return;
    }
    try {
      const res = await verifyOtp({
        phoneNumber: form.phoneNumber,
        otp: form.otp
      });

      localStorage.setItem('token', res.data.token);
      navigate(location.state?.from?.pathname || '/dashboard', { replace: true });
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'OTP verification failed';
      alert(`Error: ${errorMessage}`);
      console.error('OTP verification error:', err);
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
            type="tel"
            name="phoneNumber"
            placeholder="Phone number"
            onChange={handleChange}
            style={inputStyle}
          />
        </div>

        <div style={formGroupStyle}>
          <input
            type="text"
            name="otp"
            placeholder={otpSent ? 'Enter OTP' : 'OTP will arrive shortly'}
            value={form.otp}
            onChange={handleChange}
            style={inputStyle}
          />
        </div>

        {otpSent && displayOtp && (
          <div style={{
            ...formGroupStyle,
            background: '#ecfdf5',
            border: '2px solid #10b981',
            borderRadius: 'var(--radius-md)',
            padding: 'var(--space-md)',
            textAlign: 'center'
          }}>
            <p style={{ margin: '0 0 0.5rem 0', color: '#059669', fontSize: '0.875rem', fontWeight: '600' }}>
              Dev/Test OTP
            </p>
            <p style={{ margin: '0', color: '#047857', fontSize: '1.875rem', fontWeight: '700', letterSpacing: '0.25rem' }}>
              {displayOtp}
            </p>
          </div>
        )}

        <button
          onClick={otpSent ? handleVerifyOtp : handleSendOtp}
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
          {otpSent ? 'Verify OTP' : 'Send OTP'}
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