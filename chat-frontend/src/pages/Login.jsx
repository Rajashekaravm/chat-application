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

      navigate('/home');

    } catch (err) {
      alert('Login Failed');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">

        <h2>Login</h2>

        <input
          type="email"
          name="email"
          placeholder="Email"
          onChange={handleChange}
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          onChange={handleChange}
        />

        <button onClick={handleLogin}>Login</button>

        <p>
          Don't have account? <Link to="/register">Register</Link>
        </p>

      </div>
    </div>
  );
}

export default Login;