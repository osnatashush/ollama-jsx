import React from 'react';

export default function MessageBubble({ message, isUser, timestamp }) {
  return (
    <div className={`flex w-full mb-2 ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[75%] px-4 py-3 rounded-2xl shadow-lg text-base animate-scale-in
          ${isUser
            ? 'bg-gradient-to-br from-blue-600 to-blue-400 text-white rounded-br-md'
            : 'glass-effect text-blue-900 rounded-bl-md border border-white/10 backdrop-blur-xl bg-white/30'}
        `}
      >
        <div className="mb-1 flex items-center gap-2">
          <span className={`font-semibold text-xs ${isUser ? 'text-blue-100' : 'text-blue-500'}`}>{isUser ? 'You' : 'Ronna'}</span>
          <span className="text-xs text-blue-200/70">{timestamp && new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
        <div className="whitespace-pre-line leading-relaxed">
          {message}
        </div>
      </div>
    </div>
  );
}