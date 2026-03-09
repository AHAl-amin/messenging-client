import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, Bot } from 'lucide-react';

function Banner() {
  const navigate = useNavigate();

  const handleButtonClick = (path) => {
    const userStr = localStorage.getItem('chat_user');
    if (!userStr) {
      navigate('/login');
    } else {
      navigate(path);
    }
  };

  return (
    <div className="bg-white py-20 px-6">
      <div className="container mx-auto text-center">
        <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
          Welcome to <span className="text-blue-600">ChatBot</span>
        </h1>
        <p className="text-lg text-gray-600 mb-10 max-w-2xl mx-auto">
          Connect with your friends or chat with our intelligent AI. Choose your preferred way to communicate.
        </p>
        <div className="flex flex-col md:flex-row justify-center items-center gap-6">
          <button
            onClick={() => handleButtonClick('/messenger')}
            className="flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-700 text-white text-xl font-semibold py-4 px-8 rounded-2xl shadow-lg transition-all hover:scale-105 w-full md:w-auto"
          >
            <MessageSquare size={24} />
            Chat with Friend
          </button>
          <button
            onClick={() => handleButtonClick('/chat-ai')}
            className="flex items-center justify-center gap-3 bg-purple-600 hover:bg-purple-700 text-white text-xl font-semibold py-4 px-8 rounded-2xl shadow-lg transition-all hover:scale-105 w-full md:w-auto"
          >
            <Bot size={24} />
            Chat with AI
          </button>
        </div>
      </div>
    </div>
  );
}

export default Banner;
