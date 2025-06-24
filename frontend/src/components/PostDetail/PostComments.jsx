import { Link } from 'react-router-dom';
import { User, Loader2, Send, Trash2 } from 'lucide-react';

const PostComments = ({
  post,
  user,
  comment,
  setComment,
  commentLoading,
  commentError,
  handleCommentSubmit,
  onDeleteComment,
  isPostAuthor
}) => (
  <div className="mt-8">
    <h3 className="text-base font-medium text-gray-400 mb-3 tracking-wide">
      Comments
      <span className="ml-2 text-white font-semibold">
        ({post.comments?.length || 0})
      </span>
    </h3>
    {user && (
      <form
        onSubmit={handleCommentSubmit}
        className="flex items-center gap-2 mb-4"
        autoComplete="off"
      >
        <input
          type="text"
          className="flex-1 px-4 py-2 rounded-full bg-neutral-900 text-white border border-neutral-800 focus:border-blue-500 outline-none text-sm"
          placeholder="Add a comment..."
          value={comment}
          onChange={e => setComment(e.target.value)}
          maxLength={200}
          disabled={commentLoading}
        />
        <button
          type="submit"
          className="p-2 rounded-full bg-blue-600 hover:bg-blue-700 transition disabled:opacity-60"
          disabled={commentLoading || !comment.trim()}
          aria-label="Send"
        >
          {commentLoading ? (
            <Loader2 className="w-4 h-4 animate-spin text-white" />
          ) : (
            <Send className="w-4 h-4 text-white" />
          )}
        </button>
      </form>
    )}
    {commentError && (
      <div className="text-red-500 text-xs mb-2">{commentError}</div>
    )}
    <div className="space-y-4 max-h-56 overflow-y-auto pr-2">
      {post.comments && post.comments.length > 0 ? (
        [...post.comments]
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .map((c, i) => {
            // Helper para comparar IDs como string
            const isCommentAuthor =
              user &&
              (String(c.user?._id || c.user?.id) === String(user._id || user.id));
            const canDelete = isCommentAuthor || isPostAuthor;
            return (
              <div
                key={i}
                className="flex items-start gap-3 bg-black/70 rounded-lg px-4 pt-3 pr-4 pl-4 relative"
                style={{ marginTop: i === 0 ? '4px' : undefined }}
              >
                <Link
                  to={`/profile/${c.user?.username}`}
                  className="w-9 h-9 rounded-full bg-neutral-900 flex items-center justify-center overflow-hidden border border-neutral-800 hover:ring-2 hover:ring-blue-600 transition"
                  title={c.user?.username}
                >
                  {c.user?.avatar ? (
                    <img src={c.user.avatar} alt={c.user.username} className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-5 h-5 text-gray-600" />
                  )}
                </Link>
                <div className="flex-1">
                  <Link
                    to={`/profile/${c.user?.username}`}
                    className="text-xs text-white font-medium tracking-wide hover:underline"
                  >
                    {c.user?.username || 'User'}
                  </Link>
                  <div className="text-sm text-gray-300 font-normal">{c.text}</div>
                  <div className="text-[10px] text-gray-700 font-normal">{new Date(c.createdAt).toLocaleString()}</div>
                </div>
                {canDelete && (
                  <button
                    className="absolute top-2 right-2 p-1 rounded hover:bg-neutral-800 transition"
                    title="Delete comment"
                    onClick={() => onDeleteComment(c._id)}
                  >
                    <Trash2 className="w-4 h-4 text-red-400" />
                  </button>
                )}
              </div>
            );
          })
      ) : (
        <div className="text-gray-700 text-xs font-normal">No comments yet.</div>
      )}
    </div>
  </div>
);




export default PostComments;
