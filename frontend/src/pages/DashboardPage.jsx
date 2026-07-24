import { Link } from 'react-router-dom';

const DashboardPage = () => {
  return (
    <div className="page">
      <h2>Dashboard</h2>
      <p>Manage your tasks and categories from here.</p>
      <div className="cards">
        <Link className="card" to="/tasks">View Tasks</Link>
        <Link className="card" to="/categories">Manage Categories</Link>
      </div>
    </div>
  );
};

export default DashboardPage;
