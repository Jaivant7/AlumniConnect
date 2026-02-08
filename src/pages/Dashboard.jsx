import { useContext } from 'react';
import AuthContext from '../context/AuthContext';
import { Link } from 'react-router-dom';

const Dashboard = () => {
    const { user } = useContext(AuthContext);

    return (
        <div className="space-y-6">
            <div className="bg-gradient-to-r from-blue-800 to-blue-600 text-white p-8 rounded-lg shadow-lg">
                <h1 className="text-3xl font-bold">Welcome back, {user.name}!</h1>
                <p className="opacity-90 mt-2 capitalize">Role: {user.role}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Link to="/jobs" className="block bg-white p-6 rounded-lg shadow hover:shadow-lg transition">
                    <h2 className="text-xl font-bold text-gray-800 mb-2">Jobs</h2>
                    <p className="text-gray-600">Browse exclusive job listings shared by alumni.</p>
                </Link>
                <Link to="/directory" className="block bg-white p-6 rounded-lg shadow hover:shadow-lg transition">
                    <h2 className="text-xl font-bold text-gray-800 mb-2">Directory</h2>
                    <p className="text-gray-600">Connect with fellow students and alumni.</p>
                </Link>
                <Link to="/chat" className="block bg-white p-6 rounded-lg shadow hover:shadow-lg transition">
                    <h2 className="text-xl font-bold text-gray-800 mb-2">Messages</h2>
                    <p className="text-gray-600">Check your requests and conversations.</p>
                </Link>
            </div>
        </div>
    );
};

export default Dashboard;
