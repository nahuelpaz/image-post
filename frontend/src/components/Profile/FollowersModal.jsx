import React from 'react';
import { Link } from 'react-router-dom';
import { X } from 'lucide-react';

const FollowersModal = ({ title, users, loading, onClose }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm">
    <div className="bg-black border border-neutral-900 p-8 rounded-2xl shadow-2xl w-full max-w-md flex flex-col gap-4 relative">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-xl text-white font-semibold">{title}</h2>
        <button
          type="button"
          className="p-2 rounded-full hover:bg-neutral-900 transition"
          onClick={onClose}
          aria-label="Close"
        >
          <X className="w-5 h-5 text-gray-400 hover:text-white" />
        </button>
      </div>
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
              className="flex items-center gap-3 py-2 px-2 rounded-xl hover:bg-neutral-900 transition"
              onClick={onClose}
            >
              <img
                src={user.avatar}
                alt={user.username}
                className="w-9 h-9 rounded-full object-cover border-2 border-neutral-800 shadow"
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
