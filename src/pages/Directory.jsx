import { useState, useEffect, useContext } from 'react';
import { Search, Building, Calendar, Briefcase, User, MessageSquare } from 'lucide-react';
import axios from 'axios';
import AuthContext from '../context/AuthContext';

const Directory = () => {
    const { user } = useContext(AuthContext);
    const [users, setUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        const res = await axios.get('http://localhost:5000/api/users', config);
        const filtered = res.data.filter(u =>
            u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (u.company && u.company.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (u.department && u.department.toLowerCase().includes(searchTerm.toLowerCase()))
        );
        setUsers(filtered);
    };

    useEffect(() => {
        fetchUsers();
    }, [searchTerm]);

    const sendChatRequest = async (recipientId) => {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        try {
            await axios.post('http://localhost:5000/api/chat/request', { recipientId }, config);
            alert('Chat request sent!');
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to send request');
        }
    };

    const getRoleBadge = (role) => {
        const badges = {
            student: { class: 'badge-blue', text: 'Student' },
            alumni: { class: 'badge-purple', text: 'Alumni' },
            admin: { class: 'badge-orange', text: 'Admin' }
        };
        return badges[role] || badges.student;
    };

    return (
        <div className="min-h-screen bg-gray-50 body-font">
            <div className="max-w-7xl mx-auto px-6 py-8">
                {/* Header */}
                <div className="mb-8 animate-fade-in">
                    <h2 className="section-header">Directory</h2>
                    <p className="section-subheader">Connect with students and alumni from your college</p>

                    <div className="relative mt-6">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search by name, company, or department..."
                            className="input-field input-with-icon w-full"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {/* Users Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {users.map((u, index) => (
                        u._id !== user._id && (
                            <div
                                key={u._id}
                                className={`card card-hover p-6 animate-slide-up stagger-${Math.min(index + 1, 3)}`}
                            >
                                {/* User Avatar & Info */}
                                <div className="flex items-start space-x-4 mb-4">
                                    <div className="relative">
                                        <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-2xl shadow-md flex-shrink-0">
                                            {u.name.charAt(0).toUpperCase()}
                                        </div>
                                        {/* Online status could be added here */}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-xl font-bold text-gray-900 truncate mb-1">{u.name}</h3>
                                        <span className={`badge ${getRoleBadge(u.role).class}`}>
                                            {getRoleBadge(u.role).text}
                                        </span>
                                    </div>
                                </div>

                                {/* User Details */}
                                <div className="space-y-2 mb-4">
                                    {u.role === 'alumni' && (
                                        <>
                                            <div className="flex items-center text-gray-600 text-sm">
                                                <Building size={16} className="mr-2 flex-shrink-0" />
                                                <span className="truncate">{u.company}</span>
                                            </div>
                                            <div className="flex items-center text-gray-600 text-sm">
                                                <Briefcase size={16} className="mr-2 flex-shrink-0" />
                                                <span className="truncate">{u.currentRole}</span>
                                            </div>
                                        </>
                                    )}
                                    {u.role === 'student' && (
                                        <>
                                            <div className="flex items-center text-gray-600 text-sm">
                                                <User size={16} className="mr-2 flex-shrink-0" />
                                                <span className="truncate">{u.department}</span>
                                            </div>
                                            <div className="flex items-center text-gray-600 text-sm">
                                                <Calendar size={16} className="mr-2 flex-shrink-0" />
                                                <span>Year {u.year}</span>
                                            </div>
                                        </>
                                    )}
                                    {u.role === 'admin' && (
                                        <div className="flex items-center text-orange-600 text-sm font-semibold">
                                            <User size={16} className="mr-2" />
                                            Site Administrator
                                        </div>
                                    )}
                                </div>

                                {/* Message Button */}
                                <button
                                    onClick={() => sendChatRequest(u._id)}
                                    className="btn-primary w-full flex items-center justify-center gap-2"
                                >
                                    <MessageSquare size={18} />
                                    Send Message
                                </button>
                            </div>
                        )
                    ))}
                </div>

                {/* Empty State */}
                {users.filter(u => u._id !== user._id).length === 0 && (
                    <div className="card p-12 text-center">
                        <div className="text-6xl mb-4">👥</div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-2 heading-font">No Users Found</h3>
                        <p className="text-gray-600">Try adjusting your search criteria</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Directory;
