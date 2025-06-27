import { useState, useEffect } from 'react';
import { Search, User } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const NewChatModal = ({ 
  showNewChat, 
  setShowNewChat, 
  startConversation, 
  selectConversation, 
  user, 
  error 
}) => {
  const [searchUsername, setSearchUsername] = useState('');
  const [startingChat, setStartingChat] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // Función para buscar usuarios
  const searchUsers = async (query) => {
    if (!query.trim() || query.length < 2) {
      setSearchResults([]);
      return;
    }

    try {
      setSearchLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/users/search?q=${encodeURIComponent(query)}&limit=5`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        // Filtrar al usuario actual de los resultados
        const filteredUsers = data.users.filter(u => u._id !== user?.id);
        setSearchResults(filteredUsers);
      }
    } catch (err) {
      console.error('Error searching users:', err);
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

  // Efecto para buscar usuarios mientras se escribe
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchUsers(searchUsername);
    }, 300); // Debounce de 300ms

    return () => clearTimeout(timeoutId);
  }, [searchUsername]);

  const handleUserSelect = (selectedUser) => {
    setSelectedUser(selectedUser);
    setSearchUsername(selectedUser.username);
    setSearchResults([]);
  };

  const handleStartNewChat = async (e) => {
    e.preventDefault();
    if (!selectedUser || startingChat) return;

    try {
      setStartingChat(true);
      const conversation = await startConversation(selectedUser.username);
      selectConversation(conversation);
      resetNewChatModal();
    } catch (err) {
      console.error('Error starting conversation:', err);
    } finally {
      setStartingChat(false);
    }
  };

  const resetNewChatModal = () => {
    setShowNewChat(false);
    setSearchUsername('');
    setSelectedUser(null);
    setSearchResults([]);
  };

  if (!showNewChat) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-black border border-neutral-800 rounded-lg w-full max-w-md">
        <div className="p-4 border-b border-neutral-800">
          <h3 className="text-white font-semibold">New Message</h3>
        </div>
        <form onSubmit={handleStartNewChat} className="p-4">
          <div className="mb-4">
            <label className="block text-gray-300 text-sm mb-2">
              Search Users
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                value={searchUsername}
                onChange={(e) => {
                  setSearchUsername(e.target.value);
                  setSelectedUser(null); // Reset selected user when typing
                }}
                placeholder="Search by username..."
                className="w-full pl-10 pr-4 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-gray-600 transition-colors"
                disabled={startingChat}
                autoComplete="off"
              />
              {searchLoading && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-500"></div>
                </div>
              )}
            </div>

            {/* Resultados de búsqueda */}
            {searchResults.length > 0 && (
              <div className="mt-2 bg-neutral-900 border border-neutral-800 rounded-lg max-h-48 overflow-y-auto">
                {searchResults.map((searchUser) => (
                  <button
                    key={searchUser._id}
                    type="button"
                    onClick={() => handleUserSelect(searchUser)}
                    className="w-full p-3 text-left hover:bg-neutral-800 transition-colors border-b border-neutral-800 last:border-b-0"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center overflow-hidden">
                        {searchUser.avatar ? (
                          <img 
                            src={searchUser.avatar} 
                            alt={searchUser.username}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <User className="w-5 h-5 text-gray-600" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-white font-medium text-sm">
                          {searchUser.username}
                        </p>
                        {searchUser.bio && (
                          <p className="text-gray-400 text-xs truncate">
                            {searchUser.bio}
                          </p>
                        )}
                        <p className="text-gray-500 text-xs">
                          {searchUser.followersCount || 0} followers • {searchUser.postsCount || 0} posts
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Usuario seleccionado */}
            {selectedUser && (
              <div className="mt-2 p-3 bg-neutral-800 border border-neutral-700 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center overflow-hidden">
                    {selectedUser.avatar ? (
                      <img 
                        src={selectedUser.avatar} 
                        alt={selectedUser.username}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-4 h-4 text-gray-600" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-medium text-sm">
                      {selectedUser.username}
                    </p>
                    <p className="text-gray-300 text-xs">Selected</p>
                  </div>
                </div>
              </div>
            )}

            {/* No results */}
            {searchUsername.trim() && !searchLoading && searchResults.length === 0 && searchUsername.length >= 2 && (
              <div className="mt-2 p-3 text-center text-gray-400 text-sm">
                No users found matching "{searchUsername}"
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={resetNewChatModal}
              className="flex-1 px-4 py-2 bg-neutral-800 text-white rounded-lg hover:bg-neutral-700 transition-colors"
              disabled={startingChat}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!selectedUser || startingChat}
              className="flex-1 px-4 py-2 bg-neutral-600 text-white rounded-lg hover:bg-neutral-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {startingChat ? 'Starting...' : 'Start Chat'}
            </button>
          </div>
        </form>
        {error && (
          <div className="px-4 pb-4">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NewChatModal;
