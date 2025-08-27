'use client';

import { useState, useRef } from 'react';
import { FaImage, FaVideo, FaFile, FaMicrophone, FaTimes, FaUpload } from 'react-icons/fa';

const MediaUpload = ({ conversationId, onMediaUpload, onClose }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setSelectedFile(file);

    // Créer un aperçu pour les images
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target.result);
      reader.readAsDataURL(file);
    } else {
      setPreview(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !conversationId) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('conversationId', conversationId);

      const response = await fetch('/api/media/upload', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        const result = await response.json();
        
        // Appeler le callback avec le média uploadé
        onMediaUpload({
          type: 'media',
          media: [result.media], // Structure attendue : tableau de médias
          text: `📎 ${selectedFile.name}`,
          sender: 'me',
          timestamp: new Date(),
          date: new Date().toLocaleDateString('fr-FR')
        });

        // Réinitialiser
        setSelectedFile(null);
        setPreview(null);
        setUploadProgress(0);
        onClose();
      } else {
        const error = await response.json();
        console.error('Erreur upload:', error);
        alert('Erreur lors de l\'upload du fichier');
      }
    } catch (error) {
      console.error('Erreur upload:', error);
      alert('Erreur lors de l\'upload du fichier');
    } finally {
      setIsUploading(false);
    }
  };

  const getFileIcon = (file) => {
    if (file.type.startsWith('image/')) return <FaImage className="text-blue-500" />;
    if (file.type.startsWith('video/')) return <FaVideo className="text-red-500" />;
    if (file.type.startsWith('audio/')) return <FaMicrophone className="text-green-500" />;
    return <FaFile className="text-gray-500" />;
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96 max-w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Envoyer un média</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            disabled={isUploading}
          >
            <FaTimes size={20} />
          </button>
        </div>

        {!selectedFile ? (
          <div className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <FaUpload className="mx-auto text-gray-400 mb-4" size={48} />
              <p className="text-gray-600 mb-4">
                Glissez-déposez un fichier ici ou cliquez pour sélectionner
              </p>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Sélectionner un fichier
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center justify-center p-4 border rounded-lg hover:bg-gray-50"
              >
                <FaImage className="mr-2 text-blue-500" />
                Image
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center justify-center p-4 border rounded-lg hover:bg-gray-50"
              >
                <FaVideo className="mr-2 text-red-500" />
                Vidéo
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center justify-center p-4 border rounded-lg hover:bg-gray-50"
              >
                <FaFile className="mr-2 text-gray-500" />
                Document
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center justify-center p-4 border rounded-lg hover:bg-gray-50"
              >
                <FaMicrophone className="mr-2 text-green-500" />
                Audio
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="border rounded-lg p-4">
              <div className="flex items-center space-x-3">
                {getFileIcon(selectedFile)}
                <div className="flex-1">
                  <p className="font-medium">{selectedFile.name}</p>
                  <p className="text-sm text-gray-500">
                    {formatFileSize(selectedFile.size)}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setSelectedFile(null);
                    setPreview(null);
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <FaTimes />
                </button>
              </div>

              {preview && (
                <div className="mt-4">
                  <img
                    src={preview}
                    alt="Aperçu"
                    className="max-w-full h-32 object-cover rounded"
                  />
                </div>
              )}
            </div>

            {isUploading && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Upload en cours...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
              </div>
            )}

            <div className="flex space-x-3">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                disabled={isUploading}
              >
                Annuler
              </button>
              <button
                onClick={handleUpload}
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
                disabled={isUploading}
              >
                {isUploading ? 'Upload...' : 'Envoyer'}
              </button>
            </div>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileSelect}
          accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt"
          className="hidden"
        />
      </div>
    </div>
  );
};

export default MediaUpload;
