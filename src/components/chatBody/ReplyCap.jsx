import { FaTimes, FaReply } from 'react-icons/fa';
import { memo } from 'react';

const ReplyCap = memo(function ReplyCap({ replyTo, onCancelReply, isMobile }) {
  if (!replyTo) return null;

  const truncateText = (text, maxLength = 50) => {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  const getMessagePreview = () => {
    if (replyTo.text) {
      return truncateText(replyTo.text);
    }
    if (replyTo.media && replyTo.media.length > 0) {
      const mediaType = replyTo.media[0].type;
      switch (mediaType) {
        case 'image':
          return '📷 Image';
        case 'video':
          return '🎥 Video';
        case 'audio':
          return '🎵 Audio';
        case 'document':
          return '📄 Document';
        default:
          return '📎 Media';
      }
    }
    if (replyTo.link) {
      return '🔗 Link';
    }
    return 'Message';
  };

  const getSenderName = () => {
    if (replyTo.sender === 'me') {
      return 'You';
    }
    return replyTo.senderName || 'Unknown';
  };

  return (
    <div className="reply-cap-container">
      {/* Barre de réponse */}
      <div className="reply-cap-bar">
        {/* Ligne bleue verticale */}
        <div className="reply-cap-line" />
        
        {/* Contenu principal */}
        <div className="reply-cap-content">
          {/* En-tête avec nom de l'expéditeur */}
          <div className="reply-cap-header">
            <div className="reply-cap-sender">
              <FaReply className="reply-icon" />
              <span className="sender-name">{getSenderName()}</span>
            </div>
          </div>
          
          {/* Aperçu du message */}
          <div className="reply-cap-preview">
            <div className="preview-text">
              {getMessagePreview()}
            </div>
            
            {/* Thumbnail pour les médias */}
            {replyTo.media && replyTo.media.length > 0 && (
              <div className="preview-thumbnail">
                {replyTo.media[0].type === 'image' ? (
                  <img 
                    src={replyTo.media[0].url} 
                    alt="Media preview"
                    className="thumbnail-image"
                  />
                ) : (
                  <div className="thumbnail-placeholder">
                    {replyTo.media[0].type === 'video' && '🎥'}
                    {replyTo.media[0].type === 'audio' && '🎵'}
                    {replyTo.media[0].type === 'document' && '📄'}
                  </div>
                )}
              </div>
            )}
            
            {/* Thumbnail pour les liens */}
            {replyTo.link && replyTo.link.thumbnail && (
              <div className="preview-thumbnail">
                <img 
                  src={replyTo.link.thumbnail} 
                  alt="Link preview"
                  className="thumbnail-image"
                />
              </div>
            )}
          </div>
        </div>
        
        {/* Bouton de fermeture */}
        <button 
          className="reply-cap-close"
          onClick={onCancelReply}
          aria-label="Cancel reply"
        >
          <FaTimes />
        </button>
      </div>
      
      <style jsx>{`
        .reply-cap-container {
          position: relative;
          width: 100%;
          background: #202c33;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          animation: replyCapSlideIn 0.2s ease-out;
        }
        
        .reply-cap-bar {
          display: flex;
          align-items: center;
          padding: 8px 12px;
          min-height: 60px;
          gap: 12px;
        }
        
        .reply-cap-line {
          width: 4px;
          height: 100%;
          background: #00a884;
          border-radius: 2px;
          flex-shrink: 0;
        }
        
        .reply-cap-content {
          flex: 1;
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        
        .reply-cap-header {
          display: flex;
          align-items: center;
        }
        
        .reply-cap-sender {
          display: flex;
          align-items: center;
          gap: 6px;
          color: #00a884;
          font-size: 13px;
          font-weight: 500;
        }
        
        .reply-icon {
          font-size: 12px;
        }
        
        .sender-name {
          font-weight: 600;
        }
        
        .reply-cap-preview {
          display: flex;
          align-items: center;
          gap: 8px;
          min-height: 20px;
        }
        
        .preview-text {
          flex: 1;
          color: #d1d7db;
          font-size: 14px;
          line-height: 1.3;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        
        .preview-thumbnail {
          width: 32px;
          height: 32px;
          border-radius: 4px;
          overflow: hidden;
          flex-shrink: 0;
          background: rgba(255, 255, 255, 0.1);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .thumbnail-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        
        .thumbnail-placeholder {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
          color: #8696a0;
        }
        
        .reply-cap-close {
          background: none;
          border: none;
          color: #8696a0;
          cursor: pointer;
          padding: 8px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.15s ease;
          flex-shrink: 0;
        }
        
        .reply-cap-close:hover {
          background: rgba(255, 255, 255, 0.1);
          color: #d1d7db;
        }
        
        .reply-cap-close:active {
          transform: scale(0.95);
        }
        
        @keyframes replyCapSlideIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        /* Responsive */
        @media (max-width: 768px) {
          .reply-cap-bar {
            padding: 6px 10px;
            min-height: 56px;
          }
          
          .preview-text {
            font-size: 13px;
          }
          
          .preview-thumbnail {
            width: 28px;
            height: 28px;
          }
          
          .reply-cap-sender {
            font-size: 12px;
          }
        }
      `}</style>
    </div>
  );
});

export default ReplyCap;
