'use client';

import {
  FaDownload,
  FaFilePdf,
  FaFileWord,
  FaFileExcel,
  FaFilePowerpoint,
  FaFileAlt,
} from 'react-icons/fa';
import { useState, useCallback } from 'react';

export default function DocumentItem({
  document,
  isMobile = false,
  isMe = false,
}) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [previewError, setPreviewError] = useState(false);

  const hasDocument = !!document;
  const docData = document || {};

  // Extraire les informations du document
  const fileName = docData.original_name || docData.name || 'Document';
  const fileSize = docData.file_size || docData.size || 0;
  const fileUrl =
    docData.url || docData.file_url || docData.downloadURL || docData.fileUrl;
  const fileType =
    docData.file_type || docData.type || 'application/octet-stream';
  const pageCount = docData.page_count || docData.pages || null;

  // Formater la taille du fichier
  const formatFileSize = bytes => {
    if (!bytes) return '0 Ko';
    const k = 1024;
    const sizes = ['o', 'Ko', 'Mo', 'Go'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  // Obtenir l'extension du fichier
  const getFileExtension = () => {
    const ext = fileName.split('.').pop()?.toLowerCase() || '';
    return ext.toUpperCase();
  };

  // Obtenir l'icône et la couleur basée sur le type de fichier
  const getFileIconAndColor = () => {
    const ext = fileName.split('.').pop()?.toLowerCase() || '';
    switch (ext) {
      case 'pdf':
        return { icon: FaFilePdf, color: '#DC2626', bg: '#DC2626' };
      case 'doc':
      case 'docx':
        return { icon: FaFileWord, color: '#2563EB', bg: '#2563EB' };
      case 'xls':
      case 'xlsx':
        return { icon: FaFileExcel, color: '#16A34A', bg: '#16A34A' };
      case 'ppt':
      case 'pptx':
        return { icon: FaFilePowerpoint, color: '#EA580C', bg: '#EA580C' };
      default:
        return { icon: FaFileAlt, color: '#6B7280', bg: '#6B7280' };
    }
  };

  const {
    icon: FileIcon,
    color: iconColor,
    bg: bgColor,
  } = getFileIconAndColor();

  const handleDownload = useCallback(
    async e => {
      e.preventDefault();
      e.stopPropagation();
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

  const handleOpen = useCallback(
    e => {
      e.preventDefault();
      e.stopPropagation();
      if (!fileUrl) return;
      window.open(fileUrl, '_blank', 'noopener,noreferrer');
    },
    [fileUrl]
  );

  if (!hasDocument) return null;

  return (
    <div className="w-[320px] overflow-hidden rounded-lg">
      {/* Prévisualisation du document */}
      <div
        className="relative h-[80px] flex items-center justify-center overflow-hidden"
        style={{ backgroundColor: 'var(--wa-panel-header)' }}
      >
        {fileUrl && !previewError ? (
          <div className="w-full h-full relative">
            {/* Afficher la prévisualisation pour les PDFs */}
            {getFileExtension() === 'PDF' ? (
              <iframe
                src={`${fileUrl}#toolbar=0&navpanes=0&scrollbar=0&view=FitH`}
                className="w-full h-full border-0 pointer-events-none"
                style={{ overflow: 'hidden' }}
                onError={() => setPreviewError(true)}
                title="Document preview"
              />
            ) : (
              <div
                className="w-full h-full flex items-center justify-center"
                style={{ backgroundColor: 'var(--wa-drawer-background)' }}
              >
                <FileIcon size={56} style={{ color: iconColor }} />
              </div>
            )}
          </div>
        ) : (
          <div
            className="w-full h-full flex items-center justify-center"
            style={{ backgroundColor: 'var(--wa-drawer-background)' }}
          >
            <FileIcon size={56} style={{ color: iconColor }} />
          </div>
        )}
      </div>

      {/* Informations du document */}
      <div className="px-4 py-2 h-[50px] bg-neutral-900/20 rounded-b-lg">
        <div className="flex flex-row items-start justify-between gap-2">
          {/* Overlay avec icône du type de fichier */}
          <div
            className="flex flex-shrink-0 rounded-md p-2 shadow-lg"
            style={{ backgroundColor: bgColor }}
          >
            <FileIcon size={20} className="text-white" />
          </div>
          <div className="flex-1 flex flex-col min-w-0">
            <h4
              className="text-[13px] font-medium truncate"
              style={{ color: 'var(--wa-primary-strong)' }}
              title={fileName}
            >
              {fileName}
            </h4>
            <div
              className="flex items-center gap-1.5 text-[11px] mt-0.25"
              style={{ color: 'var(--wa-secondary)' }}
            >
              {pageCount && (
                <span>
                  {pageCount} page{pageCount > 1 ? 's' : ''}
                </span>
              )}
              {pageCount && <span>•</span>}
              <span>{getFileExtension()}</span>
              <span>•</span>
              <span>{formatFileSize(fileSize)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Boutons d'action - visible uniquement pour le destinataire */}
      {!isMe && (
        <div
          className="flex gap-1 px-4 py-2 border-t"
          style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}
        >
          {fileUrl ? (
            <>
              <button
                onClick={handleOpen}
                className="flex-1 bg-transparent text-[13px] font-medium transition-colors"
                style={{ color: 'var(--wa-highlight)' }}
              >
                Ouvrir
              </button>
              <button
                onClick={handleDownload}
                disabled={isDownloading}
                className="flex-1 bg-transparent text-[13px] font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ color: 'var(--wa-highlight)' }}
              >
                {isDownloading ? 'Téléchargement...' : 'Enregistrer sous...'}
              </button>
            </>
          ) : (
            <div
              className="w-full text-center py-2 text-[13px]"
              style={{ color: 'var(--wa-secondary)' }}
            >
              Document indisponible
            </div>
          )}
        </div>
      )}
    </div>
  );
}
