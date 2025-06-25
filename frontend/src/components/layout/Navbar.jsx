import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Bell } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../contexts/NotificationContext';
import { Link } from 'react-router-dom';
import NotificationDropdown from './NotificationDropdown';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { unreadCount, fetchUnreadCount } = useNotifications();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const notificationsRef = useRef(null);

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setIsNotificationsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch unread count on component mount
  useEffect(() => {
    if (user) {
      fetchUnreadCount();
      // Set up polling for real-time updates (every 2 minutes instead of 30 seconds)
      const interval = setInterval(fetchUnreadCount, 120000);
      return () => clearInterval(interval);
    }
  }, [user, fetchUnreadCount]);

  // Avatar por defecto si no tiene imagen
  const getAvatarSrc = () => {
    if (user?.avatar) {
      return user.avatar;
    }
    // Avatar por defecto con las iniciales del usuario
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.username || 'User')}&background=262626&color=ffffff&size=32`;
  };

  const handleLogout = () => {
    logout();
    setIsDropdownOpen(false);
  };

  return (
    <nav className="bg-black border-b border-gray-800/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Link to="/" className="text-white text-xl font-medium hover:text-gray-300 transition-colors">
                ImagePost
              </Link>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              <Link to="/" className="text-gray-300 hover:text-white px-3 py-2 text-sm font-medium transition-colors">
                Home
              </Link>
              <Link to="/search" className="text-gray-300 hover:text-white px-3 py-2 text-sm font-medium transition-colors">
                Search
              </Link>
              <Link to="/explore" className="text-gray-300 hover:text-white px-3 py-2 text-sm font-medium transition-colors">
                Explore
              </Link>
              <Link to="/create-post" className="text-gray-300 hover:text-white px-3 py-2 text-sm font-medium transition-colors">
                Create
              </Link>
            </div>
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <div className="relative" ref={notificationsRef}>
              <button
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className="relative text-gray-300 hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black rounded-lg transition-all p-2"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </button>

              <NotificationDropdown
                isOpen={isNotificationsOpen}
                onClose={() => setIsNotificationsOpen(false)}
              />
            </div>

            {/* User Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center space-x-2 text-gray-300 hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black rounded-lg transition-all"
              >
                <img
                  className="h-8 w-8 rounded-full border border-gray-700"
                  src={getAvatarSrc()}
                  alt={`${user?.username}'s avatar`}
                />
                <span className="hidden md:block text-sm font-medium">{user?.username}</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Menu */}
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-black border border-gray-800 rounded-lg shadow-lg py-1 z-50">
                  <div className="px-4 py-2 border-b border-gray-800">
                    <p className="text-sm text-white font-medium">{user?.username}</p>
                    <p className="text-xs text-gray-400">{user?.email}</p>
                  </div>
                  
                  <Link
                    to={`/profile/${user?.username}`}
                    className="block px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-900 transition-colors"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    Profile
                  </Link>
                  <Link
                    to="/settings"
                    className="block px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-900 transition-colors"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    Settings
                  </Link>
                  
                  <div className="border-t border-gray-800 mt-1">
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-gray-900 transition-colors"
                    >
                      Sign out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className="md:hidden">
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t border-gray-800">
          <Link to="/" className="text-gray-300 hover:text-white block px-3 py-2 text-base font-medium">
            Home
          </Link>
          <Link to="/search" className="text-gray-300 hover:text-white block px-3 py-2 text-base font-medium">
            Search
          </Link>
          <Link to="/explore" className="text-gray-300 hover:text-white block px-3 py-2 text-base font-medium">
            Explore
          </Link>
          <Link to="/create-post" className="text-gray-300 hover:text-white block px-3 py-2 text-base font-medium">
            Create
          </Link>
        </div>
      </div>
    </nav>
  );
};


export default Navbar;
