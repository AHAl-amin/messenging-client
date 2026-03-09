import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import axios from 'axios';
import { Send, User as UserIcon, ArrowLeft, LogOut } from 'lucide-react';

import { BACKEND_URL } from '../../lib/api';
const socket = io(BACKEND_URL);

// Debug logging
console.log('Messenger component loaded, BACKEND_URL:', BACKEND_URL);

// Add socket connection logging
socket.on('connect', () => console.log('✅ Socket connected:', socket.id));
socket.on('disconnect', () => console.log('❌ Socket disconnected'));
socket.on('connect_error', (error) => console.error('❌ Socket connection error:', error));

const Messenger = () => {
    const navigate = useNavigate();
    const [currentUser, setCurrentUser] = useState(null);
    const [users, setUsers] = useState([]);
    const [selectedUserId, setSelectedUserId] = useState(null);
    const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const [onlineUsers, setOnlineUsers] = useState([]);
    const messagesEndRef = useRef(null);
    // Keep a ref to selectedUser so the socket listener always sees the latest value
    const selectedUserRef = useRef(null);
    const currentUserRef = useRef(null);

    const selectedUser = selectedUserId ? users.find(u => u.id === selectedUserId) : null;

    // Keep refs in sync with state
    useEffect(() => {
        console.log('🔄 selectedUserRef updated:', selectedUser?.name);
        selectedUserRef.current = selectedUser;
    }, [selectedUser]);

    useEffect(() => {
        console.log('🔄 currentUserRef updated:', currentUser?.name);
        currentUserRef.current = currentUser;
    }, [currentUser]);

    // Initialization: check auth and load users
    useEffect(() => {
        console.log('🔄 Initialization effect running...');
        const userStr = localStorage.getItem('chat_user');
        if (!userStr) {
            console.log('⚠️ No user in localStorage, redirecting to login');
            navigate('/login');
            return;
        }
        const user = JSON.parse(userStr);
        console.log('👤 User loaded:', user.name);
        setCurrentUser(user);

        // Register socket
        socket.emit('register_socket', user.id);
        console.log('📡 Socket registered for user:', user.id);

        // Load available users
        const fetchUsers = async () => {
            try {
                const res = await axios.get(`${BACKEND_URL}/users?currentUserId=${user.id}`);
                const filteredUsers = res.data.filter(u => u.id !== user.id);
                console.log('👥 Users loaded:', filteredUsers.map(u => u.name));
                setUsers(filteredUsers);

                // Check if selected user is still valid
                const selectedUserIdStr = localStorage.getItem('selected_user_id');
                if (selectedUserIdStr) {
                    const id = selectedUserIdStr;
                    const isValid = filteredUsers.some(u => u.id === id);
                    if (!isValid) {
                        console.log('⚠️ Selected user no longer exists, clearing');
                        setSelectedUserId(null);
                        localStorage.removeItem('selected_user_id');
                    } else {
                        setSelectedUserId(id);
                    }
                }
            } catch (err) {
                console.error('❌ Error fetching users', err);
            }
        };
        fetchUsers();

        // Determine online presence
        const handleOnline = (activeUserIds) => {
            console.log('🟢 Online users:', activeUserIds);
            setOnlineUsers(activeUserIds);
        };
        socket.on('online_users', handleOnline);

        // Handle socket errors
        const handleSocketError = (error) => {
            console.error('❌ Socket error:', error);
        };
        socket.on('error', handleSocketError);

        return () => {
            console.log('🧹 Cleaning up initialization effect');
            socket.off('online_users', handleOnline);
            socket.off('error', handleSocketError);
        };
    }, [navigate]);

    // Handle incoming messages — uses ref to avoid stale closure
    useEffect(() => {
        const handlePrivateMessage = (msg) => {
            console.log('📨 Received private message:', msg);
            const activePeer = selectedUserRef.current;
            const me = currentUserRef.current;

            console.log('📊 Active peer:', activePeer?.name, 'Me:', me?.name);

            // Skip echo of our own sent messages (we already added them locally)
            if (me && msg.senderId === me.id) {
                console.log('⏭️ Skipping own message echo');
                return;
            }

            // Update lastMessage in users list
            setUsers(prevUsers => {
                const updatedUsers = [...prevUsers];
                const otherUserId = msg.senderId === me?.id ? msg.receiverId : msg.senderId;
                const userIndex = updatedUsers.findIndex(u => u.id === otherUserId);
                if (userIndex !== -1) {
                    const userToUpdate = { ...updatedUsers[userIndex] };
                    userToUpdate.lastMessage = msg.text;
                    userToUpdate.lastMessageTimestamp = msg.timestamp;
                    userToUpdate.lastMessageSenderId = msg.senderId;

                    // Move to top
                    updatedUsers.splice(userIndex, 1);
                    updatedUsers.unshift(userToUpdate);
                }
                return updatedUsers;
            });

            // Add to messages only if the conv with this peer is open
            if (activePeer &&
                (msg.senderId === activePeer.id || msg.receiverId === activePeer.id)) {
                console.log('✅ Adding message to chat');
                setMessages((prev) => [...prev, msg]);
            } else {
                console.log('⏭️ Skipping message - not for active conversation');
            }
        };

        socket.on('receive_private_message', handlePrivateMessage);

        return () => {
            socket.off('receive_private_message', handlePrivateMessage);
        };
    }, []); // empty deps — refs handle latest values

    // Auto-scroll logic
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };
    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Load chat history when a user is selected
    useEffect(() => {
        if (selectedUser && currentUser) {
            const fetchMessages = async () => {
                try {
                    const res = await axios.get(`${BACKEND_URL}/messages/${currentUser.id}/${selectedUser.id}`);
                    setMessages(res.data);
                } catch (err) {
                    console.error('Failed fetching messages', err);
                }
            };
            fetchMessages();
        } else {
            setMessages([]);
        }
    }, [selectedUser, currentUser]);

    const handleSendMessage = () => {
        console.log('📤 handleSendMessage called', {
            inputValue,
            selectedUser: selectedUser?.name,
            currentUser: currentUser?.name
        });

        if (inputValue.trim() !== '' && selectedUser && currentUser) {
            try {
                const now = new Date().toISOString();
                const optimisticMsg = {
                    id: Date.now().toString(),
                    senderId: currentUser.id,
                    receiverId: selectedUser.id,
                    text: inputValue,
                    timestamp: now,
                };
                console.log('✅ Adding optimistic message:', optimisticMsg);
                setMessages((prev) => [...prev, optimisticMsg]);

                // Update last message in sidebar
                setUsers(prevUsers => {
                    const updatedUsers = [...prevUsers];
                    const userIndex = updatedUsers.findIndex(u => u.id === selectedUser.id);
                    if (userIndex !== -1) {
                        const userToUpdate = { ...updatedUsers[userIndex] };
                        userToUpdate.lastMessage = optimisticMsg.text;
                        userToUpdate.lastMessageTimestamp = optimisticMsg.timestamp;
                        userToUpdate.lastMessageSenderId = optimisticMsg.senderId;

                        // Move to top
                        updatedUsers.splice(userIndex, 1);
                        updatedUsers.unshift(userToUpdate);
                    }
                    return updatedUsers;
                });

                const payload = {
                    senderId: currentUser.id,
                    receiverId: selectedUser.id,
                    text: inputValue,
                };
                console.log('📡 Emitting socket message:', payload);
                socket.emit('private_message', payload);
                setInputValue('');
                console.log('✅ Message sent successfully, input cleared');
            } catch (error) {
                console.error('❌ Error sending message:', error);
            }
        } else {
            console.warn('⚠️ Cannot send message:', {
                inputValueEmpty: !inputValue.trim(),
                noSelectedUser: !selectedUser,
                noCurrentUser: !currentUser
            });
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('chat_user');
        localStorage.removeItem('selected_user_id');
        window.location.href = '/login'; // Force full reload to drop socket
    };

    if (!currentUser) return null;

    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden font-sans">
            {/* Sidebar: User List */}
            <div className={`w-full md:w-80 bg-white border-r border-gray-200 flex flex-col ${selectedUserId ? 'hidden md:flex' : 'flex'}`}>
                {/* Sidebar Header */}
                <div className="p-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-lg">
                            {currentUser.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <h2 className="font-semibold text-gray-800">{currentUser.name}</h2>
                            <p className="text-xs text-green-500 font-medium">Online</p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        title="Logout"
                        className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors">
                        <LogOut size={20} />
                    </button>
                </div>

                {/* User Search (Placeholder UI) */}
                <div className="p-3">
                    <input
                        type="text"
                        placeholder="Search users..."
                        className="w-full bg-gray-100 border-none rounded-full px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    />
                </div>

                {/* User List */}
                <div className="flex-1 overflow-y-auto">
                    {users.length === 0 && (
                        <p className="p-4 text-center text-gray-400 text-sm">No other users found. Register another account to chat!</p>
                    )}
                    {users.map((user) => {
                        const isOnline = onlineUsers.includes(user.id);
                        return (
                            <div
                                key={user.id}
                                onClick={() => {
                                    console.log('👤 User clicked:', user.name);
                                    setSelectedUserId(user.id);
                                    localStorage.setItem('selected_user_id', user.id);
                                }}
                                className={`flex items-center space-x-3 p-3 cursor-pointer transition-colors border-l-4 ${selectedUser?.id === user.id ? 'bg-blue-50 border-blue-600' : 'hover:bg-gray-50 border-transparent'}`}
                            >
                                <div className="relative">
                                    <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-semibold text-xl">
                                        {user.name.charAt(0).toUpperCase()}
                                    </div>
                                    {isOnline && (
                                        <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full"></div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-semibold text-gray-800 truncate">{user.name}</h3>
                                    <p className="text-sm truncate">
                                        {user.lastMessage ? (
                                            <span className={user.lastMessageSenderId !== currentUser.id ? "text-gray-800 font-medium" : "text-gray-500"}>
                                                {user.lastMessageSenderId === currentUser.id ? 'You: ' : ''}{user.lastMessage}
                                            </span>
                                        ) : (
                                            <span className="text-gray-500">{user.email}</span>
                                        )}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Main Chat Area */}
            <div className={`flex-1 flex flex-col bg-white ${!selectedUserId ? 'hidden md:flex' : 'flex'}`}>
                {selectedUserId ? (
                    <>
                        {/* Chat Header */}
                        <div className="h-16 px-4 py-3 bg-white border-b border-gray-200 flex items-center shadow-sm z-10">
                            <button
                                className="md:hidden mr-3 p-1.5 text-gray-500 hover:bg-gray-100 rounded-full"
                                onClick={() => {
                                    console.log('⬅️ Back button clicked, clearing selected user');
                                    setSelectedUserId(null);
                                    localStorage.removeItem('selected_user_id');
                                }}
                            >
                                <ArrowLeft size={24} />
                            </button>
                            <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-lg mr-3">
                                {(selectedUser?.name || 'Unknown').charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-800">{selectedUser?.name || 'Unknown'}</h3>
                                <p className="text-xs text-blue-600 flex items-center">
                                    {onlineUsers.includes(selectedUser?.id) ? 'Active now' : 'Offline'}
                                </p>
                            </div>
                        </div>

                        {/* Chat Messages */}
                        <div className="flex-1 overflow-y-auto p-4 bg-gray-50 space-y-4">
                            {messages.length === 0 ? (
                                <div className="h-full flex items-center justify-center">
                                    <div className="text-center p-6 bg-white rounded-2xl shadow-sm border border-gray-100 max-w-sm">
                                        <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                            👋
                                        </div>
                                        <h4 className="font-semibold text-gray-800 mb-1">Say hi to {selectedUser?.name || 'Unknown'}!</h4>
                                        <p className="text-sm text-gray-500">You don't have a chat history with this user yet.</p>
                                    </div>
                                </div>
                            ) : (
                                messages.map((msg) => {
                                    const isMe = msg.senderId === currentUser.id;
                                    const timeStr = new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                                    return (
                                        <div key={msg.id} className={`flex max-w-[75%] ${isMe ? 'ml-auto justify-end' : 'mr-auto justify-start'}`}>
                                            {!isMe && (
                                                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex-shrink-0 flex items-center justify-center text-xs font-bold mr-2 self-end mb-5">
                                                    {(selectedUser?.name || 'Unknown').charAt(0).toUpperCase()}
                                                </div>
                                            )}

                                            <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                                                <div
                                                    className={`px-4 py-2 rounded-2xl ${isMe
                                                        ? 'bg-blue-600 text-white rounded-br-sm'
                                                        : 'bg-white border border-gray-200 text-gray-800 shadow-sm rounded-bl-sm'
                                                        }`}
                                                >
                                                    <p className="text-[15px] leading-relaxed break-words">{msg.text}</p>
                                                </div>
                                                <span className="text-[11px] text-gray-400 mt-1 px-1">
                                                    {timeStr}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Chat Input */}
                        <div className="p-3 bg-white border-t border-gray-200">
                            <div className="flex items-end gap-2 max-w-4xl mx-auto">
                                <div className="flex-1 relative">
                                    <textarea
                                        value={inputValue}
                                        onChange={(e) => setInputValue(e.target.value)}
                                        placeholder="Aa"
                                        className="w-full bg-gray-100 border-none rounded-3xl py-3 pl-4 pr-4 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 text-[15px] leading-tight max-h-32 min-h-[44px]"
                                        rows={1}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && !e.shiftKey) {
                                                e.preventDefault();
                                                handleSendMessage();
                                            }
                                        }}
                                    />
                                </div>
                                <button
                                    onClick={handleSendMessage}
                                    disabled={!inputValue.trim() || !selectedUser}
                                    className="mb-1 p-2.5 rounded-full text-blue-600 hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:hover:bg-transparent"
                                >
                                    <Send size={22} className={inputValue.trim() && selectedUser ? "fill-blue-600" : ""} />
                                </button>
                            </div>
                        </div>
                    </>
                ) : null}
            </div>
        </div>
    );
};

export default Messenger;
