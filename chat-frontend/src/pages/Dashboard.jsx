import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import API from '../services/api';

function Dashboard() {

  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await API.get('/users/all');
      setUsers(res.data || []);
    } catch (err) {
      console.error('Failed to fetch users:', err);
    } finally {
      setLoadingUsers(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const containerStyle = {
    display: 'flex',
    height: '100vh',
    background: 'var(--color-bg)'
  };

  const sidebarStyle = {
    width: '280px',
    borderRight: '1px solid var(--color-border)',
    background: 'var(--color-surface)',
    boxShadow: 'var(--shadow-sm)',
    display: 'flex',
    flexDirection: 'column'
  };

  const headerStyle = {
    padding: 'var(--space-lg)',
    borderBottom: '1px solid var(--color-border)',
    background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
    color: 'white'
  };

  const h2Style = {
    fontSize: '1.5rem',
    fontWeight: '700',
    margin: '0'
  };

  const userListStyle = {
    flex: 1,
    overflowY: 'auto',
    padding: 'var(--space-sm)'
  };

  const userItemStyle = {
    padding: 'var(--space-md)',
    marginBottom: 'var(--space-sm)',
    cursor: 'pointer',
    borderRadius: 'var(--radius-md)',
    background: '#f8fafc',
    border: '1px solid transparent',
    transition: 'var(--transition)',
    color: 'var(--color-text-primary)',
    fontWeight: '500'
  };

  const logoutButtonStyle = {
    margin: 'var(--space-lg)',
    padding: 'var(--space-md)',
    background: 'linear-gradient(135deg, #ef4444, #dc2626)',
    color: 'white',
    border: 'none',
    borderRadius: 'var(--radius-md)',
    cursor: 'pointer',
    fontWeight: '600',
    transition: 'var(--transition)',
    boxShadow: 'var(--shadow-sm)'
  };

  const mainContentStyle = {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 'var(--space-xl)'
  };

  const welcomeCardStyle = {
    background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
    color: 'white',
    padding: 'var(--space-xl)',
    borderRadius: 'var(--radius-lg)',
    boxShadow: 'var(--shadow-xl)',
    textAlign: 'center',
    maxWidth: '500px'
  };

  const welcomeHeadingStyle = {
    fontSize: '2rem',
    fontWeight: '700',
    marginBottom: 'var(--space-md)'
  };

  const welcomeTextStyle = {
    fontSize: '1.125rem',
    opacity: '0.95',
    lineHeight: '1.6'
  };

  return (
    <div style={containerStyle}>
      <div style={sidebarStyle}>
        <div style={headerStyle}>
          <h2 style={h2Style}>Messages</h2>
        </div>

        <div style={userListStyle}>
          {loadingUsers ? (
            <div style={{
              padding: 'var(--space-lg)',
              textAlign: 'center',
              color: 'var(--color-text-secondary)'
            }}>
              <p>Loading users...</p>
            </div>
          ) : users.length === 0 ? (
            <div style={{
              padding: 'var(--space-lg)',
              textAlign: 'center',
              color: 'var(--color-text-secondary)'
            }}>
              <p>No users found</p>
            </div>
          ) : (
            users.map(user => (
              <div
                key={user.id}
                style={userItemStyle}
                onClick={() => navigate(`/chat/${user.id}`)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'white';
                  e.currentTarget.style.borderColor = 'var(--color-primary)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                  e.currentTarget.style.cursor = 'pointer';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#f8fafc';
                  e.currentTarget.style.borderColor = 'transparent';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>
                  {user.name}
                </div>
                <div style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
                  {user.phoneNumber}
                </div>
              </div>
            ))
          )}
        </div>

        <button
          onClick={logout}
          style={logoutButtonStyle}
          onMouseEnter={(e) => {
            e.target.style.transform = 'translateY(-2px)';
            e.target.style.boxShadow = 'var(--shadow-md)';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = 'var(--shadow-sm)';
          }}
        >
          Logout
        </button>
      </div>

      <div style={mainContentStyle}>
        <div style={welcomeCardStyle}>
          <h2 style={welcomeHeadingStyle}>Welcome to Chat</h2>
          <p style={welcomeTextStyle}>
            Select a user from the sidebar to start messaging
          </p>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
