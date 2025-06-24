import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Heart, MessageCircle, ArrowLeft, Loader2, User, Send, ChevronLeft, ChevronRight, Download } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

const API_BASE_URL = 'http://localhost:5000/api';

const PostDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [likeLoading, setLikeLoading] = useState(false);
  const [error, setError] = useState('');
  // Comentario
  const [comment, setComment] = useState('');
  const [commentLoading, setCommentLoading] = useState(false);
  const [commentError, setCommentError] = useState('');
  const [activeImage, setActiveImage] = useState(0);

  // Determina si el usuario actual ya dio like
  const isLiked = user && post?.likes?.some(like => {
    if (typeof like === 'object' && like.user) {
      return like.user === user._id || like.user === user.id;
    }
    return like === user._id || like === user.id;
  });

  useEffect(() => {
    const fetchPost = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await fetch(`${API_BASE_URL}/posts/${id}`, {
          headers: localStorage.getItem('token')
            ? { Authorization: `Bearer ${localStorage.getItem('token')}` }
            : {},
        });
        if (!res.ok) throw new Error('Post not found');
        const data = await res.json();
        setPost(data.post);
      } catch (err) {
        setError(err.message || 'Error loading post');
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [id]);

  useEffect(() => {
    setActiveImage(0); // Reset to first image when post changes
  }, [post?._id]);

  const handleLike = async () => {
    if (!post || !user) return;
    setLikeLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/posts/${post._id}/like`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (res.ok) {
        // Recarga el post para actualizar likes y mantener la lógica, pero sin sumar view
        const updated = await fetch(`${API_BASE_URL}/posts/${post._id}?countView=false`, {
          headers: token ? { 'Authorization': `Bearer ${token}` } : {},
        });
        if (updated.ok) {
          const updatedData = await updated.json();
          setPost(updatedData.post);
        }
      }
    } finally {
      setLikeLoading(false);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;
    setCommentLoading(true);
    setCommentError('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/comments/${post._id}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: comment }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Failed to add comment');
      }
      setComment('');
      // Recarga comentarios sin sumar view
      const updated = await fetch(`${API_BASE_URL}/posts/${post._id}?countView=false`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {},
      });
      if (updated.ok) {
        const updatedData = await updated.json();
        setPost(updatedData.post);
      }
    } catch (err) {
      setCommentError(err.message || 'Failed to add comment');
    } finally {
      setCommentLoading(false);
    }
  };

  // Descargar imagen individual
  const handleDownloadImage = async (img) => {
    const response = await fetch(img.url);
    const blob = await response.blob();
    const ext = img.format ? `.${img.format}` : '';
    saveAs(blob, img.filename || `image${ext}`);
  };

  // Descargar todas las imágenes como ZIP
  const handleDownloadAll = async () => {
    if (!post.images || post.images.length === 0) return;
    const zip = new JSZip();
    // Descarga cada imagen y la agrega al zip
    await Promise.all(
      post.images.map(async (img, idx) => {
        const response = await fetch(img.url);
        const blob = await response.blob();
        const ext = img.format ? `.${img.format}` : '';
        zip.file(img.filename || `image${idx + 1}${ext}`, blob);
      })
    );
    const content = await zip.generateAsync({ type: 'blob' });
    saveAs(content, `${post.title?.replace(/\s+/g, '_') || 'images'}.zip`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen w-full bg-black">
        <Loader2 className="w-10 h-10 animate-spin text-white" />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center bg-black">
        <h2 className="text-2xl font-medium text-white mb-2 tracking-widest">Post not found</h2>
        <p className="text-gray-500">{error || 'This post does not exist.'}</p>
        <button
          onClick={() => navigate(-1)}
          className="mt-6 px-6 py-2 bg-neutral-900 text-white rounded-lg border border-neutral-800 hover:bg-neutral-800 transition font-medium tracking-widest"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-black flex flex-col items-center"
      style={{
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
      }}
    >
      {/* Sticky header */}
      <div className="sticky top-0 z-20 bg-black/95 backdrop-blur border-b border-neutral-900 flex items-center px-10 py-6 w-full max-w-7xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="mr-6 text-gray-400 hover:text-white transition-colors"
          aria-label="Back"
        >
          <ArrowLeft className="w-7 h-7" />
        </button>
        <h2 className="text-xl font-medium text-white tracking-wide">
          Post
        </h2>
      </div>

      <div className="w-full max-w-7xl mx-auto mt-12 mb-20 bg-black border border-neutral-900 rounded-3xl shadow-2xl flex flex-col md:flex-row overflow-hidden transition-all">
        {/* Image section with download buttons */}
        <div
          className="md:w-[70%] bg-black flex items-center justify-center p-12 border-r border-neutral-900 relative"
          style={{
            minHeight: 700,
            height: 700,
            maxHeight: 700,
          }}
        >
          {post.images && post.images.length > 0 && (
            <>
              {/* Download individual image */}
              <button
                onClick={() => handleDownloadImage(post.images[activeImage])}
                className="absolute top-6 right-6 bg-black/70 hover:bg-black/90 rounded-full p-2 z-20 border border-neutral-800 transition"
                title="Download this image"
              >
                <Download className="w-6 h-6 text-white" />
              </button>
              {/* Left arrow */}
              {post.images.length > 1 && activeImage > 0 && (
                <button
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 rounded-full p-2 z-10"
                  onClick={() => setActiveImage(i => Math.max(i - 1, 0))}
                  aria-label="Previous image"
                >
                  <ChevronLeft className="w-7 h-7 text-white" />
                </button>
              )}
              {/* Right arrow */}
              {post.images.length > 1 && activeImage < post.images.length - 1 && (
                <button
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 rounded-full p-2 z-10"
                  onClick={() => setActiveImage(i => Math.min(i + 1, post.images.length - 1))}
                  aria-label="Next image"
                >
                  <ChevronRight className="w-7 h-7 text-white" />
                </button>
              )}
              <div className="relative flex items-center justify-center w-full h-full">
                <Link
                  to={`/profile/${post.author?.username}`}
                  className="block w-full h-full"
                  tabIndex={-1}
                  aria-label={`Go to ${post.author?.username}'s profile`}
                  style={{ position: 'absolute', inset: 0, zIndex: 1 }}
                />
                <img
                  src={post.images[activeImage]?.url || 'https://via.placeholder.com/900x900/000000/ffffff?text=Image'}
                  alt={post.title}
                  className="rounded-2xl object-contain bg-black shadow-2xl"
                  style={{
                    maxWidth: '100%',
                    maxHeight: '100%',
                    width: 'auto',
                    height: 'auto',
                    display: 'block',
                    margin: '0 auto',
                    border: '4px solid #232323',
                    position: 'relative',
                    zIndex: 2
                  }}
                />
              </div>
              {/* Indicators */}
              {post.images.length > 1 && (
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
                  {post.images.map((_, idx) => (
                    <span
                      key={idx}
                      className={`block w-2.5 h-2.5 rounded-full ${activeImage === idx ? 'bg-white' : 'bg-gray-700'}`}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
        {/* Info section with "Download all" button aligned with username */}
        <div className="md:w-[30%] flex flex-col p-12 gap-8 bg-black">
          {/* Author + Download all */}
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
                {/* QUITA group-hover:underline */}
                <div className="text-white font-medium text-base tracking-wide">
                  {post.author?.username || 'Unknown'}
                </div>
                <div className="text-xs text-gray-600 font-normal tracking-wide">{new Date(post.createdAt).toLocaleDateString()}</div>
              </div>
            </Link>
            {/* Download all images as ZIP */}
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
          {/* Title & Description */}
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
          {/* Likes & Comments */}
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
          {/* Comments */}
          <div className="mt-8">
            <h3 className="text-base font-medium text-gray-400 mb-3 tracking-wide">
              Comments
              <span className="ml-2 text-white font-semibold">
                ({post.comments?.length || 0})
              </span>
            </h3>
            {/* Formulario para comentar */}
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
                  .map((c, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-3 bg-black/70 rounded-lg px-4 pt-3 pr-4 pl-4"
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
                    </div>
                  ))
              ) : (
                <div className="text-gray-700 text-xs font-normal">No comments yet.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};


export default PostDetail;
