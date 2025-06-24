import { User } from 'lucide-react';

const UserCard = ({ user }) => (
  <div
    className="group bg-black border border-neutral-900 rounded-2xl shadow-xl flex flex-col items-center justify-center p-6 hover:border-white transition-colors cursor-pointer relative"
  >
    <div className="w-20 h-20 rounded-full bg-neutral-900 flex items-center justify-center overflow-hidden border-2 border-neutral-800 shadow group-hover:ring-2 group-hover:ring-white transition mb-3">
      {user.avatar ? (
        <img src={user.avatar} alt={user.username} className="w-full h-full object-cover" />
      ) : (
        <User className="w-10 h-10 text-gray-600" />
      )}
    </div>
    <div className="text-white font-semibold text-lg tracking-wide">
      {user.username}
    </div>
    {user.bio && (
      <div className="text-gray-400 text-sm text-center mt-1 line-clamp-2 max-w-[180px]">
        {user.bio}
      </div>
    )}
    <div className="flex gap-4 mt-3">
      <span className="text-xs text-gray-400">
        <span className="font-semibold text-white">
          {user.followersCount ?? user.followers?.length ?? 0}
        </span> followers
      </span>
      <span className="text-xs text-gray-400">
        <span className="font-semibold text-white">
          {user.postsCount ?? (Array.isArray(user.posts) ? user.posts.length : 0)}
        </span> posts
      </span>
    </div>
  </div>
);


export default UserCard;
