import { FaCheck, FaCheckDouble, FaAngleDown } from 'react-icons/fa';
import MediaGroup from './MediaGroup';
import PreviewLink from './PreviewLink';
import ReactionBar from './ReactionBar';
import { useState } from 'react';

export default function MessageBubble({ message, isFirstInGroup, isLastInGroup }) {
  const isMe = message.sender === 'me';
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      className={`wa-message-container flex ${isMe ? 'justify-end' : 'justify-start'}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative flex max-w-[65%]">
        {/* Message tail pour le premier message d'un groupe */}
        {isFirstInGroup && (
          <div className={`wa-message-tail ${isMe ? 'wa-message-tail-self' : 'wa-message-tail-others'}`} />
        )}

        {/* Message bubble */}
        <div
          className={`wa-message-bubble ${isMe ? 'wa-message-bubble-self' : 'wa-message-bubble-others'}`}
          style={{
            borderTopRightRadius: isMe && isFirstInGroup ? 0 : 7.5,
            borderTopLeftRadius: !isMe && isFirstInGroup ? 0 : 7.5,
          }}
        >
          {/* Message forwarded label */}
          {message.forwarded && (
            <div className="text-[#8696a0] text-[12.5px] mb-[2px]">
              Forwarded
            </div>
          )}

          {/* Reply */}
          {message.replyTo && (
            <div 
              className="mb-[3px] p-[5px] rounded-[4px] border-l-[3px]"
              style={{
                backgroundColor: isMe ? '#054640' : '#1c262d',
                borderColor: isMe ? '#06cf9c' : '#8696a0'
              }}
            >
              <div className="text-[#06cf9c] text-[12.5px] font-medium mb-[2px]">
                {message.replyTo.sender === 'me' ? 'You' : message.replyTo.senderName}
              </div>
              <div className="text-[#d1d7db] text-[13px] line-clamp-3">
                {message.replyTo.text}
              </div>
            </div>
          )}

          {/* Media */}
          {message.media && <MediaGroup media={message.media} />}

          {/* Link preview */}
          {message.link && <PreviewLink link={message.link} />}

          {/* Text message */}
          {message.text && (
            <div className="wa-message-text">
              <span>{message.text}</span>
              {/* Spacer for metadata */}
              <span className="inline-block w-[74px]"></span>
            </div>
          )}

          {/* Message metadata (time + status) */}
          <div className="wa-message-meta">
            <span className="wa-message-time">{message.time}</span>
            {isMe && (
              <span className="wa-message-status">
                {message.read ? (
                  <FaCheckDouble className="text-[#53bdeb] w-[16px] h-[11px]" />
                ) : (
                  <FaCheckDouble className="text-[#ffffff99] w-[16px] h-[11px]" />
                )}
              </span>
            )}
          </div>

          {/* Reactions */}
          {message.reactions && <ReactionBar reactions={message.reactions} />}
        </div>

        {/* Options chevron on hover */}
        {isHovered && (
          <div 
            className={`absolute top-[6px] ${isMe ? '-left-[24px]' : '-right-[24px]'} 
              text-[#8696a0] cursor-pointer hover:text-[#d1d7db] transition-colors`}
          >
            <FaAngleDown size={20} />
          </div>
        )}
      </div>
    </div>
  );
}
