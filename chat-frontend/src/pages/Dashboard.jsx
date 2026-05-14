import { useNavigate } from 'react-router-dom';

function Dashboard() {

  const navigate = useNavigate();

  const users = [
    {
      id: 1,
      name: 'Ravi'
    },
    {
      id: 2,
      name: 'Kiran'
    },
    {
      id: 3,
      name: 'Arjun'
    }
  ];

  const logout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div style={{ display: 'flex' }}>

      <div style={{ width: '250px', borderRight: '1px solid gray' }}>

        <h2>Users</h2>

        {
          users.map(user => (
            <div
              key={user.id}
              style={{ cursor: 'pointer', padding: '10px' }}
              onClick={() => navigate(`/chat/${user.id}`)}
            >
              {user.name}
            </div>
          ))
        }

        <button onClick={logout}>Logout</button>

      </div>

      <div style={{ padding: '20px' }}>
        <h2>Welcome to Chat Dashboard</h2>
      </div>

    </div>
  );
}

export default Dashboard;