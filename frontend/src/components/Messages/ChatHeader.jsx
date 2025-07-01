import { User } from 'lucide-react';
import AvatarButton from './AvatarButton';
import { useNavigate } from 'react-router-dom';

const ChatHeader = ({ otherUser, openAvatarModal }) => {
  const navigate = useNavigate();
  return (
    <div className="sticky top-0 bg-black/95 backdrop-blur border-b border-neutral-900 p-4">
      <div className="flex items-center gap-3 h-8">
        <button
          onClick={() => window.history.back()}
          className="md:hidden text-gray-400 hover:text-white transition-colors mr-2"
          aria-label="Back to conversations"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
        </button>
        <AvatarButton
          avatar={otherUser?.avatar}
          username={otherUser?.username}
          onClick={() => otherUser?.avatar && openAvatarModal(otherUser.avatar, otherUser.username)}
        />
        <button
          onClick={() => navigate(`/profile/${otherUser?.username}`)}
          className="text-xl font-semibold text-white hover:text-gray-300 transition-colors"
          title={`Go to ${otherUser?.username}'s profile`}
        >
          {otherUser?.username || 'Unknown User'}
        </button>
      </div>
    </div>
  );
};

export default ChatHeader;
