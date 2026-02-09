import { Link, useLocation } from 'react-router-dom';
import { useContext } from 'react';
import { Bell, Search, LogOut, Users } from 'lucide-react';
import AuthContext from '../context/AuthContext';

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const location = useLocation();

    if (!user) return null;

    const isActive = (path) => location.pathname === path;

    return (
        <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
            <div className="max-w-7xl mx-auto px-6">
                <div className="flex items-center justify-between h-16">
                    {/* Logo and Brand */}
                    <div className="flex items-center gap-8">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center shadow-md">
                                <Users className="text-white" size={20} />
                            </div>
                            <h1 className="text-xl font-bold text-gray-900 heading-font">
                                AlumniConnect
                            </h1>
                        </div>

                        {/* Desktop Navigation */}
                        <div className="hidden md:flex items-center gap-1">
                            <Link
                                to="/"
                                className={`nav-link ${isActive('/') ? 'nav-link-active' : 'nav-link-inactive'}`}
                            >
                                Home
                            </Link>
                            <Link
                                to="/jobs"
                                className={`nav-link ${isActive('/jobs') ? 'nav-link-active' : 'nav-link-inactive'}`}
                            >
                                Jobs
                            </Link>
                            <Link
                                to="/directory"
                                className={`nav-link ${isActive('/directory') ? 'nav-link-active' : 'nav-link-inactive'}`}
                            >
                                Directory
                            </Link>
                            <Link
                                to="/chat"
                                className={`nav-link ${isActive('/chat') ? 'nav-link-active' : 'nav-link-inactive'}`}
                            >
                                Messages
                            </Link>
                            {user.role === 'admin' && (
                                <Link
                                    to="/admin"
                                    className={`nav-link ${isActive('/admin') ? 'nav-link-active' : 'nav-link-inactive'}`}
                                >
                                    Admin
                                </Link>
                            )}
                        </div>
                    </div>

                    {/* Right Side Actions */}
                    <div className="flex items-center gap-4">
                        {/* Search Bar */}
                        <div className="hidden lg:block relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="text"
                                placeholder="Search alumni..."
                                className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
                            />
                        </div>

                        {/* Notifications */}
                        <button className="relative p-2 hover:bg-gray-100 rounded-lg transition-all">
                            <Bell size={20} className="text-gray-600" />
                            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                        </button>

                        {/* User Profile */}
                        <div className="hidden md:flex items-center gap-3 px-3 py-1.5 rounded-lg bg-gray-50">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm">
                                {user.name.charAt(0).toUpperCase()}
                            </div>
                            <span className="text-gray-900 font-medium text-sm">{user.name}</span>
                        </div>

                        {/* Logout */}
                        <button
                            onClick={logout}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-all"
                            title="Logout"
                        >
                            <LogOut size={20} className="text-gray-600" />
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
