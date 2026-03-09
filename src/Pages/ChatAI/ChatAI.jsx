import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send, Bot, User, ArrowLeft } from 'lucide-react';

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

const ChatAI = () => {
    const navigate = useNavigate();
    const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const [currentUser, setCurrentUser] = useState(null);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        const userStr = localStorage.getItem('chat_user');
        if (!userStr) {
            navigate('/login');
            return;
        }
        setCurrentUser(JSON.parse(userStr));
    }, [navigate]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (inputValue.trim() !== '') {
            const userMessage = {
                id: Date.now(),
                text: inputValue,
                sender: 'me',
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };

            setMessages((prev) => [...prev, userMessage]);
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
            }, 1000);
        }
    };

    if (!currentUser) return null;

    return (
        <div className="flex flex-col h-[calc(100vh-64px)] bg-gray-50 overflow-hidden">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 p-4 flex items-center shadow-sm">
                <button
                    onClick={() => navigate('/')}
                    className="mr-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                    <ArrowLeft size={20} />
                </button>
                <div className="w-10 h-10 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mr-3">
                    <Bot size={24} />
                </div>
                <div>
                    <h2 className="font-semibold text-gray-800">AI Assistant</h2>
                    <p className="text-xs text-green-500 font-medium">Always Online</p>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 ? (
                    <div className="h-full flex items-center justify-center">
                        <div className="text-center p-8 bg-white rounded-3xl shadow-sm border border-gray-100 max-w-md">
                            <div className="w-20 h-20 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Bot size={40} />
                            </div>
                            <h3 className="text-xl font-bold text-gray-800 mb-2">Hello, {currentUser.name}!</h3>
                            <p className="text-gray-500">I'm your AI assistant. Ask me anything or just say hello to start!</p>
                        </div>
                    </div>
                ) : (
                    messages.map((msg) => (
                        <div
                            key={msg.id}
                            className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}
                        >
                            <div className={`flex flex-col max-w-[80%] ${msg.sender === 'me' ? 'items-end' : 'items-start'}`}>
                                <div
                                    className={`px-4 py-2 rounded-2xl ${msg.sender === 'me'
                                            ? 'bg-blue-600 text-white rounded-br-sm'
                                            : 'bg-white border border-gray-200 text-gray-800 shadow-sm rounded-bl-sm'
                                        }`}
                                >
                                    <p className="text-[15px] leading-relaxed break-words">{msg.text}</p>
                                </div>
                                <span className="text-[11px] text-gray-400 mt-1 px-1">
                                    {msg.timestamp}
                                </span>
                            </div>
                        </div>
                    ))
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 bg-white border-t border-gray-200">
                <form onSubmit={handleSendMessage} className="max-w-4xl mx-auto flex gap-2">
                    <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder="Ask me anything..."
                        className="flex-1 bg-gray-100 border-none rounded-full py-3 px-6 focus:outline-none focus:ring-2 focus:ring-purple-500 text-[15px]"
                    />
                    <button
                        type="submit"
                        disabled={!inputValue.trim()}
                        className="bg-purple-600 hover:bg-purple-700 text-white p-3 rounded-full shadow-lg transition-all hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center"
                    >
                        <Send size={20} />
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ChatAI;
