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
      setLoading(true);
      const response = await messageService.getMessages(conversationId);
      setMessages(response.messages || []);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching messages:', err);
    } finally {
      setLoading(false);
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
    } else {
      setMessages([]);
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

  const value = {
    conversations,
    currentConversation,
    messages,
    unreadCount,
    loading,
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
