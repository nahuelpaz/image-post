import { createContext, useContext, useState, useEffect } from 'react';
import { messageService } from '../services/messageService';
import { useAuth } from './AuthContext';

const MessageContext = createContext();

export const useMessages = () => {
  const context = useContext(MessageContext);
  if (!context) {
    throw new Error('useMessages must be used within a MessageProvider');
  }
  return context;
};

export const MessageProvider = ({ children }) => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [currentConversation, setCurrentConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [error, setError] = useState('');

  // Cargar conversaciones
  const fetchConversations = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const response = await messageService.getConversations();
      setConversations(response.conversations || []);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching conversations:', err);
    } finally {
      setLoading(false);
    }
  };

  // Cargar mensajes de una conversación
  const fetchMessages = async (conversationId) => {
    try {
      setMessagesLoading(true);
      setMessages([]); // Limpiar mensajes anteriores inmediatamente
      const response = await messageService.getMessages(conversationId);
      setMessages(response.messages || []);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching messages:', err);
    } finally {
      setMessagesLoading(false);
    }
  };

  // Enviar mensaje
  const sendMessage = async (recipientId, content, messageType = 'text') => {
    try {
      const response = await messageService.sendMessage(recipientId, content, messageType);
      
      // Agregar el mensaje a la lista actual si estamos en esa conversación
      if (currentConversation) {
        setMessages(prev => [...prev, response.data]);
      }
      
      // Actualizar lista de conversaciones
      await fetchConversations();
      
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Función para marcar mensajes como leídos automáticamente cuando se reciben en la conversación actual
  const markCurrentConversationAsRead = async () => {
    if (!currentConversation) return;
    
    try {
      // Recargar los mensajes para marcarlos como leídos
      await fetchMessages(currentConversation._id);
      
      // Actualizar contador y conversaciones
      await fetchUnreadCount();
      await fetchConversations();
    } catch (err) {
      console.error('Error marking current conversation as read:', err);
    }
  };

  // Iniciar conversación
  const startConversation = async (username) => {
    try {
      const response = await messageService.startConversation(username);
      await fetchConversations();
      return response.conversation;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Obtener contador de no leídos
  const fetchUnreadCount = async () => {
    if (!user) return;
    
    try {
      const response = await messageService.getUnreadCount();
      setUnreadCount(response.unreadCount || 0);
    } catch (err) {
      console.error('Error fetching unread count:', err);
    }
  };

  // Seleccionar conversación actual
  const selectConversation = async (conversation) => {
    // Limpiar mensajes inmediatamente al cambiar de conversación
    setMessages([]);
    setCurrentConversation(conversation);
    
    if (conversation) {
      // Si la conversación tiene mensajes no leídos, actualizar el contador inmediatamente
      if (conversation.unreadCount > 0) {
        setUnreadCount(prev => Math.max(0, prev - conversation.unreadCount));
      }
      
      // Cargar mensajes (esto automáticamente marca los mensajes como leídos en el backend)
      await fetchMessages(conversation._id);
      
      // Actualizar la lista de conversaciones para reflejar el cambio
      await fetchConversations();
      
      // Sincronizar el contador real con el servidor
      await fetchUnreadCount();
    }
  };

  // Efecto para cargar datos iniciales
  useEffect(() => {
    if (user) {
      fetchConversations();
      fetchUnreadCount();
      
      // Actualizar contador cada 30 segundos
      const interval = setInterval(fetchUnreadCount, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  // Efecto para marcar mensajes como leídos automáticamente en la conversación actual
  useEffect(() => {
    if (user && currentConversation) {
      // Verificar cada 2 segundos si hay mensajes nuevos en la conversación actual
      const interval = setInterval(async () => {
        try {
          // Obtener el estado actual de la conversación
          const response = await messageService.getConversations(1, 20);
          const currentConv = response.conversations.find(conv => conv._id === currentConversation._id);
          
          // Si hay mensajes no leídos en la conversación actual, marcarlos como leídos
          if (currentConv && currentConv.unreadCount > 0) {
            await markCurrentConversationAsRead();
          }
        } catch (err) {
          console.error('Error checking for new messages:', err);
        }
      }, 2000); // Cambiado de 5000 a 2000 (2 segundos)

      return () => clearInterval(interval);
    }
  }, [user, currentConversation]);

  const value = {
    conversations,
    currentConversation,
    messages,
    unreadCount,
    loading,
    messagesLoading,
    error,
    fetchConversations,
    fetchMessages,
    sendMessage,
    startConversation,
    selectConversation,
    fetchUnreadCount,
    setError
  };

  return (
    <MessageContext.Provider value={value}>
      {children}
    </MessageContext.Provider>
  );
};
