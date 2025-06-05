import React, { useState } from 'react';
import { Send, CornerDownLeft } from 'lucide-react';
import Button from '../ui/button';
import Textarea from '../ui/textarea';

export default function ChatInput({ onSendMessage, isLoading }) {
  const [inputValue, setInputValue] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputValue.trim() && !isLoading) {
      onSendMessage(inputValue.trim());
      setInputValue('');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 border-t border-gray-200 bg-white rounded-b-lg">
      <div className="flex items-start space-x-3">
        <Textarea
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type your message to local Mistral..."
          className="flex-grow resize-none focus:ring-blue-500 border-gray-300 rounded-md shadow-sm p-3 min-h-[60px]"
          rows={Math.min(5, inputValue.split('\n').length)}
          disabled={isLoading}
        />
        <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 self-end" disabled={isLoading || !inputValue.trim()}>
          <Send size={18} />
          <span className="sr-only">Send</span>
        </Button>
      </div>
      <p className="text-xs text-gray-400 mt-2 flex items-center">
        <CornerDownLeft size={12} className="mr-1" /> Shift+Enter for new line. Enter to send.
      </p>
    </form>
  );
}