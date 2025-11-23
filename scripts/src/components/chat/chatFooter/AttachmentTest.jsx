"use client";

import React, { useState, useEffect } from 'react';
import { useAttachments } from '@/hooks/useAttachments';
import { 
  Image, 
  Camera, 
  FileText, 
  User, 
  BarChart3, 
  PenTool 
} from 'lucide-react';

const AttachmentTest = ({ conversationId, userId }) => {
  const [testData, setTestData] = useState({});
  const [results, setResults] = useState({});
  
  const {
    isLoading,
    error,
    attachments,
    selectMedia,
    capturePhoto,
    recordVideo,
    selectDocuments,
    shareContact,
    createPoll,
    createDrawing,
    refreshAttachments,
    getAttachmentStats,
    checkPermissions,
    clearError
  } = useAttachments(conversationId, userId);

  const handleTestAction = async (action, data) => {
    try {
      let result;
      
      switch (action) {
        case 'select-media':
          // Simuler la sélection de fichiers
          const files = [
            new File(['test image content'], 'test-image.jpg', { type: 'image/jpeg' }),
            new File(['test video content'], 'test-video.mp4', { type: 'video/mp4' })
          ];
          result = await selectMedia(files);
          break;
          
        case 'capture-photo':
          // Simuler la capture d'une photo
          const imageBlob = new Blob(['test photo content'], { type: 'image/jpeg' });
          result = await capturePhoto(imageBlob, { test: true });
          break;
          
        case 'record-video':
          // Simuler l'enregistrement d'une vidéo
          const videoBlob = new Blob(['test video content'], { type: 'video/mp4' });
          result = await recordVideo(videoBlob, { test: true });
          break;
          
        case 'select-documents':
          // Simuler la sélection de documents
          const docFiles = [
            new File(['test document content'], 'test-doc.pdf', { type: 'application/pdf' }),
            new File(['test text content'], 'test-text.txt', { type: 'text/plain' })
          ];
          result = await selectDocuments(docFiles);
          break;
          
        case 'share-contact':
          // Simuler le partage d'un contact
          const contactData = {
            first_name: 'Test',
            last_name: 'Contact',
            phone_number: '+33123456789',
            email: 'test@example.com',
            profile_picture_url: 'https://via.placeholder.com/150'
          };
          result = await shareContact(contactData);
          break;
          
        case 'create-poll':
          // Simuler la création d'un sondage
          const pollData = {
            question: 'Test de sondage?',
            options: ['Option 1', 'Option 2', 'Option 3'],
            allow_multiple: false,
            expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24h
          };
          result = await createPoll(pollData);
          break;
          
        case 'create-drawing':
          // Simuler la création d'un dessin
          const drawingBlob = new Blob(['test drawing content'], { type: 'image/png' });
          const drawingData = {
            title: 'Test Drawing',
            description: 'Un dessin de test',
            tags: ['test', 'dessin'],
            imageBlob: drawingBlob
          };
          result = await createDrawing(drawingData);
          break;
          
        default:
          result = { error: 'Action non reconnue' };
      }
      
      setResults(prev => ({
        ...prev,
        [action]: result
      }));
      
    } catch (err) {
      setResults(prev => ({
        ...prev,
        [action]: { error: err.message }
      }));
    }
  };

  const handleRefreshAttachments = async () => {
    try {
      const result = await refreshAttachments();
      setResults(prev => ({
        ...prev,
        refresh: result
      }));
    } catch (err) {
      setResults(prev => ({
        ...prev,
        refresh: { error: err.message }
      }));
    }
  };

  const handleGetStats = async () => {
    try {
      const stats = await getAttachmentStats();
      setResults(prev => ({
        ...prev,
        stats: stats
      }));
    } catch (err) {
      setResults(prev => ({
        ...prev,
        stats: { error: err.message }
      }));
    }
  };

  const handleCheckPermissions = async (type) => {
    try {
      const permissions = await checkPermissions(type);
      setResults(prev => ({
        ...prev,
        [`permissions-${type}`]: permissions
      }));
    } catch (err) {
      setResults(prev => ({
        ...prev,
        [`permissions-${type}`]: { error: err.message }
      }));
    }
  };

  if (!conversationId || !userId) {
    return (
      <div className="p-4 bg-yellow-100 border border-yellow-400 rounded">
        <p className="text-yellow-800">
          ID de conversation et ID utilisateur requis pour tester les attachements
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 bg-gray-100 border border-gray-300 rounded">
      <h3 className="text-lg font-semibold mb-4">Test des Attachements</h3>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 rounded">
          <p className="text-red-800">Erreur: {error}</p>
          <button 
            onClick={clearError}
            className="mt-2 px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Effacer l'erreur
          </button>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 mb-4">
        <button
          onClick={() => handleTestAction('select-media')}
          disabled={isLoading}
          className="flex items-center gap-2 p-3 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          <Image size={16} />
          Tester Sélection Médias
        </button>

        <button
          onClick={() => handleTestAction('capture-photo')}
          disabled={isLoading}
          className="flex items-center gap-2 p-3 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
        >
          <Camera size={16} />
          Tester Capture Photo
        </button>

        <button
          onClick={() => handleTestAction('record-video')}
          disabled={isLoading}
          className="flex items-center gap-2 p-3 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:opacity-50"
        >
          <Camera size={16} />
          Tester Enregistrement Vidéo
        </button>

        <button
          onClick={() => handleTestAction('select-documents')}
          disabled={isLoading}
          className="flex items-center gap-2 p-3 bg-orange-500 text-white rounded hover:bg-orange-600 disabled:opacity-50"
        >
          <FileText size={16} />
          Tester Sélection Documents
        </button>

        <button
          onClick={() => handleTestAction('share-contact')}
          disabled={isLoading}
          className="flex items-center gap-2 p-3 bg-teal-500 text-white rounded hover:bg-teal-600 disabled:opacity-50"
        >
          <User size={16} />
          Tester Partage Contact
        </button>

        <button
          onClick={() => handleTestAction('create-poll')}
          disabled={isLoading}
          className="flex items-center gap-2 p-3 bg-indigo-500 text-white rounded hover:bg-indigo-600 disabled:opacity-50"
        >
          <BarChart3 size={16} />
          Tester Création Sondage
        </button>

        <button
          onClick={() => handleTestAction('create-drawing')}
          disabled={isLoading}
          className="flex items-center gap-2 p-3 bg-pink-500 text-white rounded hover:bg-pink-600 disabled:opacity-50"
        >
          <PenTool size={16} />
          Tester Création Dessin
        </button>

        <button
          onClick={handleRefreshAttachments}
          disabled={isLoading}
          className="flex items-center gap-2 p-3 bg-gray-500 text-white rounded hover:bg-gray-600 disabled:opacity-50"
        >
          🔄 Rafraîchir Attachements
        </button>

        <button
          onClick={handleGetStats}
          disabled={isLoading}
          className="flex items-center gap-2 p-3 bg-yellow-500 text-white rounded hover:bg-yellow-600 disabled:opacity-50"
        >
          📊 Obtenir Statistiques
        </button>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-4">
        {['media', 'document', 'poll', 'drawing', 'contact'].map(type => (
          <button
            key={type}
            onClick={() => handleCheckPermissions(type)}
            disabled={isLoading}
            className="p-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 disabled:opacity-50"
          >
            Vérifier Permissions {type}
          </button>
        ))}
      </div>

      {isLoading && (
        <div className="mb-4 p-3 bg-blue-100 border border-blue-400 rounded">
          <p className="text-blue-800">Chargement en cours...</p>
        </div>
      )}

      <div className="space-y-4">
        <h4 className="font-semibold">Résultats des Tests:</h4>
        
        {Object.entries(results).map(([action, result]) => (
          <div key={action} className="p-3 bg-white border border-gray-300 rounded">
            <h5 className="font-medium text-gray-800 mb-2">{action}:</h5>
            <pre className="text-sm bg-gray-100 p-2 rounded overflow-auto">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        ))}
      </div>

      <div className="mt-4 p-3 bg-gray-200 rounded">
        <h4 className="font-semibold mb-2">Attachements Actuels:</h4>
        <pre className="text-sm overflow-auto">
          {JSON.stringify(attachments, null, 2)}
        </pre>
      </div>
    </div>
  );
}

export default AttachmentTest;
