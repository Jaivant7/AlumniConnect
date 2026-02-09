import { useState, useEffect, useContext } from 'react';
import { Users, UserCheck, Clock, CheckCircle, XCircle } from 'lucide-react';
import axios from 'axios';
import AuthContext from '../context/AuthContext';

const Admin = () => {
    const { user } = useContext(AuthContext);
    const [unverifiedUsers, setUnverifiedUsers] = useState([]);
    const [stats, setStats] = useState({ total: 0, verified: 0, pending: 0 });

    useEffect(() => {
        fetchUnverifiedUsers();
        fetchStats();
    }, []);

    const fetchUnverifiedUsers = async () => {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        const res = await axios.get('http://localhost:5000/api/admin/unverified', config);
        setUnverifiedUsers(res.data);
    };

    const fetchStats = async () => {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        const res = await axios.get('http://localhost:5000/api/admin/stats', config);
        setStats(res.data);
    };

    const handleVerify = async (userId) => {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        await axios.patch(`http://localhost:5000/api/admin/verify/${userId}`, {}, config);
        fetchUnverifiedUsers();
        fetchStats();
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
                <div className="mb-8 animate-fade-in">
                    <h2 className="section-header">Admin Dashboard</h2>
                    <p className="section-subheader">Manage user verifications and platform statistics</p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="stats-card gradient-blue animate-slide-up stagger-1">
                        <div className="flex items-center justify-between mb-4">
                            <Users size={28} />
                            <span className="text-blue-100 text-sm font-medium">Platform</span>
                        </div>
                        <div className="text-3xl font-bold mb-1">{stats.total}</div>
                        <div className="text-blue-100">Total Users</div>
                    </div>

                    <div className="stats-card gradient-green animate-slide-up stagger-2">
                        <div className="flex items-center justify-between mb-4">
                            <UserCheck size={28} />
                            <span className="text-green-100 text-sm font-medium">Active</span>
                        </div>
                        <div className="text-3xl font-bold mb-1">{stats.verified}</div>
                        <div className="text-green-100">Verified Users</div>
                    </div>

                    <div className="stats-card bg-gradient-to-br from-orange-500 to-orange-600 animate-slide-up stagger-3">
                        <div className="flex items-center justify-between mb-4">
                            <Clock size={28} />
                            <span className="text-orange-100 text-sm font-medium">Pending</span>
                        </div>
                        <div className="text-3xl font-bold mb-1">{stats.pending}</div>
                        <div className="text-orange-100">Awaiting Verification</div>
                    </div>
                </div>

                {/* Pending Verifications */}
                <div className="card animate-slide-up stagger-4">
                    <div className="p-6 border-b border-gray-200">
                        <h3 className="text-xl font-bold text-gray-900 heading-font">
                            Pending Verifications
                        </h3>
                    </div>

                    {unverifiedUsers.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="min-w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="table-header">User</th>
                                        <th className="table-header">Email</th>
                                        <th className="table-header">Role</th>
                                        <th className="table-header">Department</th>
                                        <th className="table-header">Details</th>
                                        <th className="table-header">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {unverifiedUsers.map((u) => (
                                        <tr key={u._id} className="table-row">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold">
                                                        {u.name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <span className="font-semibold text-gray-900">{u.name}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-gray-600">{u.email}</td>
                                            <td className="px-6 py-4">
                                                <span className={`badge ${getRoleBadge(u.role).class}`}>
                                                    {getRoleBadge(u.role).text}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-gray-600">{u.department}</td>
                                            <td className="px-6 py-4 text-gray-600 text-sm">
                                                {u.role === 'student' && `Year ${u.year}`}
                                                {u.role === 'alumni' && (
                                                    <div>
                                                        <div>{u.company}</div>
                                                        <div className="text-gray-500">{u.currentRole}</div>
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <button
                                                    onClick={() => handleVerify(u._id)}
                                                    className="bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:from-green-600 hover:to-green-700 transition-all flex items-center gap-2"
                                                >
                                                    <CheckCircle size={16} />
                                                    Verify
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="p-12 text-center">
                            <div className="text-6xl mb-4">✅</div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-2 heading-font">All Caught Up!</h3>
                            <p className="text-gray-600">No pending verifications at the moment</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Admin;
