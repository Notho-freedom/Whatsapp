'use client';

import { FaDownload } from 'react-icons/fa';
import { useState, useCallback } from 'react';

export default function DocumentItem({ document, isMobile = false }) {
  const [isDownloading, setIsDownloading] = useState(false);

  const hasDocument = !!document;
  const docData = document || {};

  // Extraire les informations du document
  const fileName = docData.original_name || docData.name || 'Document';
  const fileSize = docData.file_size || docData.size || 0;
  const fileUrl =
    docData.url ||
    docData.file_url ||
    docData.downloadURL ||
    docData.fileUrl;
  const fileType =
    docData.file_type || docData.type || 'application/octet-stream';

  // Formater la taille du fichier
  const formatFileSize = bytes => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  // Obtenir l'icône basée sur le type de fichier
  const getFileIcon = () => {
    const ext = fileName.split('.').pop()?.toLowerCase() || '';
    switch (ext) {
      case 'pdf':
        return '📄';
      case 'doc':
      case 'docx':
        return '📝';
      case 'xls':
      case 'xlsx':
        return '📊';
      case 'ppt':
      case 'pptx':
        return '🎁';
      case 'zip':
      case 'rar':
        return '📦';
      case 'txt':
        return '📃';
      default:
        return '📎';
    }
  };

  const handleDownload = useCallback(
    async e => {
      e.preventDefault();
      if (!fileUrl || isDownloading) return;

      try {
        setIsDownloading(true);
        const a = globalThis.document.createElement('a');
        a.href = fileUrl;
        a.download = fileName;
        globalThis.document.body.appendChild(a);
        a.click();
        globalThis.document.body.removeChild(a);
      } catch (error) {
        console.error('Erreur lors du téléchargement:', error);
      } finally {
        setIsDownloading(false);
      }
    },
    [fileUrl, fileName, isDownloading]
  );

  if (!hasDocument) return null;

  return (
    <div className="w-full max-w-sm">
      {fileUrl ? (
        <a
          href={fileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 p-3 bg-neutral-800/50 rounded-lg border border-neutral-700 hover:bg-neutral-700/50 transition-colors cursor-pointer"
        >
          {/* Icône du fichier */}
          <div className="flex-shrink-0 text-2xl">{getFileIcon()}</div>

          {/* Informations du fichier */}
          <div className="flex-1 min-w-0">
            <div
              className="text-sm font-medium text-white truncate"
              title={fileName}
            >
              {fileName}
            </div>
            <div className="text-xs text-gray-400">
              {formatFileSize(fileSize)}
            </div>
          </div>

          {/* Bouton de téléchargement */}
          <button
            onClick={handleDownload}
            disabled={isDownloading}
            className="flex-shrink-0 p-2 text-gray-400 hover:text-white hover:bg-neutral-700/50 rounded-full transition-colors disabled:opacity-50"
            title="Télécharger"
          >
            <FaDownload size={isMobile ? 14 : 16} />
          </button>
        </a>
      ) : (
        <div className="flex items-center gap-3 p-3 bg-neutral-800/50 rounded-lg border border-neutral-700">
          {/* Icône du fichier */}
          <div className="flex-shrink-0 text-2xl">{getFileIcon()}</div>

          {/* Informations du fichier */}
          <div className="flex-1 min-w-0">
            <div
              className="text-sm font-medium text-white truncate"
              title={fileName}
            >
              {fileName}
            </div>
            <div className="text-xs text-gray-400">
              {formatFileSize(fileSize)}
            </div>
          </div>

          <div className="text-[11px] text-gray-500 whitespace-nowrap">
            indisponible
          </div>
        </div>
      )}
    </div>
  );
}
