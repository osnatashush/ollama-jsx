import React, { useEffect, useRef } from 'react';
import MessageBubble from './MessageBubble';
import { Loader2, Bot } from 'lucide-react'; // Added Bot import here

export default function MessageList({ messages, isLoading }) {
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages, isLoading]);

  return (
    <div className="flex-grow p-4 space-y-4 overflow-y-auto h-[calc(100vh-200px)] bg-gray-50 rounded-lg border border-gray-200 custom-scrollbar">
      {messages.map((msg, index) => (
        <MessageBubble key={index} message={msg} />
      ))}
      {isLoading && (
        <div className="flex justify-start mb-4">
          <div className="flex items-end max-w-lg">
            <div className="p-2 rounded-full text-white bg-slate-600 mr-2">
              <Bot size={18} /> {/* This should now work */}
            </div>
            <div className="py-2 px-3 rounded-lg shadow bg-white text-gray-800 border border-gray-200">
              <Loader2 className="w-5 h-5 animate-spin text-slate-500" />
            </div>
          </div>
        </div>
      )}
      <div ref={messagesEndRef} />
       <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1; /* slate-300 */
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8; /* slate-500 */
        }
      `}</style>
    </div>
  );
}