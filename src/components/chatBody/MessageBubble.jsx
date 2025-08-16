import { FaCheck, FaCheckDouble } from 'react-icons/fa';
import MediaGroup from './MediaGroup';
import PreviewLink from './PreviewLink';
import ReactionBar from './ReactionBar';

export default function MessageBubble({ message }) {
  const isMe = message.sender === 'me';

  return (
    <div className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[75%] rounded-lg px-3 py-2 text-sm shadow relative hover:bg-black/10 transition`}
        style={{
          backgroundColor: isMe ? '#005C4B' : '#202C33',
          color: '#EDEDED',
          borderTopRightRadius: isMe ? 0 : 8,
          borderTopLeftRadius: isMe ? 8 : 0,
        }}
      >
        {/* Reply */}
        {message.replyTo && (
          <div className="mb-1 px-2 py-1 bg-black/20 rounded border-l-4 border-green-500 text-xs text-gray-300">
            <span className="font-semibold">
              {message.replyTo.sender === 'me' ? 'Vous' : message.replyTo.senderName}
            </span>
            <div className="truncate">{message.replyTo.text}</div>
            {message.replyTo.media && <MediaGroup media={message.replyTo.media} />}
            {message.replyTo.link && <PreviewLink link={message.replyTo.link} />}
          </div>
        )}

        {/* Media */}
        {message.media && <MediaGroup media={message.media} />}

        {/* Texte */}
        {message.text && <p className="whitespace-pre-wrap">{message.text}</p>}

        {/* Preview Link */}
        {message.link && <PreviewLink link={message.link} />}

        {/* Time + status */}
        <div className="flex justify-end mt-1 space-x-1 text-[10px] text-gray-400 items-center">
          <span>{message.time}</span>
          {isMe && (
            <span className="flex items-center">
              {message.read ? <FaCheckDouble className="text-blue-400 w-3 h-3" /> : <FaCheck className="text-gray-400 w-3 h-3" />}
            </span>
          )}
        </div>

        {/* Reactions */}
        {message.reactions && <ReactionBar reactions={message.reactions} />}
      </div>
    </div>
  );
}
