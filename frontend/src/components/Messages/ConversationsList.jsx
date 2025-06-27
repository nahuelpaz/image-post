import { User } from 'lucide-react';

const ConversationsList = ({ 
  conversations, 
  currentConversation, 
  user, 
  loading, 
  selectConversation,
  formatMessageTime 
}) => {
  if (loading && conversations.length === 0) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mx-auto"></div>
        <p className="text-gray-400 text-sm mt-2">Loading conversations...</p>
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-400 text-sm">No conversations yet</p>
        <p className="text-gray-500 text-xs mt-1">Start a new chat to begin messaging</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-neutral-900">
      {conversations.map((conversation) => {
        // Encontrar el participante que NO es el usuario actual
        const otherUser = conversation.participants.find(
          participant => participant._id !== user?.id && participant._id !== user?._id
        );
        const isSelected = currentConversation?._id === conversation._id;
        
        return (
          <button
            key={conversation._id}
            onClick={() => selectConversation(conversation)}
            className={`w-full p-4 text-left hover:bg-neutral-900/50 transition-colors ${
              isSelected ? 'bg-neutral-900' : ''
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-neutral-800 flex items-center justify-center overflow-hidden">
                {otherUser?.avatar ? (
                  <img 
                    src={otherUser.avatar} 
                    alt={otherUser.username}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-6 h-6 text-gray-600" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-white font-medium truncate">
                    {otherUser?.username || 'Unknown User'}
                  </p>
                  {conversation.lastMessage && (
                    <span className="text-xs text-gray-500">
                      {formatMessageTime(conversation.lastMessage.createdAt)}
                    </span>
                  )}
                </div>
                {conversation.lastMessage && (
                  <p className="text-sm text-gray-400 truncate mt-1">
                    {conversation.lastMessage.sender.username === user?.username ? 'You: ' : ''}
                    {conversation.lastMessage.content}
                  </p>
                )}
                {conversation.unreadCount > 0 && (
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-1"></div>
                )}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
};

export default ConversationsList;
