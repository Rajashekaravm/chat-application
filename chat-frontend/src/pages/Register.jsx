import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../services/api';

function Register() {

  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'USER'
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleRegister = async () => {

    try {
      await API.post('/auth/register', form);

      alert('Registration Success');

      navigate('/');

    } catch (err) {
      alert('Registration Failed');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">

        <h2>Register</h2>

        <input
          type="text"
          name="name"
          placeholder="Name"
          onChange={handleChange}
        />

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

        <button onClick={handleRegister}>Register</button>

        <p>
          Already have account? <Link to="/">Login</Link>
        </p>

      </div>
    </div>
  );
}

export default Register;