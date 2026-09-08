import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useContext, useState, useEffect } from 'react';
import { Bell, Search, LogOut, Users, CheckCircle, MessageSquare, AlertCircle } from 'lucide-react';
import AuthContext from '../context/AuthContext';
import api from '../utils/api';
import io from 'socket.io-client';

let socket;

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const location = useLocation();
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState([]);
    const [showNotifications, setShowNotifications] = useState(false);

    useEffect(() => {
        if (user) {
            socket = io(import.meta.env.VITE_API_URL || 'http://localhost:5000');
            socket.emit('join', user._id);

            fetchNotifications();

            socket.on('new_notification', (notification) => {
                setNotifications(prev => [notification, ...prev]);
            });

            return () => socket.disconnect();
        }
    }, [user]);

    const fetchNotifications = async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const res = await api.get('/api/notifications', config);
            setNotifications(res.data);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        }
    };

    const handleReadNotification = async (notif) => {
        if (!notif.isRead) {
            try {
                const config = { headers: { Authorization: `Bearer ${user.token}` } };
                await api.put(`/api/notifications/${notif._id}/read`, {}, config);
                setNotifications(prev => prev.map(n => n._id === notif._id ? { ...n, isRead: true } : n));
            } catch (error) {
                console.error('Error marking notification as read', error);
            }
        }
        setShowNotifications(false);
        if (notif.link) {
            navigate(notif.link);
        }
    };

    const handleReadAll = async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await api.put('/api/notifications/read-all', {}, config);
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        } catch (error) {
            console.error('Error marking all as read', error);
        }
    };

    if (!user) return null;

    const isActive = (path) => location.pathname === path;
    const unreadCount = notifications.filter(n => !n.isRead).length;

    const getIconForType = (type) => {
        switch (type) {
            case 'chat': return <MessageSquare size={16} className="text-blue-500" />;
            case 'complaint': return <AlertCircle size={16} className="text-orange-500" />;
            case 'system':
            default: return <Bell size={16} className="text-gray-500" />;
        }
    };

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
                            <Link to="/" className={`nav-link ${isActive('/') ? 'nav-link-active' : 'nav-link-inactive'}`}>Home</Link>
                            <Link to="/events" className={`nav-link ${isActive('/events') ? 'nav-link-active' : 'nav-link-inactive'}`}>Events</Link>
                            <Link to="/jobs" className={`nav-link ${isActive('/jobs') ? 'nav-link-active' : 'nav-link-inactive'}`}>Jobs</Link>
                            <Link to="/directory" className={`nav-link ${isActive('/directory') ? 'nav-link-active' : 'nav-link-inactive'}`}>Directory</Link>
                            <Link to="/chat" className={`nav-link ${isActive('/chat') ? 'nav-link-active' : 'nav-link-inactive'}`}>Messages</Link>
                            {user.role === 'admin' ? (
                                <Link to="/admin" className={`nav-link ${isActive('/admin') ? 'nav-link-active' : 'nav-link-inactive'}`}>Admin</Link>
                            ) : (
                                <Link to="/help" className={`nav-link ${isActive('/help') ? 'nav-link-active' : 'nav-link-inactive'}`}>Help</Link>
                            )}
                        </div>
                    </div>

                    {/* Right Side Actions */}
                    <div className="flex items-center gap-4">
                        {/* Search Bar */}
                        {/* <div className="hidden lg:block relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="text"
                                placeholder="Search alumni..."
                                className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
                            />
                        </div> */}

                        {/* Notifications */}
                        <div className="relative">
                            <button 
                                onClick={() => setShowNotifications(!showNotifications)}
                                className="relative p-2 hover:bg-gray-100 rounded-lg transition-all"
                            >
                                <Bell size={20} className="text-gray-600" />
                                {unreadCount > 0 && (
                                    <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-[10px] text-white font-bold border-2 border-white">
                                        {unreadCount}
                                    </span>
                                )}
                            </button>

                            {/* Dropdown Menu */}
                            {showNotifications && (
                                <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden z-50">
                                    <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
                                        <h3 className="font-bold text-gray-900">Notifications</h3>
                                        {unreadCount > 0 && (
                                            <button 
                                                onClick={handleReadAll}
                                                className="text-xs text-blue-600 font-semibold hover:text-blue-800 flex items-center gap-1"
                                            >
                                                <CheckCircle size={14} /> Mark all read
                                            </button>
                                        )}
                                    </div>
                                    <div className="max-h-96 overflow-y-auto">
                                        {notifications.length > 0 ? (
                                            notifications.map(notif => (
                                                <div 
                                                    key={notif._id} 
                                                    onClick={() => handleReadNotification(notif)}
                                                    className={`p-4 border-b border-gray-50 cursor-pointer hover:bg-gray-50 transition-colors flex gap-3 ${!notif.isRead ? 'bg-blue-50/50' : ''}`}
                                                >
                                                    <div className="mt-1 flex-shrink-0">
                                                        {getIconForType(notif.type)}
                                                    </div>
                                                    <div>
                                                        <p className={`text-sm tracking-tight ${!notif.isRead ? 'font-bold text-gray-900' : 'font-medium text-gray-700'}`}>
                                                            {notif.title}
                                                        </p>
                                                        <p className="text-xs text-gray-600 mt-0.5">{notif.message}</p>
                                                        <p className="text-xs text-gray-400 mt-1">
                                                            {new Date(notif.createdAt).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="p-8 text-center text-gray-500">
                                                <Bell className="mx-auto mb-2 text-gray-300" size={24} />
                                                <p className="text-sm">No notifications yet</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* User Profile */}
                        <Link to={`/profile/${user._id}`} className="hidden md:flex items-center gap-3 px-3 py-1.5 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm">
                                {user.name.charAt(0).toUpperCase()}
                            </div>
                            <span className="text-gray-900 font-medium text-sm">{user.name}</span>
                        </Link>

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
