import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import { MessageCircle, X, Send } from 'lucide-react'; // Using lucide-react which is in package.json
import { BACKEND_URL } from '../lib/api';

const socket = io(BACKEND_URL); // Connect to backend server

const getBotResponse = (userMessage) => {
    const msg = userMessage.toLowerCase();
    if (msg.includes('hello') || msg.includes('hi')) {
        return 'Hello! How can I help you today?';
    } else if (msg.includes('how are you')) {
        return 'I\'m doing great, thanks for asking! How about you?';
    } else if (msg.includes('bye') || msg.includes('goodbye')) {
        return 'Goodbye! Have a nice day!';
    } else if (msg.includes('help')) {
        return 'I\'m here to assist you. You can ask me about the chat app or just chat!';
    } else {
        return 'That\'s interesting! Tell me more.';
    }
};

const Chatbot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const messagesEndRef = useRef(null);

    // Auto-scroll to bottom of messages
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        // Listen for incoming messages
        socket.on('receive_message', (data) => {
            setMessages((prevMessages) => [...prevMessages, data]);
        });

        // Cleanup listener on unmount
        return () => {
            socket.off('receive_message');
        };
    }, []);

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (inputValue.trim() !== '') {
            const messageData = {
                id: Date.now(),
                text: inputValue,
                sender: 'me', // To distinguish between 'me' and 'others'
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };

            // Emit message to server
            socket.emit('send_message', messageData);

            // Update local state
            setMessages((prev) => [...prev, messageData]);
            setInputValue('');

            // Simple bot response
            setTimeout(() => {
                const botResponse = getBotResponse(inputValue);
                if (botResponse) {
                    const botMessage = {
                        id: Date.now() + 1,
                        text: botResponse,
                        sender: 'bot',
                        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    };
                    setMessages((prev) => [...prev, botMessage]);
                }
            }, 1000); // Delay for realism
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50">
            {/* Chat Widget Toggle Button */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg transition-transform hover:scale-105 flex items-center justify-center"
                >
                    <MessageCircle size={28} />
                </button>
            )}

            {/* Chat Window */}
            {isOpen && (
                <div className="bg-white w-80 sm:w-96 rounded-2xl shadow-2xl border border-gray-100 flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 duration-300 h-[500px] max-h-[80vh]">
                    {/* Header */}
                    <div className="bg-blue-600 text-white p-4 flex justify-between items-center shadow-md z-10">
                        <div className="flex items-center space-x-2">
                            <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                            <h3 className="font-semibold text-lg">Chatbot</h3>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="text-blue-100 hover:text-white transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 p-4 overflow-y-auto bg-gray-50 flex flex-col space-y-3">
                        {messages.length === 0 ? (
                            <div className="flex-1 flex items-center justify-center text-gray-400 text-sm text-center px-4">
                                No messages yet.<br />Say hello to start the conversation!
                            </div>
                        ) : (
                            messages.map((msg) => (
                                <div
                                    key={msg.id}
                                    className={`flex flex-col max-w-[80%] ${msg.sender === 'me' ? 'self-end' : 'self-start'}`}
                                >
                                    <div
                                        className={`px-4 py-2 rounded-2xl ${msg.sender === 'me'
                                                ? 'bg-blue-600 text-white rounded-br-sm'
                                                : msg.sender === 'bot'
                                                ? 'bg-green-500 text-white rounded-bl-sm'
                                                : 'bg-white text-gray-800 border border-gray-100 shadow-sm rounded-bl-sm'
                                            }`}
                                    >
                                        <p className="text-sm break-words">{msg.text}</p>
                                    </div>
                                    <span className="text-[10px] text-gray-400 mt-1 px-1 flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}">
                                        {msg.timestamp}
                                    </span>
                                </div>
                            ))
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className="p-3 bg-white border-t border-gray-100">
                        <form onSubmit={handleSendMessage} className="flex relative">
                            <input
                                type="text"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                placeholder="Type a message..."
                                className="flex-1 bg-gray-100 text-gray-800 rounded-full px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-sm"
                            />
                            <button
                                type="submit"
                                disabled={!inputValue.trim()}
                                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:bg-gray-400 disabled:opacity-50 transition-colors flex items-center justify-center"
                            >
                                <Send size={16} />
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Chatbot;
