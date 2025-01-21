import { useAuth } from '../context/AuthContext';

function Dashboard() {
  const { user } = useAuth();

  return (
    <div className="container mx-auto px-4 py-20">
      <h1 className="text-3xl sm:text-4xl font-bold mb-8 text-white text-center sm:text-left">Welcome to your Dashboard, {user?.username}!</h1>
      <p className="text-white text-center sm:text-left">This is a placeholder for the dashboard content. You can add more features and information here.</p>
    </div>
  );
}

export default Dashboard;

