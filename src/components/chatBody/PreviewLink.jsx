import { FaExternalLinkAlt, FaGlobe } from 'react-icons/fa';

export default function PreviewLink({ link }) {
  if (!link) return null;

  const getDomainIcon = (domain) => {
    if (domain.includes('youtube') || domain.includes('youtu.be')) return '🎥';
    if (domain.includes('instagram')) return '📷';
    if (domain.includes('facebook')) return '📘';
    if (domain.includes('twitter') || domain.includes('x.com')) return '🐦';
    if (domain.includes('linkedin')) return '💼';
    if (domain.includes('github')) return '🐙';
    return <FaGlobe className="w-2.5 h-2.5 sm:w-3 sm:h-3" />;
  };

  const truncateText = (text, maxLength = 60) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <div className="mt-1 link-preview link-preview-compact border border-gray-600 rounded-lg overflow-hidden hover:border-gray-500 transition-colors">
      <a
        href={link.url}
        target="_blank"
        rel="noopener noreferrer"
        className="block hover:bg-black/10 transition-colors"
      >
        {/* Image preview */}
        {link.image && (
          <div className="relative">
            <img 
              src={link.image} 
              alt={link.title}
              className="w-full h-20 sm:h-24 object-cover"
              loading="lazy"
            />
            <div className="absolute top-1 right-1 bg-black/70 text-white p-1 rounded">
              <FaExternalLinkAlt className="w-2 h-2" />
            </div>
          </div>
        )}

        {/* Content */}
        <div className="p-1.5 sm:p-2">
          {/* Domain */}
          <div className="flex items-center gap-1 text-xs text-gray-400 mb-1">
            {getDomainIcon(link.domain)}
            <span className="font-medium">{link.domain}</span>
          </div>

          {/* Title */}
          {link.title && (
            <div className="font-semibold text-white mb-1 line-clamp-2 text-sm">
              {truncateText(link.title, 50)}
            </div>
          )}

          {/* Description */}
          {link.description && (
            <div className="text-xs text-gray-300 mb-1 line-clamp-2">
              {truncateText(link.description, 80)}
            </div>
          )}

          {/* URL */}
          <div className="text-xs text-blue-400 truncate">
            {link.url}
          </div>
        </div>
      </a>
    </div>
  );
}
  