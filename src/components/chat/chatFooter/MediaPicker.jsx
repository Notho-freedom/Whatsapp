"use client";

import React, { useState, useRef } from 'react';
import { Image, Video, X, Upload } from 'lucide-react';
import { useAttachments } from '@/hooks/useAttachments';

const MediaPicker = ({ isOpen, onClose, conversationId, userId }) => {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);
  
  const { selectMedia } = useAttachments(conversationId, userId);

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
    try {
      const result = await selectMedia(selectedFiles);
      console.log('Médias uploadés:', result);
      onClose();
      setSelectedFiles([]);
    } catch (error) {
      console.error('Erreur upload:', error);
    } finally {
      setIsUploading(false);
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96 max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Sélectionner des médias</h3>
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
          <Upload size={48} className="mx-auto text-gray-400 mb-2" />
          <p className="text-gray-600 mb-2">
            Glissez-déposez vos fichiers ici ou
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
            accept="image/*,video/*"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>

        {/* Fichiers sélectionnés */}
        {selectedFiles.length > 0 && (
          <div className="mb-4">
            <h4 className="font-medium mb-2">Fichiers sélectionnés:</h4>
            <div className="space-y-2">
              {selectedFiles.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-100 rounded">
                  <div className="flex items-center">
                    {file.type.startsWith('image/') ? (
                      <Image size={16} className="text-blue-500 mr-2" />
                    ) : (
                      <Video size={16} className="text-green-500 mr-2" />
                    )}
                    <span className="text-sm">{file.name}</span>
                  </div>
                  <button
                    onClick={() => handleRemoveFile(index)}
                    className="text-red-500 hover:text-red-700"
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
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {isUploading ? 'Upload en cours...' : `Uploader (${selectedFiles.length})`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MediaPicker;
