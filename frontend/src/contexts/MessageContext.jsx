import { createContext, useContext, useState, useEffect, useRef } from 'react';
import { messageService } from '../services/messageService';
import { useAuth } from './AuthContext';
import { io } from 'socket.io-client';

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
  const socketRef = useRef(null);

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
  const fetchMessages = async (conversationId, showLoading = true) => {
    try {
      if (showLoading) {
        setMessagesLoading(true);
        setMessages([]); // Limpiar mensajes solo si se muestra loading
      }
      const response = await messageService.getMessages(conversationId);
      setMessages(response.messages || []);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching messages:', err);
    } finally {
      if (showLoading) setMessagesLoading(false);
    }
  };

  // Enviar mensaje
  const sendMessage = async (recipientId, content, messageType = 'text') => {
    try {
      const response = await messageService.sendMessage(recipientId, content, messageType);
      // Después de enviar, recargar los mensajes desde el backend SIN mostrar loading
      if (currentConversation) {
        await fetchMessages(currentConversation._id, false);
      }
      // Actualizar la conversación actual en la lista de conversaciones
      setConversations(prevConvs => prevConvs.map(conv =>
        conv._id === currentConversation?._id
          ? { ...conv, lastMessage: response.data, updatedAt: response.data.createdAt }
          : conv
      ));
      // Actualizar contador de no leídos
      await fetchUnreadCount();
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Marcar mensajes como leídos en la conversación actual (sin recargar todos los mensajes)
  const markCurrentConversationAsRead = async () => {
    if (!currentConversation) return;
    try {
      // Obtener mensajes no leídos del usuario actual
      const unreadMessages = messages.filter(
        m => m.sender._id !== user?._id && m.sender._id !== user?.id && !(m.readBy || []).some(r => r.user === user?._id || r.user === user?.id)
      );
      // Marcar como leídos en el backend y actualizar localmente
      await Promise.all(unreadMessages.map(async (msg) => {
        await messageService.markMessageAsRead(msg._id);
      }));
      // Actualizar localmente los mensajes leídos para TODOS los mensajes recibidos
      setMessages(prevMsgs => prevMsgs.map(msg => {
        if (
          msg.sender._id !== user?._id && msg.sender._id !== user?.id &&
          !(msg.readBy || []).some(r => r.user === user?._id || r.user === user?.id)
        ) {
          return {
            ...msg,
            readBy: [...(msg.readBy || []), { user: user?._id || user?.id }]
          };
        }
        return msg;
      }));
      // Actualizar contador y conversaciones
      await fetchUnreadCount();
      setConversations(prevConvs => prevConvs.map(conv =>
        conv._id === currentConversation._id ? { ...conv, unreadCount: 0 } : conv
      ));
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

  useEffect(() => {
    if (user) {
      // Conectar socket solo si hay usuario
      socketRef.current = io(import.meta.env.VITE_API_BASE_URL.replace('/api', ''), {
        withCredentials: true
      });
      socketRef.current.emit('join', user._id || user.id);

      // Escuchar mensajes nuevos
      socketRef.current.on('newMessage', async (message) => {
        setConversations(prevConvs => {
          // Si la conversación existe, actualiza lastMessage y unreadCount
          const idx = prevConvs.findIndex(c => c._id === message.conversation);
          if (idx !== -1) {
            const updated = [...prevConvs];
            updated[idx] = {
              ...updated[idx],
              lastMessage: message,
              unreadCount: updated[idx]._id === currentConversation?._id && document.hasFocus() ? 0 : (updated[idx].unreadCount || 0) + 1
            };
            // Ordenar por lastMessageAt si quieres
            return updated.sort((a, b) => new Date(b.lastMessage?.createdAt) - new Date(a.lastMessage?.createdAt));
          } else {
            // Si es una nueva conversación
            return [
              {
                _id: message.conversation,
                participants: [
                  { _id: message.sender._id, username: message.sender.username, avatar: message.sender.avatar },
                  { _id: user._id || user.id, username: user.username, avatar: user.avatar }
                ],
                lastMessage: message,
                unreadCount: 1
              },
              ...prevConvs
            ];
          }
        });
        // Si el usuario está en la conversación actual, agregar el mensaje
        if (currentConversation && message.conversation === currentConversation._id) {
          setMessages(prevMsgs => {
            if (prevMsgs.some(m => m._id === message._id)) return prevMsgs;
            return [...prevMsgs, message];
          });
          // Si la ventana está activa, marcar como leído automáticamente
          if (document.hasFocus()) {
            await markCurrentConversationAsRead();
          }
        }
      });

      return () => {
        socketRef.current.disconnect();
      };
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
