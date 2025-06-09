import React, { useRef, useState } from 'react';
import Button from '../ui/button';
import Alert from '../ui/alert';
import { Upload, File, CheckCircle, X } from 'lucide-react';

export default function FileUploader({ onFileUpload, disabled }) {
  const fileInputRef = useRef(null);
  const [uploadStatus, setUploadStatus] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleFileSelect = async (event) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;

    setUploading(true);
    setUploadStatus(null);

    try {
      // Upload files to backend
      const formData = new FormData();
      formData.append('file', files[0]);

      const response = await fetch('http://localhost:8006/upload', {
        method: 'POST',
        body: formData
      });

      let data = null;
      if (response.ok) {
        data = await response.json();
      } else {
        // Try to get error message from backend, else fallback
        let backendMsg = '';
        try {
          backendMsg = await response.text();
        } catch {}
        throw new Error(backendMsg || `Failed to upload files. (HTTP ${response.status})`);
      }

      setUploadStatus({
        type: 'success',
        message: files.length > 1 ? `Uploaded ${files.length} files!` : 'Uploaded!'
      });
      // Auto-dismiss after 3 seconds
      setTimeout(() => {
        setUploadStatus(null);
      }, 3000);

      if (onFileUpload) {
        onFileUpload(data.files || files);
      }

    } catch (error) {
      setUploadStatus({
        type: 'error',
        message: 'Upload failed.'
      });
    } finally {
      setUploading(false);
      // Clear the input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const dismissStatus = () => {
    setUploadStatus(null);
  };

  return (
    <div className="relative">
      <input
        ref={fileInputRef}
        type="file"
        multiple
        onChange={handleFileSelect}
        className="hidden"
        accept=".txt,.pdf,.doc,.docx,.png,.jpg,.jpeg"
      />
      
      <Button
        variant="secondary"
        size="icon"
        onClick={() => fileInputRef.current?.click()}
        disabled={disabled || uploading}
        className={uploading ? 'animate-pulse-soft' : ''}
      >
        {uploading ? (
          <div className="w-4 h-4 border-2 border-blue-300 border-t-transparent rounded-full animate-spin"></div>
        ) : (
          <Upload className="w-4 h-4" />
        )}
      </Button>

      {uploadStatus && (
        <div className="absolute bottom-full mb-2 left-0 right-0 z-50 flex justify-center">
          <div className={`flex items-center px-4 py-2 rounded-2xl shadow animate-scale-in max-w-xs min-w-[180px] mx-auto ${uploadStatus.type === 'success' ? 'bg-blue-600 text-white' : 'bg-red-600 text-white'}`}>
            {uploadStatus.type === 'success' ? (
              <CheckCircle className="w-4 h-4 text-white mr-2 animate-pulse-soft" />
            ) : (
              <X className="w-4 h-4 text-white mr-2 animate-pulse-soft" />
            )}
            <span className="font-medium flex-1 truncate">{uploadStatus.message}</span>
            <button onClick={dismissStatus} className="ml-2 text-white hover:text-blue-200 focus:outline-none text-base">✕</button>
          </div>
        </div>
      )}
    </div>
  );
}