"use client"

import { useState, useEffect, useRef } from 'react';
import Button from '../../components/button';
import Input from '../../components/Input';

const ChatPage = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hello! How can I help you today?",
      sender: 'receiver',
      timestamp: '10:30 AM'
    },
    {
      id: 2,
      text: "Hi! I need to refill my prescription.",
      sender: 'user',
      timestamp: '10:32 AM'
    },
    {
      id: 3,
      text: "Of course! Can you provide your prescription number?",
      sender: 'receiver',
      timestamp: '10:33 AM'
    },
    {
      id: 4,
      text: "Sure, it's RX-123456789",
      sender: 'user',
      timestamp: '10:34 AM'
    },
    {
      id: 5,
      text: "Thank you! I've found your prescription. Would you like to pick it up or have it delivered?",
      sender: 'receiver',
      timestamp: '10:35 AM'
    }
  ]);

  const [inputMessage, setInputMessage] = useState('');
  const messagesContainerRef = useRef(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = () => {
    if (inputMessage.trim() === '') return;

    const newMessage = {
      id: messages.length + 1,
      text: inputMessage,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
    };

    setMessages([...messages, newMessage]);
    setInputMessage('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col" style={{ 
      backgroundColor: 'var(--color-remedy-primary)',
      height: '100vh',
      width: '100vw',
      overflow: 'hidden'
    }}>
      {/* Chat Header */}
      <div className="flex-shrink-0 p-4" style={{ 
        backgroundColor: 'var(--color-remedy-primary)',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)'
      }}>
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <div 
            className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold text-white"
            style={{ backgroundColor: '#3AAFA9' }}
          >
            RX
          </div>
          <div>
            <h2 className="text-xl font-semibold" style={{ color: 'var(--color-remedy-secondary)' }}>
              RemedyRX Support
            </h2>
            <p className="text-sm" style={{ color: '#555555' }}>
              Online
            </p>
          </div>
        </div>
      </div>

      {/* Messages Container */}
      <div 
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto p-4" 
        style={{ minHeight: 0 }}
      >
        <div className="max-w-4xl mx-auto space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs md:max-w-md lg:max-w-lg px-4 py-3 rounded-2xl ${
                  message.sender === 'user' ? 'rounded-br-none' : 'rounded-bl-none'
                }`}
                style={{
                  backgroundColor: message.sender === 'user' ? '#3AAFA9' : 'var(--color-remedy-primary)',
                  color: message.sender === 'user' ? 'white' : 'var(--color-remedy-secondary)',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
                }}
              >
                <p className="text-sm md:text-base break-words">{message.text}</p>
                <p 
                  className="text-xs mt-1"
                  style={{ 
                    color: message.sender === 'user' ? 'rgba(255, 255, 255, 0.7)' : '#555555',
                    textAlign: message.sender === 'user' ? 'right' : 'left'
                  }}
                >
                  {message.timestamp}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Input Area */}
      <div className="flex-shrink-0 p-4" style={{ 
        backgroundColor: 'var(--color-remedy-primary)',
        boxShadow: '0 -2px 10px rgba(0, 0, 0, 0.1)'
      }}>
        <div className="max-w-4xl mx-auto flex gap-2">
          <input
            type="text"
            placeholder="Type a message..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1 px-4 py-3 rounded-full focus:outline-none transition-all duration-200"
            style={{
              backgroundColor: 'var(--color-remedy-primary)',
              color: 'var(--color-remedy-secondary)',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
            }}
          />
          <Button onClick={handleSendMessage}>
            Send
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;