import { useNavigate } from 'react-router-dom';
import { Heart, MessageCircle } from 'lucide-react';

const ProfilePosts = ({ posts, loading, hasMore, onLoadMore }) => {
  const navigate = useNavigate();

  if (loading && posts.length === 0) {
    return (
      <div className="mt-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="aspect-square bg-gray-800 rounded-lg animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[300px] text-center">
        <div>
          <h3 className="text-xl font-light text-white mb-4">No posts yet</h3>
          <p className="text-gray-400">When you share photos, they'll appear here.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-8">
      <div className="text-center py-4 border-t border-gray-800 mb-8">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-400">Posts</h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map((post) => (
          <div 
            key={post._id} 
            className="cursor-pointer transform hover:-translate-y-1 transition-transform duration-200"
            onClick={() => navigate(`/post/${post._id}`)}
          >
            <div className="relative aspect-square bg-gray-800 rounded-lg overflow-hidden group">
              <img 
                src={post.images?.[0]?.url || 'https://via.placeholder.com/400x400/262626/ffffff?text=Image'} 
                alt={post.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <div className="flex gap-4 text-white font-semibold">
                  <span className="flex items-center gap-1">
                    <Heart className="w-4 h-4" />
                    {post.likesCount || 0}
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageCircle className="w-4 h-4" />
                    {post.commentsCount || 0}
                  </span>
                </div>
              </div>
            </div>
            <div className="pt-2">
              <h4 className="text-sm font-medium text-white truncate">{post.title}</h4>
            </div>
          </div>
        ))}
      </div>

      {hasMore && (
        <div className="flex justify-center mt-12">
          <button 
            onClick={onLoadMore}
            disabled={loading}
            className="px-8 py-3 bg-transparent border border-gray-600 text-white font-semibold rounded hover:bg-gray-900 transition-colors disabled:opacity-50"
          >
            {loading ? 'Loading...' : 'Load More'}
          </button>
        </div>
      )}
    </div>
  );
};

export default ProfilePosts;
