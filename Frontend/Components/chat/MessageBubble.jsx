import React from 'react';
import { motion } from 'framer-motion';
import { User, Bot } from 'lucide-react';

export default function MessageBubble({ message, isUser, timestamp }) {
  return (
    <div className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <div className="flex-shrink-0 mr-3">
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
            <Bot className="w-4 h-4 text-blue-600" />
          </div>
        </div>
      )}
      <div className={`max-w-[85%] lg:max-w-[75%] ${isUser ? 'ml-auto' : ''}`}>
        <div className="flex items-center gap-2 mb-1 px-1">
          <span className={`text-xs font-medium ${isUser ? 'text-gray-600' : 'text-blue-600'}`}>{isUser ? 'You' : 'Ronna'}</span>
          <span className="text-xs text-gray-400">{timestamp ? new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}</span>
        </div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className={`rounded-2xl px-4 py-3 ${isUser ? 'bg-blue-600 text-white rounded-br-none' : 'bg-gray-100 text-gray-800 rounded-bl-none'}`}
        >
          <div className="prose prose-sm max-w-none">
            {typeof message === 'string'
              ? message.split('\n').map((paragraph, i) => (
                  <p key={i} className="mb-3 last:mb-0">{paragraph || <br />}</p>
                ))
              : message}
          </div>
        </motion.div>
      </div>
      {isUser && (
        <div className="flex-shrink-0 ml-3">
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
            <User className="w-4 h-4 text-blue-600" />
          </div>
        </div>
      )}
    </div>
  );
}