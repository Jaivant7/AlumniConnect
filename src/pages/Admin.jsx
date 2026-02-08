import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import AuthContext from '../context/AuthContext';

const Admin = () => {
    const { user } = useContext(AuthContext);
    const [users, setUsers] = useState([]);

    const fetchUsers = async () => {
        const config = {
            headers: { Authorization: `Bearer ${user.token}` }
        };
        const { data } = await axios.get('http://localhost:5000/api/users', config);
        setUsers(data);
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const verifyUser = async (id) => {
        const config = {
            headers: { Authorization: `Bearer ${user.token}` }
        };
        try {
            await axios.put(`http://localhost:5000/api/users/${id}/verify`, {}, config);
            fetchUsers();
            alert('User verified successfully');
        } catch (error) {
            console.error(error);
            const msg = error.response?.data?.message || 'Error verifying user';
            alert(msg);
        }
    };

    const unverifiedUsers = users.filter(u => !u.isVerified && u.role !== 'admin');

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Admin Panel</h1>

            <h2 className="text-xl font-semibold mb-4">Pending Verifications</h2>

            {unverifiedUsers.length === 0 ? (
                <p className="text-gray-500">No pending verifications.</p>
            ) : (
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {unverifiedUsers.map((u) => (
                                <tr key={u._id}>
                                    <td className="px-6 py-4 whitespace-nowrap">{u.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{u.email}</td>
                                    <td className="px-6 py-4 whitespace-nowrap capitalize">{u.role}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <button
                                            onClick={() => verifyUser(u._id)}
                                            className="text-green-600 hover:text-green-900 font-semibold"
                                        >
                                            Verify
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default Admin;
