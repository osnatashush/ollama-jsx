import React, { useState, useRef } from 'react';
import Button from '../ui/button';
import Textarea from '../ui/textarea';
import { Send } from 'lucide-react';
import VoiceRecorder from './VoiceRecorder';
import FileUploader from './FileUploader';


export default function ChatInput({ onSendMessage, disabled }) {
  const [message, setMessage] = useState('');
  const [isComposing, setIsComposing] = useState(false);
  const textareaRef = useRef(null);

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
    <div className="relative">
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="glass-effect rounded-2xl p-4 border border-white/10">
          <Textarea
            ref={textareaRef}
            value={message}
            onChange={handleTextareaChange}
            onKeyDown={handleKeyDown}
            placeholder="Ask Ronna anything..."
            disabled={disabled}
            className="w-full h-12 border-none bg-transparent p-0 focus-visible:ring-0 resize-none min-h-[40px] max-h-[120px] text-base placeholder:text-blue-400 placeholder:font-medium placeholder:opacity-80"
            style={{ height: 'auto' }}
          />
          
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/10">
            <div className="flex items-center gap-2">
              <VoiceRecorder 
                onTranscription={handleVoiceTranscription}
                disabled={disabled}
              />
              <FileUploader 
                onFileUpload={handleFileUpload}
                disabled={disabled}
              />
            </div>
            
            <Button
              type="submit"
              disabled={!message.trim() || disabled}
              size="icon"
              className="shrink-0"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}