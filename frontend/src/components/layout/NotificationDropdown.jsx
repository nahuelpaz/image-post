import { useState, useEffect } from 'react';
import { X, Heart, MessageCircle, UserPlus, Trash2 } from 'lucide-react';
import { useNotifications } from '../../contexts/NotificationContext';
import { Link } from 'react-router-dom';

const NotificationDropdown = ({ isOpen, onClose }) => {
  const {
    fetchNotifications: fetchContextNotifications,
    markAsRead,
    markAllAsRead,
    loading
  } = useNotifications();
  
  const [dropdownNotifications, setDropdownNotifications] = useState([]);
  const [hiddenNotifications, setHiddenNotifications] = useState(new Set());

  useEffect(() => {
    if (isOpen) {
      // Cargar notificaciones ocultas del localStorage PRIMERO
      const hidden = JSON.parse(localStorage.getItem('hiddenDropdownNotifications') || '[]');
      setHiddenNotifications(new Set(hidden));
      
      // Cargar notificaciones inmediatamente después de cargar las ocultas
      const loadNotifications = async () => {
        const result = await fetchContextNotifications(1, 10);
        const visibleNotifications = result.notifications.filter(
          notif => !new Set(hidden).has(notif._id)
        );
        setDropdownNotifications(visibleNotifications);
      };
      
      loadNotifications();
    }
  }, [isOpen]);

  // Remover el segundo useEffect ya que ahora todo está en uno

  const loadDropdownNotifications = async () => {
    const result = await fetchContextNotifications(1, 10); // Only show latest 10 in dropdown
    // Filter out hidden notifications
    const visibleNotifications = result.notifications.filter(
      notif => !hiddenNotifications.has(notif._id)
    );
    setDropdownNotifications(visibleNotifications);
  };

  const handleMarkAsRead = async (notificationId) => {
    await markAsRead(notificationId);
    // Update local dropdown state
    setDropdownNotifications(prev => 
      prev.map(notif => 
        notif._id === notificationId 
          ? { ...notif, read: true }
          : notif
      )
    );
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
    // Update local dropdown state
    setDropdownNotifications(prev => 
      prev.map(notif => ({ ...notif, read: true }))
    );
  };

  const handleClearAll = async () => {
    // Ocultar todas las notificaciones del dropdown (como Instagram)
    const allNotificationIds = dropdownNotifications.map(notif => notif._id);
    
    // Actualizar estado local inmediatamente
    const newHidden = new Set([...hiddenNotifications, ...allNotificationIds]);
    setHiddenNotifications(newHidden);
    setDropdownNotifications([]);
    
    // Guardar en localStorage para persistir entre sesiones
    const hidden = JSON.parse(localStorage.getItem('hiddenDropdownNotifications') || '[]');
    const updatedHidden = [...new Set([...hidden, ...allNotificationIds])];
    localStorage.setItem('hiddenDropdownNotifications', JSON.stringify(updatedHidden));
  };

  const handleHideFromDropdown = async (notificationId) => {
    // Solo ocultar del dropdown, NO borrar del servidor
    setHiddenNotifications(prev => new Set([...prev, notificationId]));
    setDropdownNotifications(prev => 
      prev.filter(notif => notif._id !== notificationId)
    );
    
    // Guardar en localStorage para persistir entre sesiones
    const hidden = JSON.parse(localStorage.getItem('hiddenDropdownNotifications') || '[]');
    hidden.push(notificationId);
    localStorage.setItem('hiddenDropdownNotifications', JSON.stringify(hidden));
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'like':
        return <Heart className="w-4 h-4 text-red-500" />;
      case 'comment':
        return <MessageCircle className="w-4 h-4 text-blue-500" />;
      case 'follow':
        return <UserPlus className="w-4 h-4 text-green-500" />;
      default:
        return <Heart className="w-4 h-4 text-gray-500" />;
    }
  };

  const formatTimeAgo = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMs = now - date;
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInMinutes < 1) return 'now';
    if (diffInMinutes < 60) return `${diffInMinutes}m`;
    if (diffInHours < 24) return `${diffInHours}h`;
    if (diffInDays < 7) return `${diffInDays}d`;
    return date.toLocaleDateString();
  };

  const getNotificationLink = (notification) => {
    
    if (notification.post) {
      // Extract the post ID correctly
      const postId = typeof notification.post === 'object' ? notification.post._id : notification.post;
      
      // Si es una notificación de comentario y tiene ID de comentario, agregarlo como hash
      if (notification.type === 'comment' && notification.comment) {
        const link = `/post/${postId}#comment-${notification.comment}`;
        return link;
      }
      
      return `/post/${postId}`;
    }
    if (notification.type === 'follow') {
      return `/profile/${notification.sender.username}`;
    }
    return '#';
  };

  if (!isOpen) return null;

  return (
    <div className="absolute right-0 mt-2 w-80 bg-black border border-gray-800 rounded-lg shadow-xl z-50 max-h-96 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-800">
        <h3 className="text-white font-semibold">Notifications</h3>
        <div className="flex items-center space-x-2">
          {dropdownNotifications.length > 0 && (
            <>
              <button
                onClick={handleClearAll}
                className="text-xs text-red-400 hover:text-red-300 transition-colors"
              >
                Clear all
              </button>
              {dropdownNotifications.some(n => !n.read) && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                >
                  Mark all read
                </button>
              )}
            </>
          )}
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Notifications List */}
      <div className="max-h-80 overflow-y-auto">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mx-auto"></div>
            <p className="text-gray-400 text-sm mt-2">Loading notifications...</p>
          </div>
        ) : dropdownNotifications.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-400 text-sm">No notifications yet</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-800">
            {dropdownNotifications.map((notification) => (
              <div
                key={notification._id}
                className={`p-4 hover:bg-gray-900/50 transition-colors group ${
                  !notification.read ? 'bg-gray-900/30' : ''
                }`}
              >
                <div className="flex items-start space-x-3">
                  {/* Notification Icon */}
                  <div className="flex-shrink-0 mt-1">
                    {getNotificationIcon(notification.type)}
                  </div>

                  {/* Notification Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <Link
                          to={getNotificationLink(notification)}
                          onClick={() => {
                            if (!notification.read) {
                              handleMarkAsRead(notification._id);
                            }
                            onClose();
                          }}
                          className="block"
                        >
                          <div className="flex items-center space-x-2">
                            {/* Sender Avatar */}
                            <img
                              src={notification.sender.avatar || 
                                `https://ui-avatars.com/api/?name=${encodeURIComponent(notification.sender.username)}&background=262626&color=ffffff&size=24`}
                              alt={notification.sender.username}
                              className="w-6 h-6 rounded-full"
                            />                          <div className="flex-1">
                            <p className="text-sm text-white">
                              <span className="text-gray-300">{notification.message}</span>
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {formatTimeAgo(notification.createdAt)}
                            </p>
                          </div>
                          </div>
                        </Link>
                      </div>

                      {/* Hide Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleHideFromDropdown(notification._id);
                        }}
                        className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-red-400 transition-all p-1"
                        title="Hide from dropdown"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>

                    {/* Unread Indicator */}
                    {!notification.read && (
                      <div className="absolute left-2 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-blue-500 rounded-full"></div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-gray-800 text-center">
        <Link
          to="/notifications"
          onClick={onClose}
          className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
        >
          View all notifications
        </Link>
      </div>
    </div>
  );
};

export default NotificationDropdown;
