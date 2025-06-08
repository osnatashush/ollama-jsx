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
      // Simulate file upload process
      for (const file of files) {
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate upload delay
        
        // Here you would typically upload to your server
        console.log('Uploading file:', file.name);
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
        onFileUpload(files);
      }

    } catch (error) {
      setUploadStatus({
        type: 'error',
        message: 'Failed to upload files. Please try again.'
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
          {uploadStatus.type === 'success' ? (
            <div className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-2xl shadow animate-scale-in max-w-xs min-w-[180px] mx-auto">
              <CheckCircle className="w-4 h-4 text-white mr-2 animate-pulse-soft" />
              <span className="font-medium flex-1 truncate">{uploadStatus.message}</span>
              <button onClick={dismissStatus} className="ml-2 text-white hover:text-blue-200 focus:outline-none text-base">✕</button>
            </div>
          ) : (
            <Alert variant="destructive" className="relative">
              <div className="flex items-center gap-2">
                <X className="w-4 h-4" />
                <span className="flex-1">{uploadStatus.message}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={dismissStatus}
                  className="h-6 w-6 p-0"
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            </Alert>
          )}
        </div>
      )}
    </div>
  );
}