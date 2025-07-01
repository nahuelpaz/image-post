import { Link } from 'react-router-dom';
import AvatarButton from './AvatarButton';
import { Check, CheckCheck } from 'lucide-react';

const MessageItem = ({
  message,
  isOwn,
  messageStatus,
  isLast,
  openAvatarModal,
  formatMessageTime,
  lastGifRef,
  openGifModal // nuevo prop
}) => (
  <div
    className={`flex items-start gap-2 ${isOwn ? 'ml-auto' : ''}`}
  >
    <AvatarButton
      avatar={message.sender?.avatar}
      username={message.sender?.username}
      onClick={() => message.sender?.avatar && openAvatarModal(message.sender.avatar, message.sender.username)}
    />
    <div className="flex flex-col min-h-10 justify-start max-w-xs lg:max-w-md">
      <div className="flex items-center gap-2 mb-1">
        <Link
          to={`/profile/${message.sender?.username}`}
          className="text-xs text-gray-400 font-medium hover:text-white transition-colors"
          title={`Go to ${message.sender?.username}'s profile`}
        >
          {message.sender?.username}
        </Link>
        <p className="text-xs text-gray-500 flex-shrink-0">
          {formatMessageTime(message.createdAt)}
        </p>
      </div>
      {message.messageType === 'image' && message.image ? (
        <img
          src={message.image}
          alt={message.content || 'GIF'}
          className="max-w-xs lg:max-w-md rounded-xl mb-1 cursor-pointer"
          style={{ maxHeight: 240 }}
          ref={isLast ? lastGifRef : null}
          onClick={() => openGifModal && openGifModal(message.image)}
        />
      ) : (
        <p className="text-sm text-white break-words">{message.content}</p>
      )}
      {isOwn && messageStatus && (
        <div className="flex items-center justify-end gap-1 mt-1">
          <div className="ml-1">
            {messageStatus === 'sent' && <Check className="w-3 h-3 text-gray-400" />}
            {messageStatus === 'delivered' && <CheckCheck className="w-3 h-3 text-gray-400" />}
            {messageStatus === 'read' && <CheckCheck className="w-3 h-3 text-blue-500" />}
          </div>
        </div>
      )}
    </div>
  </div>
);

export default MessageItem;
