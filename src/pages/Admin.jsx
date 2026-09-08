import { useState, useEffect, useContext } from 'react';
import { Users, UserCheck, Clock, CheckCircle, XCircle, Lock, Unlock } from 'lucide-react';
import api from '../utils/api';
import AuthContext from '../context/AuthContext';

const Admin = () => {
    const { user } = useContext(AuthContext);
    const [unverifiedUsers, setUnverifiedUsers] = useState([]);
    const [stats, setStats] = useState({ total: 0, verified: 0, pending: 0 });
    const [complaints, setComplaints] = useState([]);
    const [allUsers, setAllUsers] = useState([]);
    const [activeTab, setActiveTab] = useState('verifications'); // 'verifications', 'complaints', or 'users'

    useEffect(() => {
        fetchUnverifiedUsers();
        fetchStats();
        fetchComplaints();
        fetchAllUsers();
    }, []);

    const fetchUnverifiedUsers = async () => {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        const res = await api.get('/api/admin/unverified', config);
        setUnverifiedUsers(res.data);
    };

    const fetchStats = async () => {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        const res = await api.get('/api/admin/stats', config);
        setStats(res.data);
    };

    const fetchComplaints = async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const res = await api.get('/api/complaints', config);
            setComplaints(res.data);
        } catch (error) {
            console.error('Error fetching complaints:', error);
        }
    };
    // hi this is for checking the code is working or not
    const fetchAllUsers = async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const res = await api.get('/api/users', config);
            setAllUsers(res.data);
        } catch (error) {
            console.error('Error fetching all users:', error);
        }
    };

    const handleVerify = async (userId) => {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        await api.patch(`/api/admin/verify/${userId}`, {}, config);
        fetchUnverifiedUsers();
        fetchStats();
    };

    const handleReject = async (userId) => {
        if (window.confirm("Are you sure you want to reject and delete this user?")) {
            try {
                const config = { headers: { Authorization: `Bearer ${user.token}` } };
                await api.delete(`/api/admin/reject/${userId}`, config);
                fetchUnverifiedUsers();
                fetchStats();
            } catch (error) {
                console.error('Error rejecting user:', error);
                alert('Failed to reject user');
            }
        }
    };

    const handleResolve = async (complaintId) => {
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await api.put(`/api/complaints/${complaintId}/resolve`, {}, config);
            fetchComplaints();
        } catch (error) {
            console.error('Error resolving complaint:', error);
        }
    };

    const handleToggleBlock = async (userId) => {
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await api.patch(`/api/admin/block/${userId}`, {}, config);
            fetchAllUsers();
        } catch (error) {
            console.error('Error toggling block status:', error);
            alert(error.response?.data?.message || 'Failed to update user status');
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

                {/* Tabs */}
                <div className="flex space-x-4 mb-6 border-b border-gray-200">
                    <button
                        onClick={() => setActiveTab('verifications')}
                        className={`py-3 px-6 font-semibold text-lg border-b-2 transition-colors ${activeTab === 'verifications' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                    >
                        Pending Verifications
                    </button>
                    <button
                        onClick={() => setActiveTab('users')}
                        className={`py-3 px-6 font-semibold text-lg border-b-2 transition-colors ${activeTab === 'users' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                    >
                        User Management
                    </button>
                    <button
                        onClick={() => setActiveTab('complaints')}
                        className={`py-3 px-6 font-semibold text-lg border-b-2 transition-colors ${activeTab === 'complaints' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                    >
                        User Support ({complaints.filter(c => c.status === 'pending').length} Pending)
                    </button>
                </div>

                {/* Content Area */}
                <div className="card animate-slide-up stagger-4">
                    {activeTab === 'verifications' && (
                        <>
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
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => handleVerify(u._id)}
                                                        className="bg-gradient-to-r from-green-500 to-green-600 text-white px-3 py-1.5 rounded-lg font-semibold hover:from-green-600 hover:to-green-700 transition-all flex items-center gap-1.5 text-sm"
                                                    >
                                                        <CheckCircle size={16} />
                                                        Verify
                                                    </button>
                                                    <button
                                                        onClick={() => handleReject(u._id)}
                                                        className="bg-white border border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 px-3 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1.5 text-sm"
                                                    >
                                                        <XCircle size={16} />
                                                        Reject
                                                    </button>
                                                </div>
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
                        </>
                    )}

                    {activeTab === 'complaints' && (
                        <>
                            <div className="p-6 border-b border-gray-200">
                                <h3 className="text-xl font-bold text-gray-900 heading-font">
                                    User Support & Complaints
                                </h3>
                            </div>
                            
                            {complaints.length > 0 ? (
                                <div className="p-6 space-y-4">
                                    {complaints.map((complaint) => (
                                        <div key={complaint._id} className="card p-6 border-l-4" style={{ borderLeftColor: complaint.status === 'resolved' ? '#10B981' : '#F59E0B' }}>
                                            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <h3 className="text-lg font-bold text-gray-900">{complaint.subject}</h3>
                                                        <span className="text-sm font-medium text-gray-500">
                                                            by {complaint.user.name} ({complaint.user.role})
                                                        </span>
                                                    </div>
                                                    <p className="text-gray-600 mb-4 whitespace-pre-wrap">{complaint.description}</p>
                                                    <p className="text-xs text-gray-400 font-medium">
                                                        {complaint.user.email} • {new Date(complaint.createdAt).toLocaleDateString()}
                                                    </p>
                                                </div>
                                                <div className="flex-shrink-0 flex flex-col items-end gap-2">
                                                    {complaint.status === 'resolved' ? (
                                                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold bg-green-50 text-green-700">
                                                            <CheckCircle size={16} /> Resolved
                                                        </span>
                                                    ) : (
                                                        <button
                                                            onClick={() => handleResolve(complaint._id)}
                                                            className="bg-white border border-gray-200 text-gray-700 hover:text-green-600 hover:border-green-600 px-4 py-2 rounded-lg font-semibold transition-all flex items-center gap-2"
                                                        >
                                                            <CheckCircle size={16} /> Mark Resolved
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-12 text-center">
                                    <div className="text-6xl mb-4">🎉</div>
                                    <h3 className="text-2xl font-bold text-gray-900 mb-2 heading-font">Zero Inbox</h3>
                                    <p className="text-gray-600">No complaints or support tickets at the moment</p>
                                </div>
                            )}
                        </>
                    )}

                    {activeTab === 'users' && (
                        <>
                            <div className="p-6 border-b border-gray-200">
                                <h3 className="text-xl font-bold text-gray-900 heading-font">
                                    User Management
                                </h3>
                            </div>

                    {allUsers.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="min-w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="table-header">User</th>
                                        <th className="table-header">Email</th>
                                        <th className="table-header">Role</th>
                                        <th className="table-header">Status</th>
                                        <th className="table-header">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {allUsers.map((u) => (
                                        <tr key={u._id} className="table-row">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-gray-500 to-gray-600 flex items-center justify-center text-white font-bold">
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
                                            <td className="px-6 py-4">
                                                {u.isBlocked ? (
                                                    <span className="inline-flex items-center gap-1 text-red-600 font-semibold text-sm">
                                                        <Lock size={14} /> Blocked
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 text-green-600 font-semibold text-sm">
                                                        <CheckCircle size={14} /> Active
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                {u.role !== 'admin' && (
                                                    <button
                                                        onClick={() => handleToggleBlock(u._id)}
                                                        className={`border px-3 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1.5 text-sm ${
                                                            u.isBlocked 
                                                                ? 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100 hover:border-green-300' 
                                                                : 'bg-red-50 border-red-200 text-red-700 hover:bg-red-100 hover:border-red-300'
                                                        }`}
                                                    >
                                                        {u.isBlocked ? (
                                                            <>
                                                                <Unlock size={16} /> Unblock
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Lock size={16} /> Block User
                                                            </>
                                                        )}
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="p-12 text-center">
                            <div className="text-6xl mb-4">👥</div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-2 heading-font">No Users Found</h3>
                            <p className="text-gray-600">The platform currently has no assigned users.</p>
                        </div>
                    )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Admin;
