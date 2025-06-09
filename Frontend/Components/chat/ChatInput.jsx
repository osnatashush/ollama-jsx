import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Mic, Upload } from 'lucide-react';
import VoiceRecorder from './VoiceRecorder';
import FileUploader from './FileUploader';
import Button from "../ui/button";

function AnimatedDots() {
  const [dots, setDots] = useState('');
  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => (prev.length < 3 ? prev + '.' : ''));
    }, 400);
    return () => clearInterval(interval);
  }, []);
  return <span>{dots}</span>;
}

export default function ChatInput({ onSendMessage, onVoiceResponse, onVoiceUserLoading, disabled }) {
  const [message, setMessage] = useState('');
  const textareaRef = useRef(null);
  const [isFocused, setIsFocused] = useState(false);
  const [isRecording, setIsRecording] = useState(false);

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
      <div className="flex flex-col w-full">
        <div className="flex items-center gap-2 w-full">
          {isRecording ? (
            <div className="flex-1 h-12 min-h-[3rem] flex items-center justify-center rounded-lg bg-blue-50 text-blue-500 font-mono text-base animate-pulse">
              Recording <AnimatedDots />
            </div>
          ) : (
            <input
              id="ronna-input"
              ref={textareaRef}
              value={message}
              onChange={handleTextareaChange}
              onKeyDown={handleKeyDown}
              placeholder="Ask Ronna something"
              disabled={disabled}
              className={`flex-1 h-12 min-h-[3rem] rounded-lg border-none bg-gray-100 px-4 text-base text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-200 ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
              style={{ paddingTop: 0, paddingBottom: 0, transition: 'none' }}
            />
          )}

          <span className="text-blue-400"><VoiceRecorder onVoiceResponse={onVoiceResponse} onVoiceUserLoading={onVoiceUserLoading} disabled={disabled} isRecording={isRecording} setIsRecording={setIsRecording} /></span>
          <span className="text-blue-400"><FileUploader onFileUpload={handleFileUpload} disabled={disabled} /></span>
          <Button
            type="submit"
            disabled={!message.trim() || disabled}
            className="rounded-full bg-blue-100 hover:bg-blue-200 text-blue-400 px-4 py-2 transition disabled:opacity-50 disabled:cursor-not-allowed shadow flex items-center"
          >
            <Send className="w-4 h-4 text-blue-400" />
          </Button>
        </div>
      </div>
    </form>
  );
}