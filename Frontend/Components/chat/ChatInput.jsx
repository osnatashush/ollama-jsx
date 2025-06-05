import React, { useState, useRef } from 'react';
import { Send, CornerDownLeft } from 'lucide-react';
import Button from '../ui/button';
import Textarea from '../ui/textarea';

export default function ChatInput({ onSendMessage, isLoading }) {
  const [inputValue, setInputValue] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const fileInputRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputValue.trim() && !isLoading && !uploading) {
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

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    setUploadSuccess(false);
    const formData = new FormData();
    formData.append('file', file);
    try {
      const response = await fetch('http://localhost:8006/upload', {
        method: 'POST',
        body: formData
      });
      if (!response.ok) {
        throw new Error('Failed to upload file');
      }
      setUploadSuccess(true);
      setTimeout(() => setUploadSuccess(false), 3500);
    } catch (err) {
      alert('File upload failed: ' + err.message);
    } finally {
      setUploading(false);
      e.target.value = '';
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
          disabled={isLoading || uploading}
        />
        <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 self-end flex items-center" disabled={isLoading || uploading || !inputValue.trim()}>
          <Send size={18} />
          <span className="sr-only">Send</span>
        </Button>
        <div className="self-end ml-2 flex items-center" title="Upload PDF">
          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf"
            style={{ display: 'none' }}
            onChange={handleFileChange}
            disabled={isLoading || uploading}
          />
          <button
            type="button"
            className={`bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded text-xs font-medium transition-colors duration-150 ${uploading ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
            disabled={isLoading || uploading}
            onClick={() => !uploading && fileInputRef.current && fileInputRef.current.click()}
          >
            {uploading ? 'Uploading...' : 'Upload PDF'}
          </button>
        </div>
      </div>
      {uploadSuccess && (
        <div className="text-green-600 mt-1 text-xs font-medium">
          File uploaded successfully!
        </div>
      )}
      <p className="text-xs text-gray-400 mt-2 flex items-center">
        <CornerDownLeft size={12} className="mr-1" /> Shift+Enter for new line. Enter to send.
      </p>
    </form>
  );
}