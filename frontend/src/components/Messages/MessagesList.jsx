import { User, Check, CheckCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import AvatarModal from '../Profile/AvatarModal';

const MessagesList = ({ 
  messages, 
  user, 
  currentConversation, 
  formatMessageTime 
}) => {
  const [avatarModal, setAvatarModal] = useState({ isOpen: false, src: '', username: '' });
  
  // Función para abrir modal del avatar
  const openAvatarModal = (avatarSrc, username) => {
    setAvatarModal({ isOpen: true, src: avatarSrc, username });
  };

  // Función para cerrar modal del avatar
  const closeAvatarModal = () => {
    setAvatarModal({ isOpen: false, src: '', username: '' });
  };
  // Función para determinar el estado del mensaje
  const getMessageStatus = (message) => {
    if (!message || message.sender._id === user?.id || message.sender._id === user?._id) {
      // Solo mostrar estado para mensajes propios
      const currentConversationParticipants = currentConversation?.participants || [];
      const otherParticipant = currentConversationParticipants.find(
        p => p._id !== user?.id && p._id !== user?._id
      );

      if (!otherParticipant) return 'sent';

      // Verificar si el mensaje fue leído por el otro usuario
      const isRead = message.readBy?.some(read => 
        read.user === otherParticipant._id || read.user._id === otherParticipant._id
      );

      return isRead ? 'read' : 'delivered';
    }
    return null;
  };

  // Función para renderizar el icono de estado
  const renderMessageStatusIcon = (status) => {
    switch (status) {
      case 'sent':
        return <Check className="w-3 h-3 text-gray-400" />;
      case 'delivered':
        return <CheckCheck className="w-3 h-3 text-gray-400" />;
      case 'read':
        return <CheckCheck className="w-3 h-3 text-blue-500" />;
      default:
        return null;
    }
  };

  return (
    <>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => {
          const isOwn = message.sender._id === user?.id || message.sender._id === user?._id;
          const messageStatus = getMessageStatus(message);
          
          return (
            <div
              key={message._id}
              className={`flex items-end gap-2 ${isOwn ? 'justify-end' : 'justify-start'}`}
            >
              {/* Avatar del remitente (solo para mensajes recibidos) */}
              {!isOwn && (
                <button
                  onClick={() => message.sender?.avatar && openAvatarModal(message.sender.avatar, message.sender.username)}
                  className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center overflow-hidden flex-shrink-0 mb-1 hover:ring-2 hover:ring-blue-600 transition group cursor-pointer"
                  title={message.sender?.avatar ? `View ${message.sender?.username}'s avatar` : 'No avatar to view'}
                  disabled={!message.sender?.avatar}
                >
                  {message.sender?.avatar ? (
                    <img 
                      src={message.sender.avatar} 
                      alt={message.sender.username}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-4 h-4 text-gray-600" />
                  )}
                </button>
              )}

              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                  isOwn
                    ? 'bg-neutral-600 text-white border border-neutral-500'
                    : 'bg-neutral-900 text-white border border-neutral-800'
                }`}
              >
                {/* Nombre del usuario y fecha (solo para mensajes recibidos) */}
                {!isOwn && (
                  <div className="flex items-center justify-between gap-1 mb-1">
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
                )}
                
                <p className="text-sm">{message.content}</p>
                
                {/* Solo mostrar timestamp y checks para mensajes propios */}
                {isOwn && (
                  <div className={`flex items-center justify-end gap-1 mt-1`}>
                    <p className="text-xs text-gray-200">
                      {formatMessageTime(message.createdAt)}
                    </p>
                    {messageStatus && (
                      <div className="ml-1">
                        {renderMessageStatusIcon(messageStatus)}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Espaciador para mensajes propios para mantener simetría */}
              {isOwn && <div className="w-8"></div>}
            </div>
          );
        })}
      </div>

      {/* Modal para ver avatar */}
      <AvatarModal
        isOpen={avatarModal.isOpen}
        onClose={closeAvatarModal}
        avatarSrc={avatarModal.src}
        username={avatarModal.username}
      />
    </>
  );
};

export default MessagesList;
