import { Link } from 'react-router-dom';
import { User, Download, Heart, MessageCircle } from 'lucide-react';

const PostInfo = ({
  post,
  user,
  isLiked,
  likeLoading,
  handleLike,
  handleDownloadAll,
}) => (
  <>
    <div className="flex items-center justify-between gap-5">
      <Link
        to={`/profile/${post.author?.username}`}
        className="flex items-center gap-5 group"
        title={post.author?.username}
      >
        <div className="w-14 h-14 rounded-full bg-neutral-900 flex items-center justify-center overflow-hidden border-2 border-neutral-800 shadow-lg group-hover:ring-2 group-hover:ring-blue-600 transition">
          {post.author?.avatar ? (
            <img src={post.author.avatar} alt={post.author.username} className="w-full h-full object-cover" />
          ) : (
            <User className="w-8 h-8 text-gray-600" />
          )}
        </div>
        <div>
          <div className="text-white font-medium text-base tracking-wide">
            {post.author?.username || 'Unknown'}
          </div>
          <div className="text-xs text-gray-600 font-normal tracking-wide">{new Date(post.createdAt).toLocaleDateString()}</div>
        </div>
      </Link>
      {post.images && post.images.length > 1 && (
        <button
          onClick={handleDownloadAll}
          className="flex items-center gap-1 px-2 py-1 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 rounded text-white text-xs font-medium transition whitespace-nowrap"
          title="Download all images as ZIP"
          style={{ minWidth: 0 }}
        >
          <Download className="w-4 h-4" />
          Download all
        </button>
      )}
    </div>
    <div>
      <h1 className="text-lg font-semibold text-white mb-3 leading-tight tracking-wide">{post.title}</h1>
      {post.description && (
        <p className="text-gray-300 text-base mb-2 font-normal">{post.description}</p>
      )}
      {post.tags?.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-3">
          {post.tags.map((tag, i) => (
            <span key={i} className="bg-neutral-900 text-white px-3 py-1 rounded-full text-xs font-medium shadow border border-neutral-800 tracking-wide">{`#${tag}`}</span>
          ))}
        </div>
      )}
    </div>
    <div className="flex items-center gap-8 mt-2">
      <button
        onClick={handleLike}
        disabled={likeLoading || !user}
        className={`flex items-center gap-2 transition text-base font-medium focus:outline-none ${
          isLiked ? 'text-pink-500' : 'text-white hover:text-pink-500'
        }`}
        title={user ? (isLiked ? 'Unlike' : 'Like') : 'Login to like'}
      >
        <Heart className={`w-6 h-6 ${isLiked ? 'fill-pink-500' : 'fill-none'}`} />
        <span>{post.likes?.length || 0}</span>
      </button>
      <span className="flex items-center gap-2 text-white text-base font-medium">
        <MessageCircle className="w-6 h-6" />
        <span>{post.comments?.length || 0}</span>
      </span>
      <span className="text-gray-700 text-sm font-normal">{post.views || 0} views</span>
    </div>
  </>
);

export default PostInfo;
