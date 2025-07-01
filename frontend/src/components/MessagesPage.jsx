import { useState, useRef, useEffect } from 'react';
import { useMessages } from '../contexts/MessageContext';
import { useAuth } from '../contexts/AuthContext';
import { ArrowLeft, Send, Plus, User } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

// Import components
import ConversationsList from './Messages/ConversationsList';
import MessagesList from './Messages/MessagesList';
import MessageInput from './Messages/MessageInput';
import NewChatModal from './Messages/NewChatModal';
import AvatarModal from './Profile/AvatarModal';

const MessagesPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const {
    conversations,
    currentConversation,
    messages,
    loading,
    messagesLoading,
    error,
    selectConversation,
    sendMessage,
    startConversation
  } = useMessages();

  const [newMessage, setNewMessage] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const [showNewChat, setShowNewChat] = useState(false);
  const [avatarModal, setAvatarModal] = useState({ isOpen: false, src: '', username: '' });
  const [showMobileChat, setShowMobileChat] = useState(false);
  const messagesListRef = useRef(null);

  // Efecto para abrir chat automáticamente cuando viene del perfil
  useEffect(() => {
    if (location.state?.openChat && location.state?.conversation) {
      // En móvil, abrir el chat directamente
      if (window.innerWidth < 768) {
        setShowMobileChat(true);
      }
      // Limpiar el state para evitar que se ejecute múltiples veces
      navigate('/messages', { replace: true });
    }
  }, [location.state, navigate]);

  // Función para abrir modal del avatar
  const openAvatarModal = (avatarSrc, username) => {
    setAvatarModal({ isOpen: true, src: avatarSrc, username });
  };

  // Función para cerrar modal del avatar
  const closeAvatarModal = () => {
    setAvatarModal({ isOpen: false, src: '', username: '' });
  };

  // Función para manejar selección de conversación (mobile + desktop)
  const handleSelectConversation = (conversation) => {
    selectConversation(conversation);
    // En mobile, mostrar la vista de chat
    setShowMobileChat(true);
  };

  // Función para volver a la lista de conversaciones en mobile
  const handleBackToConversations = () => {
    setShowMobileChat(false);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !currentConversation || sendingMessage) return;

    // Encontrar el participante que NO es el usuario actual
    const otherParticipant = currentConversation.participants.find(
      participant => participant._id !== user?.id && participant._id !== user?._id
    );

    if (!otherParticipant) {
      console.error('Could not find other participant');
      return;
    }

    const recipientId = otherParticipant._id;
    setSendingMessage(true);
    setNewMessage(''); // Limpiar el input inmediatamente
    try {
      await sendMessage(recipientId, newMessage.trim());
      setSendingMessage(false);
      // Hacer scroll hacia abajo después de enviar el mensaje
      setTimeout(() => {
        if (messagesListRef.current?.scrollToBottom) {
          messagesListRef.current.scrollToBottom();
        }
      }, 100);
    } catch (err) {
      setSendingMessage(false);
      console.error('Error sending message:', err);
    }
  };

  const formatMessageTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      });
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      });
    }
  };

  return (
    <div 
      className="h-screen bg-black flex overflow-hidden"
      style={{
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
      }}
    >
      {/* Lista de conversaciones - Sidebar */}
      <div className={`w-full md:w-80 lg:w-96 border-r border-neutral-900 flex flex-col bg-black ${showMobileChat ? 'hidden md:flex' : 'flex'}`}>
        {/* Header */}
        <div className="sticky top-0 bg-black/95 backdrop-blur border-b border-neutral-900 p-4">
          <div className="flex items-center justify-between h-8">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate(-1)}
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="Back"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
              <h1 className="text-xl font-semibold text-white line-height-none">Messages</h1>
            </div>
            <button
              onClick={() => setShowNewChat(true)}
              className="text-gray-300 hover:text-white transition-colors p-2 rounded-full hover:bg-neutral-900"
              title="New message"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Lista de conversaciones */}
        <div className="flex-1 overflow-y-auto">
          <ConversationsList
            conversations={conversations}
            currentConversation={currentConversation}
            selectConversation={handleSelectConversation}
            loading={loading}
            formatMessageTime={formatMessageTime}
            user={user}
          />
        </div>
      </div>

      {/* Área de chat */}
      <div className={`flex-1 flex-col ${showMobileChat ? 'flex' : 'hidden md:flex'}`}>
        {currentConversation ? (
          <>
            {/* Header del chat */}
            <div className="sticky top-0 bg-black/95 backdrop-blur border-b border-neutral-900 p-4">
              <div className="flex items-center gap-3 h-8">
                {/* Botón back solo en mobile */}
                <button
                  onClick={handleBackToConversations}
                  className="md:hidden text-gray-400 hover:text-white transition-colors mr-2"
                  aria-label="Back to conversations"
                >
                  <ArrowLeft className="w-6 h-6" />
                </button>
                
                {(() => {
                  // Encontrar el participante que NO es el usuario actual
                  const otherUser = currentConversation.participants.find(
                    participant => participant._id !== user?.id && participant._id !== user?._id
                  );
                  
                  return (
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => otherUser?.avatar && openAvatarModal(otherUser.avatar, otherUser.username)}
                        className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center overflow-hidden hover:ring-2 hover:ring-blue-600 transition"
                        title={otherUser?.avatar ? `View ${otherUser?.username}'s avatar` : 'No avatar to view'}
                        disabled={!otherUser?.avatar}
                      >
                        {otherUser?.avatar ? (
                          <img 
                            src={otherUser.avatar} 
                            alt={otherUser.username}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <User className="w-4 h-4 text-gray-600" />
                        )}
                      </button>
                      <button
                        onClick={() => navigate(`/profile/${otherUser?.username}`)}
                        className="text-xl font-semibold text-white hover:text-gray-300 transition-colors"
                        title={`Go to ${otherUser?.username}'s profile`}
                      >
                        {otherUser?.username || 'Unknown User'}
                      </button>
                    </div>
                  );
                })()}
              </div>
            </div>

            {/* Mensajes */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messagesLoading ? (
                <div className="flex-1 flex items-center justify-center">
                  <div className="flex flex-col items-center gap-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-400"></div>
                    <p className="text-gray-400 text-sm">Loading messages...</p>
                  </div>
                </div>
              ) : (
                <MessagesList
                  ref={messagesListRef}
                  messages={messages}
                  user={user}
                  currentConversation={currentConversation}
                  formatMessageTime={formatMessageTime}
                />
              )}
            </div>

            {/* Input de mensaje */}
            <MessageInput
              newMessage={newMessage}
              setNewMessage={setNewMessage}
              sendingMessage={sendingMessage}
              handleSendMessage={handleSendMessage}
              currentConversation={currentConversation}
              user={user}
              sendMessage={sendMessage}
              messagesListRef={messagesListRef} // Pasar ref para scroll automático
            />
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="w-20 h-20 bg-neutral-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <Send className="w-10 h-10 text-gray-600" />
              </div>
              <h3 className="text-white text-lg font-medium mb-2">Your Messages</h3>
              <p className="text-gray-400 text-sm">Select a conversation to start messaging</p>
            </div>
          </div>
        )}
      </div>

      {/* Modal para nuevo chat */}
      <NewChatModal
        showNewChat={showNewChat}
        setShowNewChat={setShowNewChat}
        startConversation={startConversation}
        selectConversation={selectConversation}
        user={user}
        error={error}
      />

      {/* Modal para ver avatar */}
      <AvatarModal
        isOpen={avatarModal.isOpen}
        onClose={closeAvatarModal}
        avatarSrc={avatarModal.src}
        username={avatarModal.username}
      />
    </div>
  );
};

export default MessagesPage;
