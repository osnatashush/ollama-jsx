import React, { useEffect, useRef } from 'react';
import MessageBubble from './MessageBubble';

export default function MessageList({ messages, isLoading }) {
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="flex-1 flex flex-col overflow-y-auto px-4 py-6">
      <div className="max-w-4xl mx-auto space-y-6 flex-1 flex flex-col justify-end">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-[60vh] text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-blue-400 to-cyan-300 flex items-center justify-center shadow-lg">
              <span className="text-3xl font-bold text-blue-900">R</span>
            </div>
            <h3 className="text-2xl font-extrabold text-blue-900 mb-2">Hello! I'm Ronna</h3>
            <p className="text-blue-700 max-w-lg mx-auto text-lg font-medium">
              I'm here to help you with questions, tasks, and conversations.<br />
              You can type, speak, or upload files to get started.
            </p>
          </div>
        )}

        {messages.map((message, index) => (
          <MessageBubble
            key={index}
            message={message.text}
            isUser={message.isUser}
            timestamp={message.timestamp}
          />
        ))}

        {isLoading && (
          <div className="flex gap-3">
            <div className="glass-effect border border-white/20 w-8 h-8 rounded-full flex items-center justify-center">
              <div className="w-4 h-4 border-2 border-blue-300 border-t-transparent rounded-full animate-spin"></div>
            </div>
            <div className="glass-effect border border-white/10 px-4 py-3 rounded-2xl rounded-tl-md">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-blue-300 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-blue-300 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-blue-300 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} className="h-0" />
      </div>
    </div>
  );
}