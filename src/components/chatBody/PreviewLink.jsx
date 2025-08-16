export default function PreviewLink({ link }) {
    if (!link) return null;
  
    return (
      <a
        href={link.url}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-1 block border rounded-md overflow-hidden hover:bg-gray-800 transition"
      >
        <div className="flex items-start">
          {link.image && <img src={link.image} className="w-20 h-20 object-cover" />}
          <div className="p-2">
            <div className="text-xs text-gray-400">{link.domain}</div>
            <div className="font-semibold">{link.title}</div>
            {link.description && <div className="text-xs text-gray-300 truncate">{link.description}</div>}
          </div>
        </div>
      </a>
    );
  }
  