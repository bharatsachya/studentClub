import React, { useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';

interface DragDropUploadProps {
  onFileSelect: (file: File) => void;
  acceptedTypes?: string[];
  maxSize?: number; // in MB
  multiple?: boolean;
  className?: string;
  children?: React.ReactNode;
}

const DragDropUpload: React.FC<DragDropUploadProps> = ({
  onFileSelect,
  acceptedTypes = ['image/*'],
  maxSize = 5, // 5MB default
  multiple = false,
  className = '',
  children
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [error, setError] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Validate file
  const validateFile = (file: File): string | null => {
    // Check file type
    if (acceptedTypes.length > 0) {
      const isValidType = acceptedTypes.some(type => {
        if (type.endsWith('/*')) {
          return file.type.startsWith(type.replace('*', ''));
        }
        return file.type === type;
      });
      
      if (!isValidType) {
        return `File type not supported. Accepted types: ${acceptedTypes.join(', ')}`;
      }
    }

    // Check file size
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > maxSize) {
      return `File size too large. Maximum size: ${maxSize}MB`;
    }

    return null;
  };

  // Handle file selection
  const handleFiles = useCallback((files: FileList) => {
    setError('');
    const filesArray = Array.from(files);
    
    for (const file of filesArray) {
      const validationError = validateFile(file);
      if (validationError) {
        setError(validationError);
        return;
      }
    }

    if (multiple) {
      setUploadedFiles(prev => [...prev, ...filesArray]);
      filesArray.forEach(file => onFileSelect(file));
    } else {
      const file = filesArray[0];
      if (file) {
        setUploadedFiles([file]);
        onFileSelect(file);
      }
    }
  }, [maxSize, acceptedTypes, multiple, onFileSelect]);

  // Drag handlers
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFiles(files);
    }
  };

  // Click handler for file input
  const handleClick = () => {
    fileInputRef.current?.click();
  };

  // File input change handler
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      handleFiles(files);
    }
  };

  // Remove file
  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={`w-full ${className}`}>
      {/* Drag and drop area */}
      <motion.div
        onClick={handleClick}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer
          transition-all duration-300 ease-in-out
          ${isDragOver 
            ? 'border-blue-400 bg-blue-50 scale-105' 
            : 'border-gray-300 bg-gray-50 hover:border-gray-400 hover:bg-gray-100'
          }
        `}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        {children || (
          <div className="flex flex-col items-center space-y-4">
            {/* Upload icon */}
            <motion.div
              animate={{ 
                y: isDragOver ? [-5, 5, -5] : [0],
                rotate: isDragOver ? [0, 5, -5, 0] : [0]
              }}
              transition={{ 
                duration: isDragOver ? 0.6 : 0,
                repeat: isDragOver ? Infinity : 0
              }}
              className={`
                w-16 h-16 rounded-full flex items-center justify-center
                ${isDragOver ? 'bg-blue-100' : 'bg-gray-200'}
              `}
            >
              <svg
                className={`w-8 h-8 ${isDragOver ? 'text-blue-600' : 'text-gray-500'}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
            </motion.div>

            {/* Text */}
            <div>
              <p className={`text-lg font-medium ${isDragOver ? 'text-blue-600' : 'text-gray-700'}`}>
                {isDragOver ? 'Drop files here' : 'Drag & drop files here'}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                or click to browse
              </p>
            </div>

            {/* File info */}
            <div className="text-xs text-gray-400">
              <p>Supported: {acceptedTypes.join(', ')}</p>
              <p>Max size: {maxSize}MB {multiple ? '• Multiple files allowed' : ''}</p>
            </div>
          </div>
        )}

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept={acceptedTypes.join(',')}
          multiple={multiple}
          onChange={handleFileInputChange}
        />
      </motion.div>

      {/* Error message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-3 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm"
        >
          {error}
        </motion.div>
      )}

      {/* Uploaded files preview */}
      {uploadedFiles.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 space-y-2"
        >
          <h4 className="text-sm font-medium text-gray-700">
            Uploaded Files ({uploadedFiles.length})
          </h4>
          
          <div className="space-y-2">
            {uploadedFiles.map((file, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  {/* File icon */}
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    {file.type.startsWith('image/') ? (
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    )}
                  </div>

                  {/* File info */}
                  <div>
                    <p className="text-sm font-medium text-gray-900 truncate max-w-48">
                      {file.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                </div>

                {/* Remove button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile(index);
                  }}
                  className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default DragDropUpload;