"use client";

import React, { useState, useRef } from 'react';
import { FileText, X, Upload, File, FolderOpen } from 'lucide-react';
import { useAttachments } from '@/hooks/useAttachments';

const DocumentPicker = ({ isOpen, onClose, conversationId, userId }) => {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const fileInputRef = useRef(null);
  
  const { selectDocuments } = useAttachments(conversationId, userId);

  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files);
    setSelectedFiles(prev => [...prev, ...files]);
  };

  const handleRemoveFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;

    setIsUploading(true);
    setUploadProgress({});

    try {
      const result = await selectDocuments(selectedFiles);
      console.log('Documents uploadés:', result);
      onClose();
      setSelectedFiles([]);
    } catch (error) {
      console.error('Erreur upload:', error);
    } finally {
      setIsUploading(false);
      setUploadProgress({});
    }
  };

  const handleDrop = (event) => {
    event.preventDefault();
    const files = Array.from(event.dataTransfer.files);
    setSelectedFiles(prev => [...prev, ...files]);
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const getFileIcon = (file) => {
    const extension = file.name.split('.').pop()?.toLowerCase();
    
    switch (extension) {
      case 'pdf':
        return <FileText size={20} className="text-red-500" />;
      case 'doc':
      case 'docx':
        return <FileText size={20} className="text-blue-500" />;
      case 'xls':
      case 'xlsx':
        return <FileText size={20} className="text-green-500" />;
      case 'ppt':
      case 'pptx':
        return <FileText size={20} className="text-orange-500" />;
      case 'txt':
        return <FileText size={20} className="text-gray-500" />;
      default:
        return <File size={20} className="text-gray-400" />;
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-[500px] max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Sélectionner des documents</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={20} />
          </button>
        </div>

        {/* Zone de drop */}
        <div
          className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center mb-4"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
        >
          <FolderOpen size={48} className="mx-auto text-gray-400 mb-2" />
          <p className="text-gray-600 mb-2">
            Glissez-déposez vos documents ici ou
          </p>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Parcourir les fichiers
          </button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.rtf"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>

        {/* Fichiers sélectionnés */}
        {selectedFiles.length > 0 && (
          <div className="mb-4">
            <h4 className="font-medium mb-2">Documents sélectionnés:</h4>
            <div className="space-y-2">
              {selectedFiles.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-100 rounded">
                  <div className="flex items-center flex-1">
                    {getFileIcon(file)}
                    <div className="ml-3 flex-1">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {file.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatFileSize(file.size)}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemoveFile(index)}
                    className="text-red-500 hover:text-red-700 ml-2"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            Annuler
          </button>
          <button
            onClick={handleUpload}
            disabled={selectedFiles.length === 0 || isUploading}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50 flex items-center"
          >
            {isUploading ? (
              <>
                <Upload size={16} className="mr-2 animate-pulse" />
                Upload en cours...
              </>
            ) : (
              <>
                <Upload size={16} className="mr-2" />
                Uploader ({selectedFiles.length})
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DocumentPicker;
