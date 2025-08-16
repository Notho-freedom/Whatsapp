import { FaPlay, FaMicrophone } from 'react-icons/fa';

export default function MediaGroup({ media = [] }) {
  if (!media.length) return null;

  const isSingleMedia = media.length === 1;
  const gridCols = media.length === 2 ? 'grid-cols-2' : media.length >= 3 ? 'grid-cols-3' : '';

  return (
    <div className={`mb-[3px] -mx-[9px] -mt-[6px] ${!isSingleMedia && `grid gap-[2px] ${gridCols}`}`}>
      {media.map((item, idx) => {
        if (item.type === 'image') {
          return (
            <div key={idx} className="relative overflow-hidden bg-[#0b141a]">
              <img 
                src={item.url} 
                className={`w-full object-cover cursor-pointer ${
                  isSingleMedia ? 'max-h-[330px]' : 'h-[110px]'
                }`}
                style={{
                  borderRadius: isSingleMedia ? '7.5px' : '0',
                }}
              />
            </div>
          );
        }
        
        if (item.type === 'video') {
          return (
            <div key={idx} className="relative overflow-hidden bg-[#0b141a] group cursor-pointer">
              <video 
                src={item.url} 
                className={`w-full object-cover ${
                  isSingleMedia ? 'max-h-[330px]' : 'h-[110px]'
                }`}
                style={{
                  borderRadius: isSingleMedia ? '7.5px' : '0',
                }}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-[48px] h-[48px] rounded-full bg-[#00000066] flex items-center justify-center group-hover:bg-[#00000099] transition-colors">
                  <FaPlay size={16} className="text-white ml-1" />
                </div>
              </div>
            </div>
          );
        }
        
        if (item.type === 'audio') {
          return (
            <div key={idx} className="flex items-center gap-3 py-[10px] px-[13px] bg-[#0b141a33] rounded-md my-[3px]">
              <div className="w-[34px] h-[34px] rounded-full bg-[#00a884] flex items-center justify-center flex-shrink-0">
                <FaMicrophone size={14} className="text-[#0b141a]" />
              </div>
              <div className="flex-1">
                <div className="h-[20px] bg-[#ffffff1a] rounded-full overflow-hidden">
                  <div className="h-full w-[30%] bg-[#00a884] rounded-full" />
                </div>
                <div className="flex justify-between items-center mt-1">
                  <span className="text-[11px] text-[#8696a0]">0:12</span>
                  <span className="text-[11px] text-[#8696a0]">{item.duration || '1:23'}</span>
                </div>
              </div>
            </div>
          );
        }
        
        return null;
      })}
    </div>
  );
}
  