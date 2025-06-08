import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Mic, Upload } from 'lucide-react';
import VoiceRecorder from './VoiceRecorder';
import FileUploader from './FileUploader';
import Button from "../ui/button";

export default function ChatInput({ onSendMessage, disabled }) {
  const [message, setMessage] = useState('');
  const textareaRef = useRef(null);
  const [isFocused, setIsFocused] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSendMessage(message.trim());
      setMessage('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleVoiceTranscription = (transcription) => {
    setMessage(prev => prev + (prev ? ' ' : '') + transcription);
    textareaRef.current?.focus();
  };

  const handleFileUpload = (files) => {
    // Handle uploaded files - you can add logic here to process the files
    console.log('Files uploaded:', files);
  };

  const handleTextareaChange = (e) => {
    setMessage(e.target.value);
    // Auto-resize textarea
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-end gap-2 bg-blue-100 rounded-xl px-4 py-3 shadow-lg mb-4 mx-2 sm:mx-0"
      style={{ position: 'relative' }}
    >
      <div className="flex flex-col flex-1">
        <label htmlFor="ronna-input" className="text-blue-500 text-sm font-semibold mb-1 text-left cursor-pointer">Ask Ronna something</label>
        <input
          id="ronna-input"
          ref={textareaRef}
          value={message}
          onChange={handleTextareaChange}
          onKeyDown={handleKeyDown}
          placeholder=""
          disabled={disabled}
          className={`w-full h-12 border-none bg-transparent p-0 focus:outline-none focus:ring-0 text-base text-blue-700 ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          style={{}}
        />
      </div>
      <div className="flex flex-col gap-1 items-end justify-end">
        <div className="flex gap-1 mb-1">
          <span className="text-blue-400"><VoiceRecorder onTranscription={handleVoiceTranscription} disabled={disabled} /></span>
          <span className="text-blue-400"><FileUploader onFileUpload={handleFileUpload} disabled={disabled} /></span>
        </div>
        <Button
          type="submit"
          disabled={!message.trim() || disabled}
          className="rounded-full bg-blue-100 hover:bg-blue-200 text-blue-400 px-4 py-2 transition disabled:opacity-50 disabled:cursor-not-allowed shadow"
        >
          <Send className="w-5 h-5 text-blue-400" />
        </Button>
      </div>
    </form>
  );
}