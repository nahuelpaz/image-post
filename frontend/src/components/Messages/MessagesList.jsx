import { User, Check, CheckCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import MessageItem from './MessageItem';
import AvatarModal from '../Profile/AvatarModal';

const MessagesList = forwardRef(({ 
  messages, 
  user, 
  currentConversation, 
  formatMessageTime 
}, ref) => {
  const [avatarModal, setAvatarModal] = useState({ isOpen: false, src: '', username: '' });
  const [imageModal, setImageModal] = useState({ isOpen: false, src: '', username: '', fileLabel: 'avatar', fileExt: 'jpg', downloadName: undefined });
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  
  // Función para hacer scroll hacia abajo
  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      // Buscar el contenedor padre que tiene overflow-y-auto (el contenedor del chat)
      const scrollContainer = messagesEndRef.current.closest('[class*="overflow-y-auto"]');
      if (scrollContainer) {
        // Hacer scroll solo dentro del contenedor del chat
        scrollContainer.scrollTo({
          top: scrollContainer.scrollHeight,
          behavior: 'smooth'
        });
      }
    }
  };

  // Exponer la función scrollToBottom al componente padre
  useImperativeHandle(ref, () => ({
    scrollToBottom
  }));

  // Efecto para hacer scroll al final cuando cambien los mensajes o la conversación
  useEffect(() => {
    scrollToBottom();
  }, [messages, currentConversation?._id]);

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

  // --- Scroll GIF: referencia y efecto para esperar carga del último GIF ---
  const lastGifRef = useRef(null);
  // Detectar si el último mensaje es un GIF
  const lastMessage = messages[messages.length - 1];
  useEffect(() => {
    if (lastMessage && lastMessage.messageType === 'image' && lastGifRef.current) {
      // Si el GIF ya está cargado (por cache), forzar scroll
      if (lastGifRef.current.complete) {
        scrollToBottom();
      }
      // Si no, esperar a que cargue
      else {
        lastGifRef.current.onload = () => {
          scrollToBottom();
        };
      }
    }
  }, [messages, currentConversation?._id]);

  return (
    <>
      <div 
        ref={messagesContainerRef}
        className="flex-1 flex flex-col space-y-4 px-4 pb-4"
      >
        {messages.map((message, idx) => {
          const isOwn = message.sender._id === user?.id || message.sender._id === user?._id;
          const messageStatus = getMessageStatus(message);
          const isLast = idx === messages.length - 1;
          // Handler para abrir modal de imagen (avatar o gif)
          const handleImageClick = (imgSrc, label, ext, downloadName) => {
            setImageModal({
              isOpen: true,
              src: imgSrc,
              username: message.sender?.username,
              fileLabel: label,
              fileExt: ext,
              downloadName
            });
          };
          return (
            <MessageItem
              key={message._id}
              message={message}
              isOwn={isOwn}
              messageStatus={messageStatus}
              isLast={isLast}
              openAvatarModal={(src, username) => handleImageClick(src, 'avatar', 'jpg', undefined)}
              formatMessageTime={formatMessageTime}
              lastGifRef={lastGifRef}
              // Nuevo: handler para abrir gif
              openGifModal={(gifSrc) => handleImageClick(gifSrc, 'gif', 'gif', `${message.sender?.username || 'gif'}_message.gif`)}
            />
          );
        })}
        {/* Elemento invisible para hacer scroll hacia abajo */}
        <div ref={messagesEndRef} />
      </div>
      {/* Modal para ver avatar o gif */}
      <AvatarModal
        isOpen={imageModal.isOpen}
        onClose={() => setImageModal({ ...imageModal, isOpen: false })}
        avatarSrc={imageModal.src}
        username={imageModal.username}
        fileLabel={imageModal.fileLabel}
        fileExt={imageModal.fileExt}
        downloadName={imageModal.downloadName}
      />
    </>
  );
});

MessagesList.displayName = 'MessagesList';

export default MessagesList;
