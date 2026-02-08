import { Link } from 'react-router-dom';
import { useContext } from 'react';
import AuthContext from '../context/AuthContext';

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);

    if (!user) return null;

    return (
        <nav className="bg-white shadow">
            <div className="container mx-auto px-4">
                <div className="flex justify-between items-center h-16">
                    <Link to="/" className="text-xl font-bold text-blue-900">
                        AlumniConnect
                    </Link>
                    <div className="flex space-x-4">
                        <Link to="/" className="text-gray-700 hover:text-blue-900">Dashboard</Link>
                        <Link to="/jobs" className="text-gray-700 hover:text-blue-900">Jobs</Link>
                        <Link to="/directory" className="text-gray-700 hover:text-blue-900">Directory</Link>
                        <Link to="/chat" className="text-gray-700 hover:text-blue-900">Chat</Link>
                        {user.role === 'admin' && (
                            <Link to="/admin" className="text-gray-700 hover:text-blue-900">Admin</Link>
                        )}
                        <button onClick={logout} className="text-red-500 hover:text-red-700">Logout</button>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
