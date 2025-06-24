import React from 'react';
import { Link } from 'react-router-dom';

const FollowersModal = ({ title, users, loading, onClose }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
    <div className="bg-[#18181b] rounded-lg shadow-lg w-full max-w-md p-6 relative">
      <button
        className="absolute top-3 right-3 text-gray-400 hover:text-white"
        onClick={onClose}
        aria-label="Close"
      >
        &times;
      </button>
      <h2 className="text-xl font-semibold text-white mb-4">{title}</h2>
      <div className="max-h-80 overflow-y-auto">
        {loading ? (
          <div className="text-gray-400 text-center py-8">Loading...</div>
        ) : users.length === 0 ? (
          <div className="text-gray-400 text-center py-8">No users found.</div>
        ) : (
          users.map((user) => (
            <Link
              to={`/profile/${user.username}`}
              key={user._id}
              className="flex items-center gap-3 py-2 px-2 rounded hover:bg-[#232329] transition"
              onClick={onClose}
            >
              <img
                src={user.avatar}
                alt={user.username}
                className="w-8 h-8 rounded-full object-cover border border-[#232329]"
              />
              <span className="text-white font-medium">{user.username}</span>
            </Link>
          ))
        )}
      </div>
    </div>
  </div>
);

export default FollowersModal;
