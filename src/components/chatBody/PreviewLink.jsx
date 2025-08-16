export default function PreviewLink({ link }) {
  if (!link) return null;

  return (
    <a
      href={link.url}
      target="_blank"
      rel="noopener noreferrer"
      className="block mt-[6px] mb-[3px] -mx-[9px] overflow-hidden cursor-pointer group"
      style={{ borderRadius: '7.5px' }}
    >
      <div className="bg-[#0b141a] border border-[#ffffff0d]">
        {link.image && (
          <div className="relative h-[150px] overflow-hidden bg-[#0b141a]">
            <img 
              src={link.image} 
              className="w-full h-full object-cover"
              alt={link.title}
            />
          </div>
        )}
        <div className="p-[10px]">
          <div className="text-[11px] text-[#8696a0] mb-[2px] uppercase tracking-wider">
            {link.domain}
          </div>
          <div className="text-[14px] text-[#e9edef] font-medium mb-[4px] line-clamp-2">
            {link.title}
          </div>
          {link.description && (
            <div className="text-[13px] text-[#8696a0] line-clamp-2">
              {link.description}
            </div>
          )}
        </div>
      </div>
    </a>
  );
}
  