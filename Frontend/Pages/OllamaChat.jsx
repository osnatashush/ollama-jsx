import React, { useState } from 'react';
import MessageList from '../Components/chat/MessageList';
import ChatInput from '../Components/chat/ChatInput';

const logoSvg = (
  <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="40" height="40" rx="12" fill="#2563eb"/>
    <text x="50%" y="55%" textAnchor="middle" fill="white" fontSize="18" fontFamily="Inter, Arial, sans-serif" fontWeight="bold" dy=".3em">R</text>
  </svg>
);

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
    <div className="flex flex-col min-h-screen bg-[#f7f8fa] font-sans">
      {/* Header */}
      <header className="w-full bg-white shadow-sm border-b border-gray-100 sticky top-0 z-20">
        <div className="flex items-center max-w-3xl mx-auto px-4 py-3">
          <span className="h-10 w-10 rounded-full mr-3" aria-label="Ronna.ai Logo">{logoSvg}</span>
          <span className="text-xl font-semibold text-gray-900 tracking-tight">ronna.ai</span>
        </div>
      </header>

      {/* Chat area */}
      <main className="flex-1 flex flex-col items-center justify-between w-full">
        {messages.length === 0 ? (
          // Welcome and input at the top
          <section className="w-full flex flex-col items-center pt-12 pb-8">
            <div className="mb-6 text-center">
              <h2 className="text-3xl sm:text-4xl font-bold text-blue-700 mb-2">How can I help you today?</h2>
            </div>
            <div className="w-full max-w-md px-2 sm:px-0">
              <ChatInput onSendMessage={handleSendMessage} disabled={isLoading} centered />
            </div>
          </section>
        ) : (
          // Normal chat and input at bottom
          <>
            <div className="w-full max-w-3xl flex-1 flex flex-col px-2 sm:px-4 pt-6 pb-36">
              <MessageList messages={messages} isLoading={isLoading} />
            </div>
            <div className="fixed bottom-4 left-0 w-full flex flex-col items-center z-30 pointer-events-none">
              <div className="w-full max-w-3xl px-2 sm:px-4 pointer-events-auto">
                <ChatInput onSendMessage={handleSendMessage} disabled={isLoading} />
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}