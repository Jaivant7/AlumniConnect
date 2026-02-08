import { useState, useEffect, useContext, useRef } from 'react';
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

    // Split chats into accepted (active) and pending
    const activeChats = chats.filter(c => c.status === 'accepted');
    const pendingRequests = chats.filter(c => c.status === 'pending' && c.requestedBy !== user._id);
    // Requests I sent are still pending but I can't do anything about them?
    const mySentRequests = chats.filter(c => c.status === 'pending' && c.requestedBy === user._id);

    useEffect(() => {
        socket = io('http://localhost:5000');
        fetchChats();

        return () => {
            socket.disconnect();
        };
    }, []);

    useEffect(() => {
        if (activeChat) {
            socket.emit('join_chat', activeChat._id);
            setMessages(activeChat.messages || []);
        }
    }, [activeChat]);

    useEffect(() => {
        socket.on('receive_message', (message) => {
            // Prevent double message if we are the sender (optimistic update already handled it)
            if (activeChat && activeChat._id === message.chatId) {
                const isSender = message.sender === user._id || message.sender._id === user._id; // Handle populated vs unpopulated
                if (!isSender) {
                    setMessages((prev) => [...prev, message]);
                }
            }
        });
    }, [activeChat, user._id]);

    const fetchChats = async () => {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        const { data } = await axios.get('http://localhost:5000/api/chat', config);
        setChats(data);
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        console.log('Send button clicked');
        console.log('Message content:', newMessage);
        console.log('Active Chat:', activeChat);

        if (!newMessage.trim()) {
            console.log('Message is empty, returning');
            return;
        }

        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        try {
            console.log('Sending request to server...');
            await axios.post(`http://localhost:5000/api/chat/${activeChat._id}/message`, { content: newMessage }, config);
            console.log('Message stored in DB');

            // Emit to socket
            const messageData = {
                chatId: activeChat._id,
                sender: user._id,
                content: newMessage,
                timestamp: new Date(),
            };
            socket.emit('send_message', messageData);
            setMessages((prev) => [...prev, messageData]); // Optimistic update
            setNewMessage('');
        } catch (error) {
            console.error('Error sending message', error);
        }
    };

    const handleAcceptReject = async (chatId, status) => {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        try {
            await axios.put(`http://localhost:5000/api/chat/${chatId}/respond`, { status }, config);
            fetchChats();
        } catch (error) {
            console.error(error);
        }
    };

    const getPartnerName = (participants) => {
        const partner = participants.find(p => p._id !== user._id);
        return partner ? partner.name : 'Unknown User';
    };

    return (
        <div className="flex h-[80vh] bg-white shadow rounded-lg overflow-hidden">
            {/* Sidebar */}
            <div className="w-1/3 border-r bg-gray-50 overflow-y-auto">
                {pendingRequests.length > 0 && (
                    <div className="p-4 border-b bg-yellow-50">
                        <h3 className="font-bold text-sm text-yellow-800 mb-2">Requests</h3>
                        {pendingRequests.map(chat => (
                            <div key={chat._id} className="mb-2 p-2 bg-white rounded shadow text-sm">
                                <p className="font-semibold">{getPartnerName(chat.participants)}</p>
                                <div className="flex space-x-2 mt-2">
                                    <button onClick={() => handleAcceptReject(chat._id, 'accepted')} className="text-green-600 hover:font-bold">Accept</button>
                                    <button onClick={() => handleAcceptReject(chat._id, 'rejected')} className="text-red-600 hover:font-bold">Reject</button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <div className="p-4">
                    <h3 className="font-bold text-gray-700 mb-2">Messages</h3>
                    {activeChats.map(chat => (
                        <div
                            key={chat._id}
                            onClick={() => setActiveChat(chat)}
                            className={`p-3 rounded cursor-pointer mb-2 ${activeChat?._id === chat._id ? 'bg-blue-100' : 'hover:bg-gray-100'}`}
                        >
                            <p className="font-semibold">{getPartnerName(chat.participants)}</p>
                        </div>
                    ))}
                    {activeChats.length === 0 && <p className="text-gray-500 text-sm">No active chats.</p>}
                </div>
            </div>

            {/* Chat Area */}
            <div className="w-2/3 flex flex-col">
                {activeChat ? (
                    <>
                        <div className="p-4 border-b bg-gray-100 flex justify-between items-center">
                            <h2 className="font-bold text-lg">{getPartnerName(activeChat.participants)}</h2>
                        </div>

                        <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-white">
                            {messages.map((msg, idx) => {
                                const isMe = msg.sender === user._id || msg.sender._id === user._id; // Handle populated vs unpopulated
                                return (
                                    <div key={idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`p-3 rounded-lg max-w-xs ${isMe ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'}`}>
                                            <p>{msg.content}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <form onSubmit={handleSendMessage} className="p-4 border-t bg-gray-50 flex">
                            <input
                                type="text"
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                className="flex-1 p-2 border rounded-l focus:outline-none"
                                placeholder="Type a message..."
                            />
                            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-r hover:bg-blue-700">Send</button>
                        </form>
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center text-gray-500">
                        Select a chat to start messaging
                    </div>
                )}
            </div>
        </div>
    );
};

export default Chat;
