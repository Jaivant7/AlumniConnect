import { useState, useEffect, useContext } from 'react';
import { Search, Send, Check, X } from 'lucide-react';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import io from 'socket.io-client';

let socket;

const Chat = () => {
    const { user } = useContext(AuthContext);
    const [chats, setChats] = useState([]);
    const [activeChat, setActiveChat] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');

    const activeChats = chats.filter(c => c.status === 'accepted');
    const pendingRequests = chats.filter(c => c.status === 'pending' && c.requestedBy !== user._id);

    useEffect(() => {
        socket = io('http://localhost:5000');
        socket.emit('join', user._id);
        fetchChats();
        return () => socket.disconnect();
    }, []);

    const fetchChats = async () => {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        const res = await axios.get('http://localhost:5000/api/chat', config);
        setChats(res.data);
    };

    useEffect(() => {
        if (activeChat) {
            fetchMessages(activeChat._id);
        }
    }, [activeChat]);

    useEffect(() => {
        socket.on('receive_message', (message) => {
            if (activeChat && activeChat._id === message.chatId) {
                const isSender = message.sender === user._id || message.sender._id === user._id;
                if (!isSender) {
                    setMessages((prev) => [...prev, message]);
                }
            }
        });
    }, [activeChat]);

    const fetchMessages = async (chatId) => {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        const res = await axios.get(`http://localhost:5000/api/chat/${chatId}/messages`, config);
        setMessages(res.data);
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        try {
            await axios.post(`http://localhost:5000/api/chat/${activeChat._id}/message`, { content: newMessage }, config);
            const messageData = {
                chatId: activeChat._id,
                sender: user._id,
                content: newMessage,
                timestamp: new Date(),
            };
            socket.emit('send_message', messageData);
            setMessages((prev) => [...prev, messageData]);
            setNewMessage('');
        } catch (error) {
            console.error('Error sending message', error);
        }
    };

    const handleAcceptReject = async (chatId, status) => {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        await axios.patch(`http://localhost:5000/api/chat/${chatId}`, { status }, config);
        fetchChats();
    };

    const getPartnerName = (participants) => {
        const partner = participants.find(p => p._id !== user._id);
        return partner ? partner.name : 'Unknown User';
    };

    const getPartnerInitial = (participants) => {
        const partner = participants.find(p => p._id !== user._id);
        return partner ? partner.name.charAt(0).toUpperCase() : '?';
    };

    return (
        <div className="min-h-screen bg-gray-50 body-font">
            <div className="max-w-7xl mx-auto px-6 py-8">
                <h2 className="section-header mb-6 animate-fade-in">Messages</h2>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-12rem)]">
                    {/* Chat List */}
                    <div className="card overflow-hidden flex flex-col">
                        <div className="p-6 border-b border-gray-200">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    type="text"
                                    placeholder="Search conversations..."
                                    className="input-field input-with-icon"
                                />
                            </div>
                        </div>

                        {/* Pending Requests */}
                        {pendingRequests.length > 0 && (
                            <div className="p-4 border-b border-gray-200 bg-yellow-50">
                                <h3 className="text-sm font-bold text-gray-900 mb-3">Pending Requests ({pendingRequests.length})</h3>
                                <div className="space-y-2">
                                    {pendingRequests.map(chat => (
                                        <div key={chat._id} className="card p-3">
                                            <div className="flex items-center gap-2 mb-2">
                                                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm">
                                                    {getPartnerInitial(chat.participants)}
                                                </div>
                                                <p className="font-semibold text-gray-900 text-sm">{getPartnerName(chat.participants)}</p>
                                            </div>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleAcceptReject(chat._id, 'accepted')}
                                                    className="btn-success flex-1 text-xs py-1.5 flex items-center justify-center gap-1"
                                                >
                                                    <Check size={14} /> Accept
                                                </button>
                                                <button
                                                    onClick={() => handleAcceptReject(chat._id, 'rejected')}
                                                    className="btn-danger flex-1 text-xs py-1.5 flex items-center justify-center gap-1"
                                                >
                                                    <X size={14} /> Reject
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Active Chats */}
                        <div className="flex-1 overflow-y-auto p-4">
                            <div className="space-y-2">
                                {activeChats.map(chat => (
                                    <div
                                        key={chat._id}
                                        onClick={() => setActiveChat(chat)}
                                        className={`p-4 rounded-xl cursor-pointer transition-all ${activeChat?._id === chat._id
                                                ? 'bg-blue-50 border-2 border-blue-200'
                                                : 'border border-gray-200 hover:border-blue-200 hover:bg-gray-50'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-lg">
                                                {getPartnerInitial(chat.participants)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-semibold text-gray-900 truncate">{getPartnerName(chat.participants)}</h4>
                                                <p className="text-xs text-gray-500">Click to open</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            {activeChats.length === 0 && (
                                <p className="text-gray-500 text-sm text-center mt-8">No active chats yet</p>
                            )}
                        </div>
                    </div>

                    {/* Chat Window */}
                    <div className="lg:col-span-2 card flex flex-col overflow-hidden">
                        {activeChat ? (
                            <>
                                {/* Chat Header */}
                                <div className="p-6 border-b border-gray-200">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-lg">
                                            {getPartnerInitial(activeChat.participants)}
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-gray-900">{getPartnerName(activeChat.participants)}</h4>
                                            <p className="text-sm text-gray-600">Online</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Messages */}
                                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                                    {messages.map((msg, idx) => {
                                        const isMe = msg.sender === user._id || msg.sender._id === user._id;
                                        return (
                                            <div key={idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                                <div className={`${isMe ? 'message-bubble-sent' : 'message-bubble-received'}`}>
                                                    <p className="text-sm">{msg.content}</p>
                                                    <p className={`text-xs mt-1 ${isMe ? 'text-blue-100' : 'text-gray-500'}`}>
                                                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Message Input */}
                                <form onSubmit={handleSendMessage} className="p-6 border-t border-gray-200">
                                    <div className="flex items-center gap-3">
                                        <input
                                            type="text"
                                            value={newMessage}
                                            onChange={(e) => setNewMessage(e.target.value)}
                                            className="input-field flex-1"
                                            placeholder="Type your message..."
                                        />
                                        <button type="submit" className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-3 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all">
                                            <Send size={20} />
                                        </button>
                                    </div>
                                </form>
                            </>
                        ) : (
                            <div className="flex-1 flex items-center justify-center text-gray-500">
                                <div className="text-center">
                                    <div className="text-6xl mb-4">💬</div>
                                    <h3 className="text-2xl font-bold text-gray-900 mb-2 heading-font">Select a Conversation</h3>
                                    <p className="text-gray-600">Choose a conversation to start messaging</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Chat;
