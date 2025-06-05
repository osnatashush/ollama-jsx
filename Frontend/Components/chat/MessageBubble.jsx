import React from 'react';
import { User, Bot } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

export default function MessageBubble({ message }) {
  const { role, content } = message;
  const isUser = role === 'user';

  return (
    <div className={`flex mb-4 ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex items-end max-w-lg ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        <div className={`p-2 rounded-full text-white ${isUser ? 'bg-blue-500 ml-2' : 'bg-slate-600 mr-2'}`}>
          {isUser ? <User size={18} /> : <Bot size={18} />}
        </div>
        <div
          className={`py-2 px-3 rounded-lg shadow ${
            isUser ? 'bg-blue-500 text-white' : 'bg-white text-gray-800 border border-gray-200'
          }`}
        >
          <div className="prose prose-sm max-w-none">
            <ReactMarkdown
              components={{
                p: ({node, ...props}) => <p {...props} />, 
              }}
            >
              {content}
            </ReactMarkdown>
          </div>
        </div>
      </div>
    </div>
  );
}