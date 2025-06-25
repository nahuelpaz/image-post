import { useState, useEffect } from 'react';
import { Heart, MessageCircle, UserPlus, Trash2, ArrowLeft } from 'lucide-react';
import { useNotifications } from '../contexts/NotificationContext';
import { Link, useNavigate } from 'react-router-dom';

const NotificationsPage = () => {
  const {
    notifications: contextNotifications,
    fetchNotifications: fetchContextNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    loading
  } = useNotifications();
  
  const [pageNotifications, setPageNotifications] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadPageNotifications();
  }, []);

  const loadPageNotifications = async (pageNum = 1) => {
    const result = await fetchContextNotifications(pageNum, 20);
    
    if (pageNum === 1) {
      setPageNotifications(result.notifications);
    } else {
      setPageNotifications(prev => [...prev, ...result.notifications]);
    }
    setHasMore(result.hasMore);
    setPage(pageNum);
  };

  const handleMarkAsRead = async (notificationId) => {
    await markAsRead(notificationId);
    // Update local page state
    setPageNotifications(prev => 
      prev.map(notif => 
        notif._id === notificationId 
          ? { ...notif, read: true }
          : notif
      )
    );
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
    // Update local page state
    setPageNotifications(prev => 
      prev.map(notif => ({ ...notif, read: true }))
    );
  };

  const handleDeleteNotification = async (notificationId) => {
    await deleteNotification(notificationId);
    // Update local page state
    setPageNotifications(prev => 
      prev.filter(notif => notif._id !== notificationId)
    );
  };

  const loadMore = () => {
    if (!loading && hasMore) {
      loadPageNotifications(page + 1);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'like':
        return <Heart className="w-5 h-5 text-red-500" />;
      case 'comment':
        return <MessageCircle className="w-5 h-5 text-blue-500" />;
      case 'follow':
        return <UserPlus className="w-5 h-5 text-green-500" />;
      default:
        return <Heart className="w-5 h-5 text-gray-500" />;
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
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return date.toLocaleDateString();
  };

  const getNotificationLink = (notification) => {
    if (notification.post) {
      // Extract the post ID correctly
      const postId = typeof notification.post === 'object' ? notification.post._id : notification.post;
      
      // Si es una notificación de comentario y tiene ID de comentario, agregarlo como hash
      if (notification.type === 'comment' && notification.comment) {
        return `/post/${postId}#comment-${notification.comment}`;
      }
      
      return `/post/${postId}`;
    }
    if (notification.type === 'follow') {
      return `/profile/${notification.sender.username}`;
    }
    return '#';
  };

  const unreadCount = pageNotifications.filter(n => !n.read).length;

  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate(-1)}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-white">Notifications</h1>
              {unreadCount > 0 && (
                <p className="text-sm text-gray-400">{unreadCount} unread</p>
              )}
            </div>
          </div>
          
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors"
            >
              Mark all as read
            </button>
          )}
        </div>

        {/* Notifications List */}
        {loading && pageNotifications.length === 0 ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
            <p className="text-gray-400 mt-4">Loading notifications...</p>
          </div>
        ) : pageNotifications.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-600 mb-4">
              <Heart className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-white mb-2">No notifications yet</h3>
            <p className="text-gray-400">When you get likes, comments, or new followers, they'll appear here.</p>
          </div>
        ) : (
          <div className="space-y-1">
            {pageNotifications.map((notification) => (
              <div
                key={notification._id}
                className={`bg-neutral-950 border border-gray-800 rounded-lg p-4 hover:bg-gray-900/50 transition-colors group relative ${
                  !notification.read ? 'border-blue-500/30 bg-blue-500/5' : ''
                }`}
              >
                <div className="flex items-start space-x-4">
                  {/* Notification Icon */}
                  <div className="flex-shrink-0 mt-1">
                    {getNotificationIcon(notification.type)}
                  </div>

                  {/* Notification Content */}
                  <div className="flex-1 min-w-0">
                    <Link
                      to={getNotificationLink(notification)}
                      onClick={() => {
                        if (!notification.read) {
                          handleMarkAsRead(notification._id);
                        }
                      }}
                      className="block"
                    >
                      <div className="flex items-start space-x-3">
                        {/* Sender Avatar */}
                        <img
                          src={notification.sender.avatar || 
                            `https://ui-avatars.com/api/?name=${encodeURIComponent(notification.sender.username)}&background=262626&color=ffffff&size=40`}
                          alt={notification.sender.username}
                          className="w-10 h-10 rounded-full border border-gray-700"
                        />
                        
                        <div className="flex-1">
                          <p className="text-white">
                            <span className="text-gray-300">{notification.message}</span>
                          </p>
                          <p className="text-sm text-gray-500 mt-1">
                            {formatTimeAgo(notification.createdAt)}
                          </p>
                        </div>
                      </div>
                    </Link>
                  </div>

                  {/* Delete Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteNotification(notification._id);
                    }}
                    className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-red-400 transition-all p-2"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Unread Indicator */}
                {!notification.read && (
                  <div className="absolute left-2 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-blue-500 rounded-full"></div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Load More Button */}
        {hasMore && pageNotifications.length > 0 && (
          <div className="text-center mt-8">
            <button
              onClick={loadMore}
              disabled={loading}
              className="px-6 py-2 bg-neutral-950 border border-gray-800 text-white rounded-lg hover:bg-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Loading...' : 'Load More'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
