import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import AuthContext from '../context/AuthContext';

const Directory = () => {
    const { user } = useContext(AuthContext);
    const [users, setUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchUsers = async () => {
        const config = {
            headers: { Authorization: `Bearer ${user.token}` },
            params: { keyword: searchTerm }
        };
        const { data } = await axios.get('http://localhost:5000/api/users', config);
        setUsers(data);
    };

    useEffect(() => {
        fetchUsers();
    }, [searchTerm]);

    const sendChatRequest = async (userId) => {
        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                    'Content-Type': 'application/json'
                },
            };
            await axios.post('http://localhost:5000/api/chat/request', { userId }, config);
            alert('Request sent!');
        } catch (error) {
            alert(error.response?.data?.message || 'Error sending request');
        }
    };

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Directory</h1>
            <input
                type="text"
                placeholder="Search by name, company, or department..."
                className="w-full p-2 border rounded mb-6"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {users.map((u) => (
                    u._id !== user._id && ( // Don't show self
                        <div key={u._id} className="bg-white p-6 rounded-lg shadow flex items-center space-x-4">
                            <div className="bg-blue-200 text-blue-800 rounded-full h-12 w-12 flex items-center justify-center text-xl font-bold">
                                {u.name.charAt(0)}
                            </div>
                            <div>
                                <h3 className="text-lg font-bold">{u.name}</h3>
                                <p className="text-sm text-gray-500 capitalize">{u.role}</p>
                                {u.role === 'alumni' && <p className="text-sm text-gray-600">{u.company} - {u.currentRole}</p>}
                                {u.role === 'student' && <p className="text-sm text-gray-600">{u.department} - {u.year}</p>}
                                {u.role === 'admin' && <p className="text-sm font-semibold text-purple-600">Site Administrator</p>}
                                <button
                                    onClick={() => sendChatRequest(u._id)}
                                    className="mt-2 text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded hover:bg-blue-100"
                                >
                                    Message
                                </button>
                            </div>
                        </div>
                    )
                ))}
            </div>
        </div>
    );
};

export default Directory;
