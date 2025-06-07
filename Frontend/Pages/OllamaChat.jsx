import React, { useState } from 'react';
import MessageList from '../Components/chat/MessageList';
import ChatInput from '../Components/chat/ChatInput';

export default function OllamaChat() {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async (messageText) => {
    // Add user message
    const userMessage = {
      text: messageText,
      isUser: true,
      timestamp: new Date().toISOString()
    };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // Send request to backend
      const response = await fetch('http://localhost:8006/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: messageText })
      });
      if (!response.ok) throw new Error('Network response was not ok');
      const data = await response.json();
      const aiResponse = {
        text: data.answer || data.response || data.text || 'Ronna could not generate a response.',
        isUser: false,
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, aiResponse]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = {
        text: "I apologize, but I'm having trouble responding right now. Please try again.",
        isUser: false,
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full min-h-[80vh] w-full">
      {/* Chat messages area */}
      <div className="flex-1 overflow-y-auto">
        <MessageList messages={messages} isLoading={isLoading} />
      </div>
      {/* Input area */}
      <div className="shrink-0 border-t border-white/10 bg-gradient-to-t from-slate-900/30 to-transparent rounded-b-3xl">
        <div className="max-w-2xl mx-auto p-2">
          <ChatInput 
            onSendMessage={handleSendMessage}
            disabled={isLoading}
          />
        </div>
      </div>
    </div>
  );
}