export default function MediaGroup({ media = [] }) {
    if (!media.length) return null;
  
    return (
      <div className="mt-1 grid gap-1 grid-cols-2 sm:grid-cols-3">
        {media.map((item, idx) => {
          if (item.type === 'image') {
            return <img key={idx} src={item.url} className="rounded-md max-h-48 w-full object-cover" />;
          }
          if (item.type === 'video') {
            return (
              <video key={idx} src={item.url} className="rounded-md max-h-48 w-full" controls />
            );
          }
          if (item.type === 'audio') {
            return <audio key={idx} src={item.url} controls className="w-full mt-1" />;
          }
          return null;
        })}
      </div>
    );
  }
  